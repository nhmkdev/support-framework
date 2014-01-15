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
    this.selectedIconSettings = null;
    this.activeState = null;
    this.stateText = null;
    this.stateChoices = null;
    this.selectChar = null;
    this.dlgClass = null;
    this.stateMap = null;
    this.stateWindows = [];
    this.windows = [];
    this.sequential = false;
    this.seqStateIndex = 0;
    this.dlgSettings = {};
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

    this.dlgSettings.x = this.getSetting('x', 0);
    this.dlgSettings.y = this.getSetting('y', 0);
    this.dlgSettings.width = this.getSetting('w', 0);

    this.dlgSettings.o = this.getSetting('o', {});
    this.dlgSettings.o.x = Util.getProperty(this.dlgSettings.o['x'], 0);
    this.dlgSettings.o.y = Util.getProperty(this.dlgSettings.o['y'], 0);
    this.dlgSettings.o.width = Util.getProperty(this.dlgSettings.o['w'], 0);
    this.dlgSettings.o.yOffset = Util.getProperty(this.dlgSettings.o['yo'], 0);
    // this is an offset away from the selector (char or icon)
    this.dlgSettings.o.xOffset = Util.getProperty(this.dlgSettings.o['xo'], 0);

    this.stateMap = Util.createArrayToObjectMap(this.dialogData.sa, 'n');

    if(!Util.defined(this.dialogData['s']))
    {
        this.logErr("Dialog must have settings entry!")
    }
    this.selectChar = this.getSetting('sc', '>')
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
        var dialogClass = Util.getNestedProperty(ig.global, this.dlgClass, null);
        if(null == dialogClass)
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
    
    var selectedIcon = this.getSetting('si', null);
    if(selectedIcon != null)
    {
        this.selectedIcon = Util.loadImage(selectedIcon);
        this.selectedIconSettings = this.getSetting('sia', {});
        this.selectedIconSettings.sx = Util.getProperty(this.selectedIconSettings['sx'], 0);
        this.selectedIconSettings.sy = Util.getProperty(this.selectedIconSettings['sy'], 0);
        this.selectedIconSettings.w = Util.getProperty(this.selectedIconSettings['w'], this.selectedIcon.width);
        this.selectedIconSettings.h = Util.getProperty(this.selectedIconSettings['h'], this.selectedIcon.height);
        this.selectedIconSettings.yOffset = Util.getProperty(this.selectedIconSettings['yo'], 0);
    }

    this.dlgSettings.o.selectWidth = (this.selectedIcon == null ?
        this.font.widthMap[this.selectChar.charCodeAt(0) - this.font.firstChar] :
        this.selectedIcon.width) + this.dlgSettings.o.xOffset;

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
    if(Util.defined(nextState))
    {
        if(typeof nextState == 'string')
        {
            // find the next state by name
            if(Util.defined(this.stateMap[nextState]))
            {
                nextState = this.stateMap[nextState];
            }
            else
            {
                this.logErr('Failed to find state: ' + nextState);
                return;
            }
        }

        if(this.activeState != nextState)
        {
            // TODO: may want an option to reset the selected index even if the state doesn't change
            this.selectedIndex = 0;
        }

        this.activeState = nextState;

        this.updateStateLayout();

        // load state windows
        this.stateWindows = [];
        Window.loadWindows(this.activeState['win'], this.stateWindows);
    }
    else
    {
        this.logErr('changeToState should never be called with an undefined state. Fix the code!');
        this.close();
    }
}

/*
 Updates the layout/text/options based on the current state
 */
Dialog.prototype.updateStateLayout = function()
{
    var heightData = {};
    // TODO: support an array of strings to allow for multiple screens of text per state (?)
    var rawText = this.activeState.t;

    if(this.dlgClass != null && Util.defined(this.dlgClass['getKeyString']))
    {
        rawText = Util.localizeString(rawText, this.dlgClass);
    }
    this.stateText = Util.splitStringToWidth(rawText, this.dlgSettings.width, this.font, heightData);

    // TODO: potential for overlap if the state text is too long

    this.stateChoices = [];

    if(Util.defined(this.activeState['o']))
    {
        var stateChoiceY = this.dlgSettings.o.y;
        // TODO allow the specification of the width of the selector component
        var optionMaxWidth = this.dlgSettings.o.width - this.dlgSettings.o.selectWidth;
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
            stateChoiceData.text = Util.splitStringToWidth(rawText, optionMaxWidth, this.font, heightData);
            stateChoiceData.x = this.dlgSettings.o.x + this.dlgSettings.o.selectWidth;
            stateChoiceData.y = stateChoiceY;
            stateChoiceData.optionData = choice;
            this.stateChoices.push(stateChoiceData);
            stateChoiceY += heightData.height + this.dlgSettings.o.yOffset;
        }

        // check the valid choices for the first that is marked as default
        for(var idx = 0, len = this.stateChoices.length; idx < len; idx++)
        {
            if(Util.getProperty(this.stateChoices['d']), false)
            {
                this.selectedIndex = idx;
                break;
            }
        }

        if(this.selectedIndex >= this.stateChoices.length || this.selectedIndex < 0)
        {
            this.selectedIndex = 0;
        }

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

    if(!this.dialogData.hasOwnProperty('sa'))
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
 @param (string) nextState - The state to transition to: if a valid state name will transition, if null will call
 selectState, otherwise exit
 if non-null and the associated dialog class defines getNextState that call will determine the next state
 */
Dialog.prototype.evaluateNextState = function(nextState)
{
    if(this.sequential)
    {
        while(true)
        {
            nextState = this.dialogData.sa[++this.seqStateIndex];
            if(Util.defined(nextState))
            {
                if(!Save.processReqsObject(nextState['r']))
                {
                    continue;
                }
                this.changeToState(nextState);
                return;
            }
            break;
        }
    }
    else if(Util.defined(nextState))
    {
        if(nextState == null)
        {
            nextState = this.selectState();
        }

        if(nextState != null)
        {
            if(this.dlgClass != null && Util.defined(this.dlgClass['getNextState']))
            {
                // class may intercept the next state
                nextState = this.dlgClass.getNextState(nextState);
            }
            this.changeToState(nextState);
            return;
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
            Save.processActionObject(this.entity, this.activeState['a']);
            this.performClassAction(this.activeState);

            if(this.activeState.hasOwnProperty('o') && this.activeState.o != null)
            {
                var option = this.stateChoices[this.selectedIndex].optionData;
                this.performClassAction(option);
                Save.processActionObject(this.entity, option['a']);
                // if the option doesn't have a next state, use the active state's next state as a backup
                if(!Util.defined(option['ns']) && !Util.defined(this.activeState['ns']))
                {
                    // completely undefined (run through the process and exit)
                    this.evaluateNextState(undefined)
                }
                else
                {
                    this.evaluateNextState(Util.getProperty(option['ns'], Util.getProperty(this.activeState['ns'], null)));
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
    this.font.draw(this.stateText, this.dlgSettings.x, this.dlgSettings.y, ig.Font.ALIGN.LEFT);
    
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
                this.font.draw(this.selectChar, this.dlgSettings.o.x, stateChoice.y, ig.Font.ALIGN.RIGHT);
            }
            else
            {
                this.selectedIcon.draw(this.dlgSettings.o.x, stateChoice.y + this.selectedIconSettings.yOffset,
                    this.selectedIconSettings.sx,
                    this.selectedIconSettings.sy,
                    this.selectedIconSettings.w,
                    this.selectedIconSettings.h);
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