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

// array of errors for the currently tested item
var errorArray = [];

// TODO: only use the error array, get rid of all the success flags

// TODO: performance later -- http://jsperf.com/hasownproperty-vs-in-vs-undefined/12
// TODO: use delete to clean up entitiy vars
// TODO: plenty of additional tests (structures have changed a lot!)
    
//// -- Generic functionality

function validateNumberProperty(obj, name, allowNone, min, max)
{
    allowNone = defaultFor(allowNone, false);
    min = defaultFor(min, Number.MIN_VALUE);
    max = defaultFor(max, Number.MAX_VALUE);

    if(!Util.defined(obj[name]))
    {
        assertOrLog(allowNone, name  + ' must be assigned.');
        return allowNone;
    }
    
    var val = obj[name];
    if(isNaN(val) == false)
    {
        var rangeValid = val >= min && val <= max;
        assertOrLog(rangeValid, name + ' must be within range: ' + min + ' to ' + max + ' (found: ' + val + ')');
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
        assertOrLog(false, name  + ' must be assigned.');
        return allowNone;
    }        
    return true;
}
    
function validateBoolProperty(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    if(obj.hasOwnProperty(name) == false && allowNone == false && typeof obj[name] === 'boolean')
    {
        assertOrLog(false, name  + ' must be assigned a boolean.');
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
        assertOrLog(false, name + ' must be assigned a point object (with x and y properties)');
        return false;
    }
    return allowNone;
}

function validateMediaFile(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    if(obj.hasOwnProperty(name))
    {
        return assertOrLog(null != Util.loadImage(obj[name]), name + ' must be assigned a valid media file');
    }
    return assertOrLog(allowNone, name + ' must be assigned a valid media file.');
}

function validateFontFile(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    if(obj.hasOwnProperty(name))
    {
        return assertOrLog(null != Util.loadFont(obj[name]), name + ' must be assigned a valid font');
    }
    return assertOrLog(allowNone, name + ' must be assigned a valid font');
}

function validateWindowArray(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    if(Util.defined(obj[name]))
    {
        return assertOrLog(Util.isArray(obj[name]), name + ' must be assigned a valid window array');
    }
    return assertOrLog(allowNone, name + ' must be assigned a valid window array');
}

/*
 Validates the given function with a fallback to obj.base if the check fails
 @param {function} func - The validation function to call with the object and inputs
 The function must have a prototype of bool(obj, name, ...);
 @param {object} obj - The object to check with the validation function.
 @param {string} name - Property name to check
 @param {...} - All the remaining params required to call the input function
 @return {bool} true on success, false otherwise
 */
function validateWithBaseFallback(func, obj, name)
{
    var args = Array.prototype.slice.call(arguments);
    if(!func.apply(null, args.slice(1)))
    {
        // only call again with base if the value is not present in the current object (may just be bad input)
        if(!Util.defined(obj[name]) && Util.defined(obj['base']))
        {
            // pop the last error and try it again
            errorArray.pop();
            return func.apply(null, [obj.base].concat(args.slice(2)));
        }
        return false;
    }
    return true;
}

function assertOrLog(testVar, msg)
{
    if(!testVar)
    {
        errorArray.push('ERR: ' + msg);
    }
    return testVar;
}

function logResult(type, success, msg)
{
    ig.log(type + ':' + (errorArray.length == 0 ? 'PASS' : 'FAIL') + ' ' + msg);
    var len = len = errorArray.length;
    for(var x = 0; x < len; x++)
    {
        ig.log(errorArray[x]);
    }
    if(len > 0)
    {
        ig.log('----' + len + ' errors!');
    }
}

function defaultFor(arg, def)
{
    return Util.defined(arg) ? arg : def;
}

//// Requirements

var VALID_LOGIC_CHECKS = ['==', '!=', '<=', '>=', '>', '<'];

        // TODO: use this as a standard validator ?
function validateRequirement(reqObj, name)
{
    // NOTE: Nothing requires this object... (yet?!)
    if(!Util.defined(reqObj)) return true;
    var success = true;
    if(Util.defined(reqObj['i']) && Util.isArray(reqObj['i']))
    {
        if(Util.defined(reqObj['l']) && !(reqObj['l'] == 'and' || reqObj['l'] == 'or'))
        {
            success = assertOrLog(false, name + ' l (logic) must be "and" or "or"');
        }
        for(var x = 0, len = reqObj.i.length; x < len; x++)
        {
            var item = reqObj.i[x];
            if(!Util.isArray(item))
            {
                success = success && validateRequirement(item);
            }
            else
            {
                if(item.length == 3)
                {
                    var logicFound = false;
                    for(var x = 0, len = VALID_LOGIC_CHECKS.length; x < len; x++)
                    {
                        var logicStr = VALID_LOGIC_CHECKS[x];
                        if(item[2].substring(0, logicStr.length) == logicStr)
                        {
                            logicFound = true;
                            break;
                        }

                    }
                    success = assertOrLog(logicFound,
                        name + ' logic check (last param) is invalid type: ' + item[2]);
                }
                else
                {
                    success = assertOrLog(true, name  + ' contains a requirement that is not 3 parameters');
                }
            }
        }
    }
    else
    {
        success = assertOrLog(false, name + ' requirements must define i (items) and it must be an array')
    }
    return success;
}

//// -- Animation Object Tests (basic type)

function animationStateValidator(animStateObject, name)
{
    var success = true;
    success = success && validateStringProperty(animStateObject, 'n');
    success = success && validateNumberProperty(animStateObject, 'ft', false, 0, 65536);
    success = success && assertOrLog(Util.defined(animStateObject['seq']) && Util.isArray(animStateObject['seq']), name + ' must define the seq (animation sequence)');
    success = success && validateBoolProperty(animStateObject, 's', true);
    success = success && validatePointObject(animStateObject, 'b', true);
    success = success && validatePointObject(animStateObject, 'bo', true);
    success = success && validateNumberProperty(animStateObject, 'g', true, 0, 1024);
    if(Util.defined(animStateObject['c']) && !Util.defined(ig.Entity.COLLIDES[animStateObject['c']]))
    {
        success = success && assertOrLog(false, name + ' needs to specify a valid type of collision in the c property');
    }
    success = success && validateRequirement(animStateObject['r'], name);
    return success;
}

        // TODO: use this as a standard validator
function animationObjectValidator(animObject, name)
{
    var success = true;
    success = success && validateMediaFile(animObject, 'i');
    success = success && validateNumberProperty(animObject, 'w', false, 0, 65536);
    success = success && validateNumberProperty(animObject, 'h', false, 0, 65536);
    success = success && validatePointObject(animObject, 's', true);
    success = success && validatePointObject(animObject, 'o', true);
    success = success && validateNumberProperty(animObject, 'g', true, 0, 1024);
    if(Util.defined(animObject['a']) && Util.isArray(animObject['a']))
    {
        for(var x = 0, len = animObject.a.length; x < len; x++)
        {
            success = success && animationStateValidator(animObject.a[x], name);
        }
    }
    else
    {
        success = false;
        assertOrLog(false, name + ' must contain animation state objects');
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
            success = success && validateMediaFile(menuIcon, false);
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
            assertOrLog(false, 'No menu items specified.');
        }

        logResult('Menu', success, name);
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
        // TODO: consider checks in the base object?
        success = success && validateMediaFile(windowObject, 'i');
        success = success && validateNumberProperty(windowObject, 'x', true);
        success = success && validateNumberProperty(windowObject, 'y', true);
        success = success && validateNumberProperty(windowObject, 'sx', true);
        success = success && validateNumberProperty(windowObject, 'sy', true);
        success = success && validateNumberProperty(windowObject, 'w', true, 1, Number.MAX_VALUE);
        success = success && validateNumberProperty(windowObject, 'h', true, 1, Number.MAX_VALUE);
        logResult('Window', success, name);
    }
    else
    {
        var subItems = 0;
        // this is an actual object, not an array (data objects can be nested)
        for (var key in windowObject)
        {
            if(windowObject.hasOwnProperty(key))
            {
                subItems++;
                windowValidator(windowObject[key], (Util.defined(name) ? name + '.' : '') + key);
            }
        }
        if(subItems == 0)
        {
            logResult('Window', false, name);
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
    if(Util.defined(interactObject) &&
        (Util.defined(interactObject['d']) || Util.defined(interactObject['ao'])))
    {
        var dataDefined = false; // dialog or animation object must be found (or both)
        if(Util.defined(interactObject['d']))
        {
            success = success && assertOrLog(
                null != Util.getNestedProperty(ig.global.data.dialogs, interactObject.d, null),
                'Dialog specified is not found. [' + interactObject.d + ']');
            dataDefined = true;
        }
        if(Util.defined(interactObject['ao']))
        {
            success = success && animationObjectValidator(interactObject.ao);
            dataDefined = true;
        }
        success = success && dataDefined;
        logResult('Interact', success, name);
    }
    else
    {
        // this is an actual object, not an array (nesting)
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
        logResult('Dialog', success, name);
    }
    else
    {
        // this is an actual object, not a dialog
        for (var key in dialogObject)
        {
            if(dialogObject.hasOwnProperty(key))
            {
                dialogsValidator(dialogObject[key], (Util.defined(name) ? name + '.' : '') + key);
            }
        }
    }
}

function checkDialogNextStateName(state, stateMap)
{
    if(!Util.defined(state['ns']) ||
        state['ns'] == null ||
        Util.defined(stateMap[state.ns]))
    {
        return true;
    }
    return assertOrLog(false, 'Could not find next state: ' + Util.getProperty(state['ns'], '[BAD INPUT]'));
}

function validateDialogSettings(dialogObject)
{
    var success = true;
    // TODO: base processing?
    if(dialogObject.hasOwnProperty('s'))
    {
        var settings = dialogObject.s;
        success = success && validateWithBaseFallback(validateFontFile, settings, 'f');
        // TODO: document si and sia
        success = success && validateMediaFile(settings, 'si', true);
        if(Util.defined(settings['sia']))
        {
            var sia = settings.sia;
            success = success && validateNumberProperty(sia, 'sx', true);
            success = success && validateNumberProperty(sia, 'sy', true);
            success = success && validateNumberProperty(sia, 'w', true);
            success = success && validateNumberProperty(sia, 'h', true);
        }
        success = success && validateNumberProperty(settings, 'x', true);
        success = success && validateNumberProperty(settings, 'y', true);
        success = success && validateNumberProperty(settings, 'osx', true);
        success = success && validateNumberProperty(settings, 'osy', true);
        success = success && validateWithBaseFallback(validateNumberProperty, settings, 'w');
        success = success && validateNumberProperty(settings, 'x', true);
        success = success && validateBoolProperty(settings, 'seq', true);
        if(Util.defined(settings['c']))
        {
            success = success && assertOrLog(
                null != Util.getNestedProperty(ig.global, settings.c),
                'Associated class does not exist: ' + settings.c);
            // TODO: more validation on class?
        }
        success = success && validateWindowArray(settings, 'win', true);
        success = success && validateWindowArray(settings, 'winex', true);
    }
    else
    {
        assertOrLog(success, 'Could not find settings.');
    }
    return success;
}

function validateDialogStates(dialogObject)
{
    // TODO: determine if object is array
    if(!Util.defined(dialogObject['sa']))
    {
        return assertOrLog(false, 'Could not find the state array.');
    }
    
    var success = true;

    var stateMap = Util.createArrayToObjectMap(dialogObject.sa, 'n');

    for(var x = 0, len = dialogObject.sa.length; x < len; x++)
    {
        var state = dialogObject.sa[x];
        success = success && validateStringProperty(state, 'n', true);
        success = success && validateStringProperty(state, 't');
        success = success && checkDialogNextStateName(state, stateMap);
        success = success && validateWindowArray(state, 'win', true);
        if(state.hasOwnProperty('o'))
        {
            if(Util.isArray(state.o))
            {
                var optionsLen = state.o.length;
                success = success && validateNumberProperty(state, 'do', true, 0, optionsLen - 1);
                for(var i = 0; i < optionsLen; i++)
                {
                    var option = state.o[i];
                    success = success && validateStringProperty(option, 't');
                    success = success && checkDialogNextStateName(option, stateMap);
                    // TODO: class action validation
                    success = success && validateRequirement(option.r, Util.getProperty(state['n'], 'BAD NAME'));
                }
            }
            else
            {
                assertOrLog(false, 'o (options) must be an array');
            }
        }
    }
    return success;
}

//// -- Interacts Tests

//// -- Unit Test runners
var UnitTest = {};
UnitTest.run = function()
{
    startInteractValidator();
    startDialogValidator();
    startMenuValidator();
    startWindowValidator();
}

Util.createNestedObject(ig.global, 'data.unittest', UnitTest);

});