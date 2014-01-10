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

var unitTestFail = false;

// TODO: performance later -- http://jsperf.com/hasownproperty-vs-in-vs-undefined/12
// TODO: use delete to clean up entitiy vars

//// -- Generic functionality

/*
 Validates the given property is a number
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validateNumberProperty(obj, name, allowNone, min, max)
{
    allowNone = defaultFor(allowNone, false);

    var result = allowNone;
    if(Util.defined(obj[name]))
    {
        var val = obj[name];
        min = defaultFor(min, Number.MIN_VALUE);
        max = defaultFor(max, Number.MAX_VALUE);
        if(!isNaN(val))
        {
            var rangeValid = val >= min && val <= max;
            assertOrLog(rangeValid, name + ' must be within range: ' + min + ' to ' + max + ' (found: ' + val + ')');
            return;
        }
        else
        {
            result = false;
        }
    }
    assertOrLog(result, name  + ' must be assigned a valid number');
}

/*
 Validates the given property is a string
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validateStringProperty(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    var result = allowNone;
    if(obj.hasOwnProperty(name))
    {
        result = typeof obj[name] === 'string';
    }
    assertOrLog(result, name  + ' must be assigned a string');
}

/*
 Validates the given property is a bool
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validateBoolProperty(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    var result = allowNone;
    if(obj.hasOwnProperty(name))
    {
        result = typeof obj[name] === 'boolean';
    }
    assertOrLog(result, name  + ' must be assigned a boolean');
}

/*
 Validates the given property is a point object (ie. { x:0, y:0 })
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validatePointObject(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    var result = allowNone;
    if(Util.defined(obj[name]))
    {
        result = Util.hasAllProperties(obj[name], 'x', 'y');
        if(result)
        {
            result = typeof obj[name]['x'] == 'number' && typeof obj[name]['y'] == 'number'
        }
    }
    assertOrLog(result, name + ' must be assigned a point object (with x and y properties)');
}

/*
 Forces a load of a media file from an object property
 NOTE: This does not validate the file exists. Check the logs for any missing files when running.
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validateMediaFile(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    var result = allowNone;
    if(obj.hasOwnProperty(name))
    {
        result = null != Util.loadImage(obj[name]);
    }
    assertOrLog(result, name + ' must be assigned a valid media file.');
}

/*
 Forces a load of a font file from an object property
 NOTE: This does not validate the file exists. Check the logs for any missing files when running.
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validateFontFile(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    var result = allowNone;
    if(obj.hasOwnProperty(name))
    {
        result = null != Util.loadFont(obj[name]);
    }
    assertOrLog(result, name + ' must be assigned a valid font file.');
}

/*
 Validates the given property is an array
 @param {object} obj - The object to check the property of
 @param {string} name - The name of the property to check
 @param {bool} allowNone - (optional) Flag indicating that non-existence of the property is allowed
 */
function validateArrayProperty(obj, name, allowNone)
{
    allowNone = defaultFor(allowNone, false);
    var result = allowNone;
    if(Util.defined(obj[name]))
    {
        result = Util.isArray(obj[name]);
    }
    assertOrLog(allowNone, name + ' must be assigned a valid window array');
}

/*
 Validates the given function with a fallback to obj.base if the check fails
 @param {function} func - The validation function to call with the object and inputs
 The function must have a prototype of bool(obj, name, ...);
 @param {object} obj - The object to check with the validation function.
 @param {string} name - Property name to check
 @param {...} - All the remaining params required to call the input function
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
            func.apply(null, [obj.base].concat(args.slice(2)));
        }
    }
}

/*
 Asserts the input and logs on failure
 @param {bool} testVar - Value to assert is true
 @param {string} msg - The message to push into the error array
 */
function assertOrLog(testVar, msg)
{
    if(!testVar)
    {
        errorArray.push('ERR: ' + msg);
    }
}

/*
 Logs the result of a test based on the state of the errorArray object
 @param {string} type - type of test
 @param {string} msg - General message about the test (ie. identifier)
 */
function logResult(type, msg)
{
    console.log((errorArray.length == 0 ? 'PASS' : 'FAIL') + ' -- ' + type + ': ' + msg);
    var len = len = errorArray.length;
    for(var x = 0; x < len; x++)
    {
        console.log(errorArray[x]);
    }
    if(len > 0)
    {
        console.log('---- ' + len + ' error' + (len == 1 ? '' : 's' ) + '!');
        unitTestFail = true;
    }
    errorArray = [];
}

/*
 Returns the value of the input or defaults it if it is not defined
 @param {object} arg - object to check
 @param {object} def - default value if the object is not defined
 @return {object} either the value of the arg or def if arg was undefined
 */
function defaultFor(arg, def)
{
    return Util.defined(arg) ? arg : def;
}

//// Unit Test Validators
/*
 Tests the error cases of the various low level test functions
 */
function startUnitTestValidator()
{
    var emptyObject = {};
    var obj =
    {
        badBoolOrNumber:'test',
        badString:emptyObject,
        badPointObject: { x:0, z:4 },
        badPointObjectX: { x:'test' },
        badNumberRange:15
    }
    // missing value tests
    processUnitTestFail('missing bool', validateBoolProperty, emptyObject, 'z');
    processUnitTestFail('missing number', validateNumberProperty, emptyObject, 'z');
    processUnitTestFail('missing string', validateStringProperty, emptyObject, 'z');
    processUnitTestFail('missing point', validatePointObject, emptyObject, 'z');
    processUnitTestFail('missing array', validateArrayProperty, emptyObject, 'z');
    processUnitTestFail('missing media', validateMediaFile, emptyObject, 'z');
    processUnitTestFail('missing font', validateFontFile, emptyObject, 'z');

    // bad values tests
    processUnitTestFail('bad bool', validateBoolProperty, obj, 'badBoolOrNumber');
    processUnitTestFail('bad number', validateNumberProperty, obj, 'badBoolOrNumber');
    processUnitTestFail('bad bool', validateStringProperty, obj, 'badString');
    processUnitTestFail('bad point', validatePointObject, obj, 'badPointObject');
    processUnitTestFail('bad pointX', validatePointObject, obj, 'badPointObjectX');
    processUnitTestFail('bad range (low)', validateNumberProperty, obj, 'badNumberRange', false, 0, 14);
    processUnitTestFail('bad range (high)', validateNumberProperty, obj, 'badNumberRange', false, 16, 20);
}

/*
 Processes an individual unit test (assumes failure is success)
 @param {string} testName - description of the test
 @param {function} func - The function to execute as the test
 @param {...} arguments - Remaining arguments to pass into the func when called
 */
function processUnitTestFail(testName, func)
{
    var args = Array.prototype.slice.call(arguments);
    func.apply(null, args.slice(2));
    if(errorArray.length == 1)
    {
        errorArray = [];
    }
    else
    {
        errorArray.push('Test failed!')
    }
    logResult('UnitTest Tests', testName);
}

//// Requirements

var VALID_LOGIC_CHECKS = ['==', '!=', '<=', '>=', '>', '<'];

/*
 Validates a requirements object
 @param {object} reqObj - object to check
 @param {string} name - name of the object container
 */
function validateRequirement(reqObj, name)
{
    // NOTE: Nothing requires this object... (yet?!)
    if(!Util.defined(reqObj)) return;
    
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

/*
 Validates an animation state object
 @param {object} animStateObject - object to check
 @param {string} name - name of the object container
 */
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

/*
 Validates an animation object
 @param {object} animObject - object to check
 @param {string} name - name of the object container
 */
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

/*
 Validates a the menus data
 */
function startMenuValidator()
{
    menuValidator(ig.global.data.menus);
}

/*
 Validates a menu object
 @param {object} menuObject - object to check
 @param {string} name - name of the object container
 */
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
/*
 Validates a the windows data
 */
function startWindowValidator()
{
    windowValidator(ig.global.data.windows);
}

/*
 Validates a window object
 @param {object} windowObject - object to check
 @param {string} name - name of the object container
 */
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

/*
 Validates a the interacts data
 */
function startInteractValidator()
{
    interactsValidator(ig.global.data.interacts);
}

/*
 Validates a window object
 @param {object} interactObject - object to check
 @param {string} name - name of the object container
 */
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

/*
 Validates a the interacts data
*/
function startDialogValidator()
{
    dialogsValidator(ig.global.data.dialogs);
}

/*
 Validates a dialog object
 @param {object} dialogObject - object to check
 @param {string} name - name of the object container
 */
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

/*
 Validates the next state field of dialog object (or dialog option object)
 @param {object} obj - object to check
 @param {object} stateMap - name of the object container
 */
function checkDialogNextStateName(obj, stateMap)
{
    if(!Util.defined(obj['ns']) ||
        obj['ns'] == null ||
        Util.defined(stateMap[obj.ns]))
    {
        return;
    }
    assertOrLog(false, 'Could not find next state: ' + Util.getProperty(obj['ns'], '[BAD INPUT]'));
}

/*
 Validates the settings of a dialog
 @param {object} dialogObject - object to check
*/
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
        validateArrayProperty(settings, 'win', true);
        validateArrayProperty(settings, 'winex', true);
    }
    else
    {
        assertOrLog(false, 'Could not find settings.');
    }
}

/*
 Validates the states of a dialog
 @param {object} dialogObject - object to check
 */
function validateDialogStates(dialogObject)
{
    // TODO: determine if object is array
    if(!Util.defined(dialogObject['sa']))
    {
        assertOrLog(false, 'Could not find the state array.');
    }

    var stateMap = Util.createArrayToObjectMap(dialogObject.sa, 'n');

    for(var x = 0, len = dialogObject.sa.length; x < len; x++)
    {
        var state = dialogObject.sa[x];
        validateStringProperty(state, 'n', true);
        validateStringProperty(state, 't');
        checkDialogNextStateName(state, stateMap);
        validateArrayProperty(state, 'win', true);
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

//// -- Unit Test runners
var UnitTest = {};
UnitTest.run = function()
{
    startUnitTestValidator();
    startInteractValidator();
    startDialogValidator();
    startMenuValidator();
    startWindowValidator();
    console.log('---------------------');
    console.log(unitTestFail ?
                '|Unit Test Errors!  |' :
                '|Unit Test Passed!  |');
    console.log('---------------------')
}

Util.createNestedObject(ig.global, 'data.unittest', UnitTest);

});