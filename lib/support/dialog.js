/*
 Dialog is an in-game data driven display of Windows, text, and user choices.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.dialog'
)
.requires(
    'impact.game',
    'impact.font',

	'support.util',
	'support.window',
    'support.save'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Window = Support.window;
var Save = Support.save;

// TODO: nextstate must always be a string (might have some old lingering code)
// TODO: do a dictionary of all in game dialogs so they can be accessed by string name
// TODO: consider localizing each frame (eeek) - or maybe every second (could be limited to just the text translation part of changeToState
// TODO: overriding the base settings window array is weird, maybe another variable to combine the two?
// TODO: need an indicator for dialogs with no options (not glaringly obvious the user needs to provide input)

function Dialog(){}

// TODO prechache all the draw calls to getSetting

/*
 Initializes a dialog and displays it
 @param (object) entity - The entity the dialog is associated with
 @param (object) dialogData - The dialog data
 */
Dialog.prototype.initData = function(entity, dialogData)
{
    // TODO: a lot of caching... way to many getSetting calls
    // initalize everything
    this.dialogData = null;
    this.font = null;
    this.selectedIndex = 0;
    this.selectedIcon = null;
    this.activeState = null;
    this.stateText = null;
    this.stateChoices = null;
    this.selectChar = null;
    this.dlgClass = null;
    this.stateWindows = [];
    this.windows = [];
    this.sequential = false;
    this.entity = entity;
    
    // TODO: default selection?
    this.dialogData = dialogData;

    var nextState = this.selectState();
    // dialogs may not have any valid states in certain situations on display
    if(nextState == null)
    {
        this.dialogData = null;
        return;
    }

    if(!Util.defined(this.dialogData['s']))
    {
        this.logErr("Dialog must have settings entry!")
    }
    this.selectChar = this.getSetting('selectChar', '>')
    var fontPath = this.getSetting('f', null);
    if(fontPath != null)
    {
        this.font = Util.loadFont(fontPath);
    }
    else
    {
        this.logErr("Dialog must have a font defined!");		
    }
    
    this.sequential = this.getSetting('seq', false);
    
    this.dlgClass = this.getSetting('c', null);
    if(this.dlgClass != null)
    {
        //TODO: move to unit test?
        var dialogClass = eval('ig.global.' + this.dlgClass);
        if(!Util.defined(dialogClass))
        {
            this.logErr('Dialog class was unable to be evaluated');
            this.dlgClass = null;
        }
        else
        {
            // set the actual class, not the string
            this.dlgClass = dialogClass;
        }
    }
    
    var selectedIcon = this.getSetting('selectedIcon', null);
    if(selectedIcon != null)
    {
        this.selectedIcon = Util.loadImage(selectedIcon);
    }		
    
    // load dialog windows
    // 'win' can include base windows
    Window.loadWindows(this.getSetting('win', null), this.windows);
    // 'winex' can include base windows but is also an extension
    Window.loadWindows(this.getSetting('winex', null), this.windows);
    
    this.changeToState(nextState);
    Support.pause.setPause(true);
}

/*
 Gets a setting from the dialog data 's' property (defaulting to the base)
 @param (string) setting - The setting to get
 @param (object) defaultValue - The default value if nothing is found
 @return {object} The resulting value
 */
Dialog.prototype.getSetting = function(setting, defaultValue)
{
    return Util.getOverrideProperty(setting, this.dialogData.s, this.dialogData.s.base, defaultValue);
}

// input can either be a state name or an actual state object

/*
 Changes the dialog to the specified state
 @param (string/object) nextState - String or state object to transition to
 */
Dialog.prototype.changeToState = function(nextState)
{
    // TODO: if the state name is exactly the same consider keeping the selected index
    if(typeof nextState !== 'undefined' && nextState != null)
    {
        if(typeof nextState == 'string')
        {
            for(var idx = 0, len = this.dialogData.sa.length; idx < len; idx++)
            {
                var state = this.dialogData.sa[idx];
                if(state.hasOwnProperty('n') && state.n == nextState)
                {
                        nextState = state;
                        break;
                }
            }
            // if the nextState is just a string it wasn't found
            if(typeof nextState == 'string')
            {
                this.logErr('Failed to find state: ' + nextState);
                return;
            }
        }
        
        // TODO: else?? are non-strings supported?
    
        var previousState = this.activeState;
        this.activeState = nextState;
        var x = this.getSetting('x', 0);
        var y = this.getSetting('y', 0);
        var yOffset = this.getSetting('osy', 0);
        var xOffset = this.getSetting('osx', 0);
        var width = this.getSetting('w', 0);
        var maxWidth = width - xOffset * 2;
        var heightData = {};
        var rawText = this.activeState.t;
        if(this.dlgClass != null)
        {
            rawText = Util.localizeString(rawText, this.dlgClass);
        }
        this.stateText = Util.splitStringToWidth(rawText, maxWidth, this.font, heightData);
        y += heightData.height;
        this.stateChoices = [];
        if(this.activeState.hasOwnProperty('o'))
        {
            // TODO may want an override for this (if the state is the same, just reloaded keep the index)
            if(previousState != nextState)
            {
                this.selectedIndex = Util.getProperty(this.activeState['do'], 0);
            }
            // TODO: indent would be better...
            //maxWidth = (width - xOffset * 2);
            for( var idx = 0, len = this.activeState.o.length; idx < len; idx++)
            {
                var choice = this.activeState.o[idx];

                if(Util.defined(choice['r']))
                {
                    if(!Save.processReqsObject(choice.r))
                    {
                        continue;
                    }
                }
                var stateChoiceData = {};
                rawText = choice.t;
                if(this.dlgClass != null)
                {
                    rawText = Util.localizeString(rawText, this.dlgClass);
                }                
                stateChoiceData.text = Util.splitStringToWidth(rawText, maxWidth, this.font, heightData);
                stateChoiceData.x = xOffset + x;
                stateChoiceData.y = y;
                stateChoiceData.optionData = choice;
                this.stateChoices.push(stateChoiceData);
                y += heightData.height + yOffset;
            }
            if(this.selectedIndex >= this.stateChoices.length || this.selectedIndex < 0)
            {
                    this.selectedIndex = 0;
            }
        }

        this.stateWindows = [];
        // load state windows
        Window.loadWindows(this.activeState['win'], this.stateWindows);
    }
    else
    {
            // exit dialog on null or undefined next state
            this.close();
    }
}

// TODO: selectState and evaluateNextState might overlap a bit...
/*
 Selects the state based on the requirements of those in the dialog data (usually just used on initialization)
 @return {object} The resulting state or null if none is found
 */
Dialog.prototype.selectState = function()
{
    if(this.dialogData.s.hasOwnProperty(('r')))
    {
        // the entire dialog can be blocked
        if(!Save.processReqsObject(this.dialogData.s.r))
        {
            return null;
        }
    }

    if(this.dialogData.hasOwnProperty('sa') == false)
    {
        // TODO: log an error this dialog has no states!
        return null;
    }

    // determine the dialog state (there must be one)
    for(var idx = 0, len = this.dialogData.sa.length; idx < len; idx++)
    {
        var state = this.dialogData.sa[idx];
        if(state.hasOwnProperty('r'))
        {
            if(Save.processReqsObject(state.r))
            {
                return state;
            }
        }
        else
        {
            // no requirements
            return state;
        }
    }
    return null;
}

// TODO: description and general feel of this function is awkward
/*
//
 Processes the next state (if a class is associated will call getNextState) and switches to it as appropriate
 @param (string) nextState - The state to transition to: if null and dialog is sequential will move to the next
 if non-null and the associated dialog class defines getNextState that call will determine the next state
 */
Dialog.prototype.evaluateNextState = function(nextState)
{
    if(Util.defined(nextState) && nextState != null)
    {
        if(this.dlgClass != null && Util.defined(this.dlgClass['getNextState']))
        {
            // class may intercept the next state
            nextState = this.dlgClass.getNextState(nextState);
            this.changeToState(nextState);
            return;
        }
        else
        {
            this.changeToState(nextState);
            return;
        }
    }
    else if(this.sequential)
    {
        for(var idx = 0, len = this.dialogData.sa.length; idx < len; idx++)
        {
            if(this.dialogData.sa[idx-1] == this.activeState)
            {
                this.changeToState(this.dialogData.sa[idx]);
                return;
            }
        }
        
    }

    // default and exit
    this.close();
}

/*
 Update processor (usually called in the game mode blocking all other activity)
 @return (bool) true if still operating in the dialog, false otherwise
 */
Dialog.prototype.update = function()
{
    if(this.dialogData == null)
    {
            return false;
    }

    if(ig.input.pressed ('primary'))
    {
        if(this.activeState != null)
        {
            // Actions and class actions can be applied from both a state and an individual option as necessary

            //TODO: a is also used by the dialog override class (clear that up!)
            if(Util.defined(this.activeState['a']))
            {
                Save.processActionObject(this.entity, this.activeState.a);
            }

            this.performClassAction(this.activeState);

            if(this.activeState.hasOwnProperty('o') && this.activeState.o != null)
            {
                if(this.selectedIndex < this.stateChoices.length)
                {
                    var option = this.stateChoices[this.selectedIndex].optionData;
                    this.performClassAction(option);
                    Save.processActionObject(this.entity, option['a']);
                    this.evaluateNextState(option['ns']);
                }
                else
                {
                    // TODO: log error
                }
            }
            else
            {
                this.evaluateNextState(this.activeState['ns']);
            }
        }
    }
    else if (ig.input.pressed('down'))
    {
        this.selectedIndex++;
        if (this.selectedIndex > this.stateChoices.length - 1)
        {
            this.selectedIndex = 0;
        }
    }
    else if (ig.input.pressed('up'))
    {
        this.selectedIndex--;
        if (0 > this.selectedIndex)
        {
            this.selectedIndex = this.stateChoices.length - 1;
        }
    }
    return true;
}

/*
 Performs the class action specified in the object
 @param (object) obj - The action object to process
 */
Dialog.prototype.performClassAction = function(obj)
{
    if(this.dlgClass != null &&
        Util.defined(obj['ca']) &&
        Util.defined(this.dlgClass[obj['ca']]) &&
        typeof this.dlgClass[obj['ca']] === 'function')
    {
        if(this.dlgClass[obj['ca']].apply(this.dlgClass, [obj['cav']]))
        {
            // TODO...
        }
    }
}

/*
 Draw processor for the dialog (usually called in the game mode)
 @return {bool} true if drawing the dialog, false otherwise
 */
Dialog.prototype.draw = function()
{
    if(this.dialogData == null)
    {
            return false;
    }
    
    // render windows
    Window.drawWindows(this.windows);
    Window.drawWindows(this.stateWindows);

    // render text
    // TODO: this does a big lookup per frame...
    this.font.draw(this.stateText, this.getSetting('x', 0), this.getSetting('y', 0), ig.Font.ALIGN.LEFT);
    
    // render dialog text items (and selector)
    for( var idx = 0, len = this.stateChoices.length; idx < len; idx++)
    {
            var stateChoice = this.stateChoices[idx];
        
            // draw the indicator that this item is selected
            if (this.selectedIndex == idx)
            {
                    // TODO: all this needs to be better organized with the data (are image and settings in the same object or not?)
                    if (this.selectedIcon == null)
                    {
                        this.font.draw(this.selectChar, stateChoice.x - this.getSetting('osx', 0), stateChoice.y, ig.Font.ALIGN.RIGHT);
                    }
                    else
                    {
                        var dialogIconSettings = this.getSetting('dialogIconArgs', null);
                        if(dialogIconSettings == null)
                        {
                                this.selectedIcon.draw(stateChoice.x - this.getSetting('osx', 0), stateChoice.y);
                        }
                        else
                        {
                            // TODO: not perfect really... might need a y offset as well
                            this.selectedIcon.draw(stateChoice.x - this.getSetting('osx', 0), stateChoice.y,
                                    dialogIconSettings.sourceX,
                                    dialogIconSettings.sourceY,
                                    dialogIconSettings.width,
                                    dialogIconSettings.height);
                        }
                    }
            }
            // draw the text
            this.font.draw(stateChoice.text, stateChoice.x, stateChoice.y, ig.Font.ALIGN.LEFT);
    }
    return true;
}

/*
 Logs an error
 @param (string) msg - The message to log
 */
Dialog.prototype.logErr = function(msg)
{
	ig.log('Dialog Error: ' + msg);	
}

/*
 Determine if there is an active dialog
 @return {bool} true if dialog data is assigned, false otherwise
 */
Dialog.prototype.isVisisble = function()
{
    this.dialogData != null;
}

/*
 Closes dialog and unpauses game
 */
Dialog.prototype.close = function()
{
    Support.pause.setPause(false);
    this.dialogData = null;
}

Support.dialog = new Dialog();

});