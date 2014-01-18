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

// TODO: need an indicator for dialogs with no options (not glaringly obvious the user needs to provide input)

function Dialog(){}

/*
 Initializes a dialog and displays it
 @param (object) entity - The entity the dialog is associated with
 @param (object) dialogData - The dialog data
 */
Dialog.prototype.initData = function(entity, dialogData)
{
    // initalize everything
    this.dialogData = null;
    this.activeState = null;
    this.stateMap = null;
    this.sequential = false;
    this.seqStateIndex = 0;
    this.entity = entity;

    this.dialogData = dialogData;

    var nextState = this.selectState();
    // dialogs may not have any valid states in certain situations on display
    if(nextState == null)
    {
        this.dialogData = null;
        return;
    }

    if(!Util.defined(this.dialogData['sa']))
    {
        this.logErr("Dialog states defined!");
        this.dialogData = null;
        return;
    }

    this.uiMenu = new Support.UIMenu(this, this.dialogData);
    this.uiMenu.itemClicked = this.itemClicked;

    this.stateMap = Util.createArrayToObjectMap(this.dialogData.sa, 'n');

    this.sequential = this.uiMenu.getSetting('seq', false);

    this.changeToState(nextState);
    Support.pause.setPause(true);
}

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
            this.selectedIndex = 0;
        }

        this.activeState = nextState;

        this.uiMenu.updateLayout(this.activeState.t, this.activeState.o);
        this.uiMenu.windowsExtra = [];
        Window.loadWindows(this.activeState['win'], this.uiMenu.windowsExtra);
    }
    else
    {
        this.logErr('changeToState should never be called with an undefined state. Fix the code!');
        this.close();
    }
}

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

/*
 Processes the next state (if a class is associated will call getNextState) and switches to it as appropriate
 @param (string) nextState - The state to transition to: if a valid state name will transition, if null will call
 selectState, otherwise exit
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
            if(this.uiMenu.menuClass != null && Util.defined(this.uiMenu.menuClass['getNextState']))
            {
                // class may intercept the next state
                nextState = this.uiMenu.menuClass.getNextState(nextState);
            }
            this.changeToState(nextState);
            return;
        }
    }

    // default and exit
    this.close();
}

Dialog.prototype.itemClicked = function(item)
{
    if(this.activeState != null)
    {
        // Actions and class actions can be applied from both a state and an individual option as necessary
        Save.processActionObject(this.entity, this.activeState['a']);
        this.performClassAction(this.activeState);

        if(Util.defined(item) && item != null)
        {
            this.performClassAction(item);
            Save.processActionObject(this.entity, item['a']);
            // if the option doesn't have a next state, use the active state's next state as a backup
            if(!Util.defined(item['ns']) && !Util.defined(this.activeState['ns']))
            {
                // completely undefined (run through the process and exit)
                this.evaluateNextState(undefined)
            }
            else
            {
                this.evaluateNextState(Util.getProperty(item['ns'], Util.getProperty(this.activeState['ns'], null)));
            }
        }
        else
        {
            this.evaluateNextState(this.activeState['ns']);
        }
    }
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

    this.uiMenu.update();

    return true;
}

/*
 Performs the class action specified in the object
 @param (object) obj - The action object to process
 */
Dialog.prototype.performClassAction = function(obj)
{
    if(this.uiMenu.menuClass != null &&
        Util.defined(obj['ca']) &&
        Util.defined(this.uiMenu.menuClass[obj['ca']]) &&
        typeof this.uiMenu.menuClass[obj['ca']] === 'function')
    {
        this.uiMenu.menuClass[obj['ca']].apply(this.uiMenu.menuClass, [obj['cav']]);
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

    this.uiMenu.draw();
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