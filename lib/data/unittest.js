/*
 Unit tests for the various data types in the Support Framework

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

//TODO: loading the font or image does not validate it is present
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

function logResult(type, msg)
{
    ig.log(type + ':' + (errorArray.length == 0 ? 'PASS' : 'FAIL') + ' ' + msg);
    var len = len = errorArray.length;
    for(var x = 0; x < len; x++)
    {
        ig.log(errorArray[x]);
    }
    if(len > 0)
    {
        ig.log('---- ' + len + ' error' + (len == 1 ? '' : 's' ) + '!');
    }
    errorArray = [];
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
    
    if(Util.defined(reqObj['i']) && Util.isArray(reqObj['i']))
    {
        if(Util.defined(reqObj['l']) && !(reqObj['l'] == 'and' || reqObj['l'] == 'or'))
        {
            assertOrLog(false, name + ' l (logic) must be "and" or "or"');
        }
        for(var x = 0, len = reqObj.i.length; x < len; x++)
        {
            var item = reqObj.i[x];
            if(!Util.isArray(item))
            {
                validateRequirement(item);
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
                    assertOrLog(logicFound,
                        name + ' logic check (last param) is invalid type: ' + item[2]);
                }
                else
                {
                    assertOrLog(true, name  + ' contains a requirement that is not 3 parameters');
                }
            }
        }
    }
    else
    {
        assertOrLog(false, name + ' requirements must define i (items) and it must be an array')
    }
}

//// -- Animation Object Tests (basic type)

function animationStateValidator(animStateObject, name)
{
    validateStringProperty(animStateObject, 'n');
    validateNumberProperty(animStateObject, 'ft', false, 0, 65536);
    assertOrLog(Util.defined(animStateObject['seq']) && Util.isArray(animStateObject['seq']), name + ' must define the seq (animation sequence)');
    validateBoolProperty(animStateObject, 's', true);
    validatePointObject(animStateObject, 'b', true);
    validatePointObject(animStateObject, 'bo', true);
    validateNumberProperty(animStateObject, 'g', true, 0, 1024);
    if(Util.defined(animStateObject['c']) && !Util.defined(ig.Entity.COLLIDES[animStateObject['c']]))
    {
        assertOrLog(false, name + ' needs to specify a valid type of collision in the c property');
    }
    validateRequirement(animStateObject['r'], name);
}

        // TODO: use this as a standard validator
function animationObjectValidator(animObject, name)
{
    
    validateMediaFile(animObject, 'i');
    validateNumberProperty(animObject, 'w', false, 0, 65536);
    validateNumberProperty(animObject, 'h', false, 0, 65536);
    validatePointObject(animObject, 's', true);
    validatePointObject(animObject, 'o', true);
    validateNumberProperty(animObject, 'g', true, 0, 1024);
    if(Util.defined(animObject['a']) && Util.isArray(animObject['a']))
    {
        for(var x = 0, len = animObject.a.length; x < len; x++)
        {
            animationStateValidator(animObject.a[x], name);
        }
    }
    else
    {
        assertOrLog(false, name + ' must contain animation state objects');
    }
}

//// -- Menu Unit Tests

function startMenuValidator()
{
    menuValidator(ig.global.data.menus);
}
    
function menuValidator(menuObject, name)
{
    
    if(menuObject.hasOwnProperty('s'))
    {
        var settings = menuObject.s;
        var menuIcon = Util.getOverrideProperty('micn', settings, settings.base, null);
        if(menuIcon != null)
        {
            validateMediaFile(menuIcon, false);
        }
        var menuFont = Util.getOverrideProperty('f', settings, settings.base, null);
        if (menuFont != null)
        {
            Util.loadFont(menuFont) != null;
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
                assertOrLog(hasAction, ' No valid action specified (g or m)');
            }
        }
        else
        {
            assertOrLog(false, 'No menu items specified.');
        }

        logResult('Menu', name);
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
    
    if(windowObject.hasOwnProperty('i'))
    {
        // TODO: consider checks in the base object?
        validateMediaFile(windowObject, 'i');
        validateNumberProperty(windowObject, 'x', true);
        validateNumberProperty(windowObject, 'y', true);
        validateNumberProperty(windowObject, 'sx', true);
        validateNumberProperty(windowObject, 'sy', true);
        validateNumberProperty(windowObject, 'w', true, 1, Number.MAX_VALUE);
        validateNumberProperty(windowObject, 'h', true, 1, Number.MAX_VALUE);
        logResult('Window', name);
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
    
    var foundData = false;
    if(Util.defined(interactObject) &&
        (Util.defined(interactObject['d']) || Util.defined(interactObject['ao'])))
    {
        var dataDefined = false; // dialog or animation object must be found (or both)
        if(Util.defined(interactObject['d']))
        {
            assertOrLog(
                null != Util.getNestedProperty(ig.global.data.dialogs, interactObject.d, null),
                'Dialog specified is not found. [' + interactObject.d + ']');
            dataDefined = true;
        }
        if(Util.defined(interactObject['ao']))
        {
            animationObjectValidator(interactObject.ao);
            dataDefined = true;
        }
        dataDefined;
        logResult('Interact', name);
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
        validateDialogSettings(dialogObject);
        validateDialogStates(dialogObject);
        logResult('Dialog', name);
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
    
    // TODO: base processing?
    if(dialogObject.hasOwnProperty('s'))
    {
        var settings = dialogObject.s;
        validateWithBaseFallback(validateFontFile, settings, 'f');
        // TODO: document si and sia
        validateMediaFile(settings, 'si', true);
        if(Util.defined(settings['sia']))
        {
            var sia = settings.sia;
            validateNumberProperty(sia, 'sx', true);
            validateNumberProperty(sia, 'sy', true);
            validateNumberProperty(sia, 'w', true);
            validateNumberProperty(sia, 'h', true);
        }
        validateNumberProperty(settings, 'x', true);
        validateNumberProperty(settings, 'y', true);
        validateNumberProperty(settings, 'osx', true);
        validateNumberProperty(settings, 'osy', true);
        validateWithBaseFallback(validateNumberProperty, settings, 'w');
        validateNumberProperty(settings, 'x', true);
        validateBoolProperty(settings, 'seq', true);
        if(Util.defined(settings['c']))
        {
            assertOrLog(
                null != Util.getNestedProperty(ig.global, settings.c),
                'Associated class does not exist: ' + settings.c);
            // TODO: more validation on class?
        }
        validateWindowArray(settings, 'win', true);
        validateWindowArray(settings, 'winex', true);
    }
    else
    {
        assertOrLog(false, 'Could not find settings.');
    }
}

function validateDialogStates(dialogObject)
{
    // TODO: determine if object is array
    if(!Util.defined(dialogObject['sa']))
    {
        return assertOrLog(false, 'Could not find the state array.');
    }
    
    

    var stateMap = Util.createArrayToObjectMap(dialogObject.sa, 'n');

    for(var x = 0, len = dialogObject.sa.length; x < len; x++)
    {
        var state = dialogObject.sa[x];
        validateStringProperty(state, 'n', true);
        validateStringProperty(state, 't');
        checkDialogNextStateName(state, stateMap);
        validateWindowArray(state, 'win', true);
        if(state.hasOwnProperty('o'))
        {
            if(Util.isArray(state.o))
            {
                var optionsLen = state.o.length;
                validateNumberProperty(state, 'do', true, 0, optionsLen - 1);
                for(var i = 0; i < optionsLen; i++)
                {
                    var option = state.o[i];
                    validateStringProperty(option, 't');
                    checkDialogNextStateName(option, stateMap);
                    // TODO: class action validation
                    validateRequirement(option.r, Util.getProperty(state['n'], 'BAD NAME'));
                }
            }
            else
            {
                assertOrLog(false, 'o (options) must be an array');
            }
        }
    }
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