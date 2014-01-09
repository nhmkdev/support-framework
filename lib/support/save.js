/*
 Save is a system for tracking strings/numbers associated with key+key value pairs. Values are partitioned and then
 key'd. The game may also register objects for listening to changes to the Save data to react accordingly. NOTE: This
 is not value specific so any change to the Save fires all listeners (performance wise probably not an issue, but
 arguably not AWESOME).

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.save'
)
.requires(
	'impact.game',
	'support.util'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;

var SAVE_DISABLED = true;
    
var LOCAL_STORAGE_NAME = 'localStorage';
var LOCAL_SAVE_NAME = 'savedata';

// Internal functions

/*
 Gets the value from the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {object} obj - The object to check the partition and id for
 @param {number/string} defaultValue - The default value if the item is not found
 @return {number/string} The value of the item
 */
function getVar(partition, id, obj, defaultValue)
{
    // assumes default value is actually specified
    var flagPartition = Util.getProperty(obj[partition], null);
    if(flagPartition != null)
    {
        return Util.getProperty(flagPartition[id], defaultValue);
    }
    return defaultValue;
}

/*
 Defaults the value for the save object (if it is not already assigned)
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {object} obj - The object to check the partition and id for
 @param {number/string} defaultValue - The default value if the item is not found
 */
function defaultVar(partition, id, obj, defaultValue)
{
    var flagPartition = Util.getProperty(obj[partition], null);
    if(flagPartition == null)
    {
        obj[partition] = {};
    }
    else if(Util.defined(obj[partition][id]))
    {
        return;
    }
    obj[partition][id] = defaultValue;
}

/*
 Sets the value from the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {object} obj - The object to set the value for
 @param {number/string} defaultValue - The default value if the item is not found
 @param {Save} saveObj - The save object
 */
function setVar(partition, id, obj, value, saveObj)
{
    var flagPartition = Util.getProperty(obj[partition], null);
    if(flagPartition == null)
    {
        obj[partition] = {};
    }
    obj[partition][id] = value;
    ig.log('SAVE: ' + partition + '.' + id + ':' + value);
    saveObj.updateListeners();
    saveObj.ticker++;
}

// TODO: flags might be too specific, might need a more general solution as flags can clear across levels potentially
// TODO: add version spec somewhere (probably in the game itself)
// TODO: central logger
    
//TODO: delete flags/tags function?    
    
function Save()
{
    this.lastSaveString = null;
    this.reset();
    this.allowListenerUpdate = true;
    this.ticker = 1; // ticker is a special value to track that the entire save has changed (for now this is hack for showdialog to avoid repetition)
}

/*
 Resets all flags/tags of the save object
 */
Save.prototype.reset = function()
{
	this.flags = {}; // numeric values (supports increment, decrement)
    this.tags = {}; // string values
}

/*
 Resets the t (temp) partition and any listening objects
 */
Save.prototype.levelLoadReset = function()
{
    // wipe out any temp flags
    delete this.flags['t'];
    delete this.tags['t'];
    // reinit the save objects
    this.saveListenerObjects = [];
}

//TODO: Add deleteSaveListener
//TODO: would a standard JS listener perform better?
/*
 Adds an object for listening to changes to the Save data (requires the object have saveChangedHandler() defined)
 @param {object} listenerObject - The object call saveChangedHandler() upon save changes
 */
Save.prototype.addSaveListener = function(listenerObject)
{
    if(!Util.defined(listenerObject['saveChangedHandler']))
    {
        Util.lge(listenerObject, 'saveChangedHandler is not defined in this type of object');
    }
    this.saveListenerObjects.push(listenerObject);
}

/*
 Saves the save data to local storage
 */
Save.prototype.saveData = function()
{
    var saveObj = {};
    saveObj.flags = this.flags;
    saveObj.tags = this.tags;
    var saveString = JSON.stringify(saveObj);
    this.lastSaveString = saveString;
    ig.log('Save: Saved string: ' + saveString);

    if(SAVE_DISABLED)
    {
        return true;
    }

    if(!this.isLocalStorageNameSupported())
    {
        ig.log('Save: Cannot save due to lack of local storage support');
        return false;
    }
    // TODO: XDK likely does not support this
    var localStorage = window[LOCAL_STORAGE_NAME];
    localStorage.setItem(LOCAL_SAVE_NAME, saveString);
}
    
/*
 Loads save data (not intended for level respawn -- see LevelManager)
 @param {bool} resetToLast - Resets to the last save game if true (otherwise loads from local storage if possible)
 */
Save.prototype.loadData = function(resetToLast)
{
    var saveString = null;
    
    if(resetToLast || SAVE_DISABLED)
    {
        saveString = this.lastSaveString;
    }
    else
    {
	   saveString = localStorage.getItem(LOCAL_SAVE_NAME);
    }
    
    if(Util.defined(saveString) && saveString != null)
    {
        //TODO: try catch
        this.lastSaveString = saveString;
        var saveObj = JSON.parse(saveString);
        ig.log('Save: Save data found: ' + saveString);
        this.flags = Util.getProperty(saveObj['flags'], {});
        this.tags = Util.getProperty(saveObj['tags'], {});
    }
    else
    {
        ig.log('Save: No save data found.');
    }
}

/*
 Gets the number value from the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {number} defaultValue - The default value if the item is not found
 @return {number} The value of the item
 */
Save.prototype.getFlag = function(partition, flag, defaultValue)
{
    return getVar(partition, flag, this.flags, Util.defined(defaultValue) ? defaultValue : 0);
}

/*
 Gets the string value from the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {string} defaultValue - The default value if the item is not found
 @return {string} The value of the item
 */
Save.prototype.getTag = function(partition, tag, defaultValue)
{
    return getVar(partition, tag, this.tags, Util.defined(defaultValue) ? defaultValue : null);
}

/*
 Gets the number value in the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {number} value - The value to set
 */
Save.prototype.setFlag = function(partition, flag, value)
{
    setVar(partition, flag, this.flags, value > 0 ? value : 0, this);
}

/*
 Gets the string value in the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {string} value - The value to set
 */
Save.prototype.setTag = function(partition, tag, value)
{
    setVar(partition, tag, this.tags, value, this);
}

/*
 Defaults the number value in the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {number} defaultValue - The value to set if it is not already defined
 */
Save.prototype.defaultFlag = function(partition, flag, defaultValue)
{
    defaultVar(partition, flag, this.flags, defaultValue);
}

/*
 Defaults the string value in the save object
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {string} defaultValue - The value to set if it is not already defined
 */
Save.prototype.defaultTag = function(partition, tag, defaultValue)
{
    defaultVar(partition, tag, this.tags, defaultValue);
}

/*
 Calls saveChangedHandler on all listening objects
 */
Save.prototype.updateListeners = function()
{
    if(!this.allowListenerUpdate) return;
    for(var x = 0, len = this.saveListenerObjects.length; x < len; x++)
    {
        this.saveListenerObjects[x].saveChangedHandler();
    }
}

/*
 Adjusts the numeric value of a flag (min at 0)
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {number} amount - The amount to adjust the value by
 @return {bool} True on success, false if the number would result in a negative number
 */
Save.prototype.adjustFlag = function(partition, flag, amount)
{
    var oldValue = this.getFlag(partition, flag);
    var newValue = oldValue + amount;
    this.setFlag(partition, flag, newValue > 0 ? newValue : 0);
    return newValue >= 0;
}

// TODO: incFlag and decFlag are weird... adjust flag seems like it should be the only one

/*
 Increments the numeric value of a flag
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {number} amount - The amount to increment the value by
 */
Save.prototype.incFlag = function(partition, flag, amount)
{
    amount = Util.defined(amount) ? amount : 1;
    this.setFlag(partition, flag, this.getFlag(partition, flag) + amount);
}

// TODO: add flag for overriding 0 min?
/*
 Decrements the numeric value of a flag (min at 0)
 @param (string) partition - The partition to operate with
 @param (string) id - The the id to operate with
 @param {number} amount - The amount to decrement the value by
 */
Save.prototype.decFlag = function(partition, flag, amount)
{
    amount = Util.defined(amount) ? amount : 1;
    var oldValue = this.getFlag(partition, flag);
    this.setFlag(partition, flag, Math.max(oldValue - amount, 0));
}


/*
 Processes an action object associated with an entity
 @param (object) entity - The entity to operate on
 @param (object) actionObj - The action object to operate with
 */
Save.prototype.processActionObject = function(entity, actionObj)
{
    if(!Util.defined(actionObj)) return;

    // limit the broadcasts of changes until the conclusion of all changes
    this.allowListenerUpdate = false;
    var saveChanged = false;

    saveChanged = saveChanged | this.callOnItems(actionObj['si'], this.incFlag);
    saveChanged = saveChanged | this.callOnItems(actionObj['sd'], this.decFlag);
    saveChanged = saveChanged | this.callOnItems(actionObj['sdef'], this.defaultFlag);
    saveChanged = saveChanged | this.callOnItems(actionObj['sv'], this.setFlag);
    if(Util.getProperty(actionObj['k'], false))
    {
        entity.kill();
    }
    this.allowListenerUpdate = true;
    if(saveChanged)
    {
        this.updateListeners();
    }
}

//TODO move this to util
/*
 Calls a function on the specified items
 @param (array) items - Array of items to operate on
 @param (function) func - The function to call
 @return {bool} True if items was defined, false otherwise
 */
Save.prototype.callOnItems = function(items, func)
{
    if(Util.defined(items))
    {
        for(var x = 0, len = items.length; x < len; x++)
        {
            func.apply(this, items[x]);
        }
        return true;
    }
    return false;
}

/*
 Processes the requirements object
 @param (reqsObject) reqsObj - Requirements object to operate with
 @return {bool} true if all requirements met (or none specified), false otherwise
 */
Save.prototype.processReqsObject = function(reqsObj)
{
    // TODO: remove the allowing for i to be empty or not an array... that's just bad data
    if(!Util.defined(reqsObj) || !Util.defined(reqsObj['i']) || !Util.isArray(reqsObj['i']))
    {
        return true;
    }
    var logicAnd = Util.getProperty(reqsObj['l'], 'and') == 'and';
    var valid = logicAnd; // if using 'and' default to true, on 'or' use false (so a result is true)
    for(var x = 0, len = reqsObj.i.length; x < len; x++)
    {
        var item = reqsObj.i[x];
        var result = true;
        if(!Util.isArray(item))
        {
            result = this.processReqsObject(item);
        }
        else
        {
            // NOTE: This is a rare instance of the data being manipulated by the code.
            // Convert the string to a function for all further uses
            if(typeof item[2] !== 'function')
            {
                item[2] = eval("(function(val){ return val " + item[2] + ";})");
            }
            result = item[2].apply(null, [this.getFlag(item[0], item[1])]);
        }

        // NOTE: these result in numbers not actual true/false
        if(logicAnd)
        {
            valid = valid & result;
        }
        else
        {
            valid = valid | result;
        }
    }
    // allow for negation of a result
    if(Util.getProperty(reqsObj['n'], false))
    {
        return !valid;
    }
    return valid;
}

/*
 Determined if local storage is supported
 @return {bool} true if supported, false otherwise
 */
Save.prototype.isLocalStorageNameSupported = function() 
{
    try 
    {
        return (this.LOCAL_STORAGE_NAME in window && window[LOCAL_STORAGE_NAME]);
    } 
    catch(e) 
    {
        return false;
    }
}

Support.save = new Save();

});
