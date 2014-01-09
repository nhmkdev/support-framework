/*
 Unit tests for the various data types in the Support Framework (TODO: way out of date!)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'data.unittest' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
    
// TODO: performance later -- http://jsperf.com/hasownproperty-vs-in-vs-undefined/12
// TODO: use delete to clean up entitiy vars
// TODO: plenty of additional tests (structures have changed a lot!)
    
//// -- Generic functionality

function validateNumberProperty(obj, name, allowNone, min, max)
{
    allowNone = defaultFor(allowNone, false);
    min = defaultFor(min, 0);
    max = defaultFor(max, 0);

    if(obj.hasOwnProperty(name) == false)
    {
        logUnitError(!allowNone, name  + ' must be assigned.');
        return allowNone;
    }
    
    var val = obj[name];
    if(isNaN(val) == false)
    {
        var rangeValid = val >= min && val <= max;
        logUnitError(rangeValid, name + ' must be within range: ' + min + ' to ' + max + ' (found: ' + val + ')');
        return rangeValid;
    }
    return false;
}

function validateStringProperty(obj, name, allowNone)
{
    if(!Util.defined(obj)) return false;
    allowNone = defaultFor(allowNone, false);
    if(obj.hasOwnProperty(name) == false && allowNone == false)
    {
        logUnitError(false, name  + ' must be assigned.');
        return allowNone;
    }        
    return true;
}
    
function validateBoolProperty(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    if(obj.hasOwnProperty(name) == false && allowNone == false && typeof obj[name] === 'boolean')
    {
        logUnitError(false, name  + ' must be assigned a boolean.');
        return allowNone;
    }        
    return true;
}

function validatePointObject(obj, name, allowNone)
{
    if(Util.defined(obj[name]) && !allowNone)
    {
        if(Util.defined(obj[name]['x']) && Util.defined(obj[name]['y']))
        {
            return true;
        }
        logUnitError(false, name + ' must be assigned a point object (with x and y properties)');
        return false;
    }
    return allowNone;
}

function validateMediaFile(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    if(obj.hasOwnProperty(name))
    {
        return null != Util.loadImage(obj[name]);
    }
    return allowNone;
}

        //TODO: rename to assert :P
function logUnitError(testVar, msg)
{
    if(!testVar) ig.log('ERR: ' + msg);
    return testVar;
}

function defaultFor(arg, def)
{
    return Util.defined(arg) ? arg : def;
}

//// Requirements

var VALID_LOGIC_CHECKS = ['==', '!=', '<=', '>=', '>', '<'];

function requirementsValidator(reqObject, name)
{
    // NOTE: Nothing requires this object... (yet?!)
    if(!Util.defined(reqObject)) return true;
    var success = true;
    if(Util.defined(reqObject['i']) && Util.isArray(reqObject['i']))
    {
        if(Util.defined(reqObject['l']) && !(reqObject['l'] == 'and' || reqObject['l'] == 'or'))
        {
            success = logUnitError(false, name + ' l (logic) must be "and" or "or"');
        }
        for(var x = 0, len = reqObject.i.length; x < len; x++)
        {
            var item = reqsObj.i[x];
            if(!Util.isArray(item))
            {
                success = success && requirementsValidator(item);
            }
            else
            {
                if(item.length == 3)
                {
                    success = logUnitError(item[2].length > 2 && Util.defined(VALID_LOGIC_CHECKS[item[2].substr(0,2)]),
                        name + ' logic check (last param) is invalid type: ' + item[2]);
                }
                else
                {
                    success = logUnitError(true, name  + ' contains a requirement that is not 3 parameters');
                }
            }
        }
    }
    else
    {
        success = logUnitError(false, name + ' requirements must define i (items) and it must be an array')
    }
    return success;
}

//// -- Animation Object Tests (basic type)

function animationStateValidator(animStateObject, name)
{
    var success = true;
    success = success && validateNumberProperty(animStateObject, 'ft', false, 0, 65536);
    success = success && logUnitError(Util.defined(animStateObject['seq']) && Util.isArray(animStateObject['seq']), name + ' must define the seq (animation sequence)');
    success = success && seqValid;
    success = success && validateBoolProperty(animStateObject, 's', true);
    success = success && validatePointObject(animStateObject, 'b', true);
    success = success && validatePointObject(animStateObject, 'bo', true);
    success = success && validateNumberProperty(animStateObject, 'g', true, 0, 1024);
    if(Util.defined(animStateObject['c']) && !Util.defined(ig.Entity.COLLIDES[animStateObject['c']]))
    {
        success = success && logUnitError(false, name + ' needs to specify a valid type of collision in the c property');
    }
    success = success && requirementsValidator(animStateObject['r'], name);
    return success;
}

function animationObjectValidator(animObject, name)
{
    var success = true;
    success = success && validateMediaFile(animObject, 'i');
    success = success && validateNumberProperty(animObject, 'w', false, 0, 65536);
    success = success && validateNumberProperty(animObject, 'h', false, 0, 65536);
    success = success && validatePointObject(animObject, 's', true);
    success = success && validatePointObject(animObject, 'o', true);
    success = success && validateNumberProperty(animObject, 'g', true, 0, 1024);
    if(Util.defined(animObject['a']))
    {
        for(var n in animObject.a)
        {
            success = success && animationStateValidator(animObject.a[n], n);
        }
    }
    else
    {
        success = false;
        logUnitError(false, name + ' must contain animation state objects');
    }
    return success;
}

//// -- Menu Unit Tests

function startMenuValidator()
{
    menuValidator(ig.global.data.menus);
}
    
function menuValidator(menuObject, name)
{
    var success = true;
    if(menuObject.hasOwnProperty('s'))
    {
        var settings = menuObject.s;
        var menuIcon = Util.getOverrideProperty('micn', settings, settings.base, null);
        if(menuIcon != null)
        {
            success = success && Util.loadImage(menuIcon) != null;
        }
        var menuFont = Util.getOverrideProperty('f', settings, settings.base, null);
        if (menuFont != null)
        {
            success = success && Util.loadFont(menuFont) != null;
        }  
        
        if(Util.defined(menuObject['mi']))
        {
            for(var x = 0, len = menuObject.mi.length; x < len; x++)
            {
                var menuItem = menuObject.mi[x];
                var hasAction = false;
                if(Util.defined(menuItem['g']))
                {
                    
                    hasAction = true;
                }
                if(Util.defined(menuItem['m']))
                {
                    // TODO: this field may become a string that is eval(m)
                    hasAction = true;
                }
                success == success && hasAction;
            }
        }
        else
        {
            success = false;
            logUnitError(false, 'No menu items specified.');
        }
        
        ig.log('Menu: ' + (success ? 'PASS' : 'FAIL') + ': ' + name);
    }
    else
    {
        // this is an actual object, not an array
        for (var key in menuObject)
        {
            if(menuObject.hasOwnProperty(key))
            {
                menuValidator(menuObject[key], (Util.defined(name) ? name + '.' : '') + key);
            }
        }
    }     
}
    
//// -- Window Unit Tests
   
function startWindowValidator()
{
    windowValidator(ig.global.data.windows);
}
    
function windowValidator(windowObject, name)
{
    var success = true;
    if(windowObject.hasOwnProperty('i'))
    {
        success = success && validateMediaFile(windowObject, 'i');
        ig.log('Window: ' + (success ? 'PASS' : 'FAIL') + ': ' + name);
    }
    else
    {
        // this is an actual object, not an array
        for (var key in windowObject)
        {
            if(windowObject.hasOwnProperty(key))
            {
                windowValidator(windowObject[key], (Util.defined(name) ? name + '.' : '') + key);
            }
        }
    }      
}    
    
//// -- Interact Unit Tests
    
function startInteractValidator()
{
    interactsValidator(ig.global.data.interacts);
}
    
function interactsValidator(interactObject, name)
{
    var success = true;
    var foundData = false;
    if(Util.defined(interactObject) && Util.defined(interactObject['d']))
    {
        var dialog = Util.getNestedProperty(ig.global.data.dialogs, interactObject.d, null);
        if(dialog == null)
        {
            success = false;
            logUnitError(false, 'Dialog specified is not found. [' + interactObject.d + ']');
        }
        foundData = true;
    }
    if(Util.defined(interactObject['ao']))
    {
        var animationObject = defaultFor(interactObject.ao, null);
        if(null != animationObject)
        {

            success = success && validateMediaFile(animationObject, 'i');
            success = success && validateNumberProperty(animationObject, 'w', false, 0, 1024);
            success = success && validateNumberProperty(animationObject, 'h', false, 0, 1024);
            if(animationObject.hasOwnProperty('a'))
            {
                for(var x = 0, len = animationObject.a.length; x < len; x++)
                {
                    var animState = animationObject.a[x];
                    success = success && validateStringProperty(animState, 'r', true);
                    success = success && validateStringProperty(animState, 'n'); // animation name
                    success = success && validateStringProperty(animState, 'ft');
                    if(animState.hasOwnProperty('seq') == false) success = false; // sequence is required
                    success = success && validateBoolProperty(animState, 's', true); // required?
                    success = success && validateBoolProperty(animState, 'fx', true); // required?
                    success = success && validateBoolProperty(animState, 'fy', true); // required?
                }
            }
            else
            {
                success = false;
                logUnitError(false, 'No animation states specified.');
            }
        }
        else
        {
            success = false;
            logUnitError(false, 'No animation object specified.');
        }
        foundData = true;
    }

    if(foundData)
    {
        ig.log('Interact: ' + (success ? 'PASS' : 'FAIL') + ': ' + name);
    }
    else
    {
        // this is an actual object, not an array
        for (var key in interactObject)
        {
            if(interactObject.hasOwnProperty(key))
            {
                interactsValidator(interactObject[key], (Util.defined(name) ? name + '.' : '') + key);
            }
        }
    }    
}
    
//// -- Dialog Unit Tests

function startDialogValidator()
{
    dialogsValidator(ig.global.data.dialogs);
}

function dialogsValidator(dialogObject, name)
{
    if(dialogObject.hasOwnProperty('sa'))
    {
        // process dialog
        var success = validateDialogSettings(dialogObject);
        success = success && validateDialogStates(dialogObject);
        ig.log('Dialog: ' + (success ? 'PASS' : 'FAIL') + ': ' + name);
    }
    else
    {
        // this is an actual object, not an array
        for (var key in dialogObject)
        {
            if(dialogObject.hasOwnProperty(key))
            {
                dialogsValidator(dialogObject[key], (Util.defined(name) ? name + '.' : '') + key);
            }
        }
    }
}

function validateDialogSettings(dialogObject)
{
    var success = false;
    // TODO: lots here -- including the base
    if(dialogObject.hasOwnProperty('s'))
    {
        success = true;
    }
    else
    {
        logUnitError(success, 'Could not find settings.');
    }
    return success;
}

function validateDialogStates(dialogObject)
{
    // TODO: determine if object is array
    if(dialogObject.hasOwnProperty('sa') == false)
    {
        logUnitError(false, 'Could not find the state array.');
        return false;
    }
    
    var success = true;

    for(var x = 0, len = dialogObject['sa'].length; x < len; x++)
    {
        var state = dialogObject['sa'][x];
        success = success && validateStringProperty(state, 'n', true);
        // TODO should text be optional?
        success = success && validateStringProperty(state, 't', true);
        success = success && checkDialogNextStateName(state, dialogObject['sa']);
        // validate options // TODO: is array
        if(state.hasOwnProperty('o'))
        {
            for(var i = 0, optionsLen = state['o'].length; i < optionsLen; i++)
            {
                var option = state['o'][i];
                success = success && validateStringProperty(option, 't');
                // TODO: check flags
                // TODO: move this dupe code elsewhere!
                success = success && checkDialogNextStateName(option, dialogObject['sa']);
            }
        }
    }
    return success;
}

function checkDialogNextStateName(state, stateArray)
{
    var foundNextState = false;
    if(state.hasOwnProperty('ns') == false || state['ns'] == null)
    {
        // missing/null is valid (exits dialog)
        foundNextState = true;
    }
    else
    {
        var stateName = state['ns'];
        for(var x = 0, len = stateArray.length; x < len; x++)
        {
            var otherState = stateArray[x];
            if(otherState == state)
            {
               continue;
            }
            if(otherState.hasOwnProperty('n') && otherState['n'] == stateName)
            {
               foundNextState = true;
               break;
            }
        }
        logUnitError(foundNextState, 'Could not find next state: ' + stateName);
    }
    return foundNextState;        
}

//// -- Interacts Tests

//// -- Unit Test runners

startInteractValidator();
startDialogValidator();
startMenuValidator();
startWindowValidator();

});