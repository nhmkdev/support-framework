/*
 Util contains the core functionality for handling very common functions throughout the game/framework.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.util' 
)
.requires(
	'impact.game',
    'impact.font'
)
.defines(function(){

var Util = {};

/*
 Splits a string to fit within a given horizontal space.
 @param {string} str - The string to split
 @param {number} maxLineWidth - The desired line width
 @param {font} font - The font to use for measuring
 @param {object} heightObject - (optional) Object that will be assigned the total height (heightObject.height)
 @return (string) The string broken up by newlines.
 */
Util.splitStringToWidth = function (str, maxLineWidth, font, heightObject)
{
	// TODO: currently only breaks on spaces... kind of limited!
	var newString = "";
	var currentWord = "";
	var currentLineWidth = 0;
	var currentWordWidth = 0;
	// intentionally don't include the line spacing (so there are lines-1 linespaces)
	var totalHeight = font.height; 
    // 32 = space
	var spaceWidth = font.widthMap[32 - font.firstChar] + font.letterSpacing;
	for(var nIdx = 0, len = str.length; nIdx < len; nIdx++)
	{
        if(str.charCodeAt(nIdx) == 10)
        {
            currentLineWidth = 0;
			currentWordWidth = 0;
			newString += ' ' + currentWord + '\n';
			currentWord = '';  
            totalHeight += font.height + font.lineSpacing;
            continue;
        }
        
        if(str.charCodeAt(nIdx) != 32)
		{
			currentWord += str.charAt(nIdx);
			currentWordWidth += font.widthMap[str.charCodeAt(nIdx) - font.firstChar] + font.letterSpacing;
		}
	
		if(str.charCodeAt(nIdx) == 32 || nIdx + 1 >= str.length)
		{
			if(currentLineWidth == 0)
			{
				// just add the word (word might actually be too long! Boo hoo!)
				currentLineWidth += currentWordWidth;
			}
			else if(currentLineWidth + spaceWidth + currentWordWidth <= maxLineWidth)
			{
				// word fits within line with space before it
				currentLineWidth += spaceWidth + currentWordWidth;
				newString += ' ';
			}
			else
			{
				// word is too long to fit, start a new line
				currentLineWidth = currentWordWidth;
				newString += '\n';
				totalHeight += font.height + font.lineSpacing;
			}
			currentWordWidth = 0;
			newString += currentWord;
			currentWord = '';
		}
	}
	if(typeof heightObject !== "undefined")
	{
		heightObject.height = totalHeight;
	}
	
	return newString;
}

/*
 Returns the time remaining in a time formatted string (Xh Xm Xs)
 @param {number} ms - The number of milliseconds for a given point in time.
 @return {string} The time remaining int a formatted string
 */
Util.timeRemaining = function(ms)
{
    // TODO: localization...
    ms = ms - Date.now();
    if(ms <= 0)
    {
        return '0s';
    }
    var totalSeconds = Math.floor(ms / 1000);
    var result = '';

    var hours = Math.floor(totalSeconds / 3600);
    if(hours > 0)
    {
        totalSeconds = totalSeconds - hours * 3600;
        result = result + hours + 'h' + ' ';
    }
    var minutes = Math.floor(totalSeconds / 60);
    if(minutes > 0)
    {
        totalSeconds = totalSeconds - minutes * 60;
        result = result + minutes + 'm' + ' ';
    }
    return result + totalSeconds + 's'; 
}

/*
 Attempts to localize and translate tokens of a string. (not so much on the localize part at this time!)
 @param {string} raw - Raw string containing token items (ie. [token])
 @param {object} obj - The object containing the getKeyString method for translating tokens
 @return Localized string
 */
Util.localizeString = function(raw, obj)
{
    var regExp = /\[(.*?)\]/g;
    var match;
    while ((match = regExp.exec(raw)) != null)
    {
        // TODO: obj check for getKeyString method
        var o = match[0];
        // this is a minor optimization to replace all instances of the given key
        var localizedKey = obj.getKeyString(match[1]);
        raw = raw.replace(match[0], localizedKey);
        // Reset the match to continue from the originally found item plus it's new length (not match[1].length necessarily!!)
        regExp.lastIndex = match.index + localizedKey.length;
    }
    return raw;
}

/*
 Creates the nested object if it does not already exist
 @param {object} obj - The object to create the nested item under
 @param {string} nested - String representing the desired nested object (period delimited)
 @param {object} value - (optional) The value to assign to the nested object.
 */
Util.createNestedObject = function(obj, nested, value)
{
	var splitItem = nested.split('.');
	for(var idx = 0, len = splitItem.length; idx < len; idx++)
	{
		if(!obj.hasOwnProperty(splitItem[idx]))
		{
				// replace the final item with the value if applicable
				if(idx + 1 >= splitItem.length && typeof value !== "undefined")
				{
					obj[splitItem[idx]] = value;
				}
				else
				{
					obj[splitItem[idx]] = {};
				}
		}
		obj = obj[splitItem[idx]];
	}
}

/*
 Gets the value of a nested object.
 @param {object} obj - The object to seek the nested property of
 @param {string} nested - String representing the desired nested object (period delimited)
 @param {object} defaultValue - The default value if the nested property does not exist
 @return {object} The value of the nested property
 */
Util.getNestedProperty = function(obj, nested, defaultValue)
{
	var splitItem = nested.split('.');
	for(var idx = 0, len = splitItem.length; idx < len; idx++)
	{
		if(!Util.defined(obj[splitItem[idx]]))
		{
			return defaultValue;
		}
		obj = obj[splitItem[idx]];
	}
	return obj;
}

/*
 Checks if all the given properties exist on an object
 @param {object} obj - The object to check for properties
 @param {...} - All remaining params are strings to check the object for the existence of a corresponding property
 @return {bool} true on success, false otherwise
 */
Util.hasAllProperties = function(obj)
{
	if(typeof obj !== 'undefined' && obj != null)
	{
		for(var x = 1, len = arguments.length; x < len; x++)
		{
			if(!Util.defined(obj[arguments[x]]))
			{
				return false;
			}
		}
		return true;
	}
	return false;
}

/*
 Gets the value of a property on an object, defaulting to another object if it is not found
 @param {string} property - The property to get
 @param {object} obj - The object to seek the nested property of
 @param {object} baseobj - The object to fallback to if the property is not fond
 @param {object} defaultValue - The default value if the property is not found on either object
 @return {object} The value of the property
 */
Util.getOverrideProperty = function(property, obj, baseobj, defaultValue)
{
	if(!obj.hasOwnProperty(property))
	{
		if(Util.defined(baseobj) && baseobj != null && baseobj.hasOwnProperty(property))
		{
			return baseobj[property];	
		}
		else
		{
			return defaultValue;
		}
	}
	return obj[property];
}

/*
 Gets the value of an object
 @param {object} arg - The object to get
 @param {object} def - The default if the property is not found
 @return {object} The value of the property
 */
Util.getProperty = function(arg, def)
{
    return (typeof arg !== 'undefined') ? arg : def;
}

/*
 Gets whether the given object is defined
 @param {object} arg - The object to check
 @return {bool} true if the object is defined, false otherwise
 */
Util.defined = function(arg)
{
    return typeof arg !== 'undefined';
}

/*
 Checks if the parameter is an array
 @param {object} arr - The object to check
 @return {bool} True if the object is an array, false otherwise
*/
Util.isArray = function(arr)
{
    return Object.prototype.toString.call(arr) === "[object Array]";
}

/*
 Creates an object from an array using the specified property as the key for mapping all the items from the array to the object
 @param (array) arr - Array to create the mapping from
 @param (string) prop - property to use as the key from each object in the array
 @param (object) obj - The object to map the items into (optional, will create a new object if necessary)
 @return (object) - The object with the mapped items, or null on error
 */
Util.createArrayToObjectMap = function(arr, prop, obj)
{
    if(!Util.defined(obj)) { obj = {}; }
    //TODO: more error checking?
    for(var x = 0, len = arr.length; x < len; x++)
    {
        obj[arr[x][prop]] = arr[x];
    }
    return obj;
}

/*
 Loads an image ('media/' is prepended and '.png' is appended)
 @param {string} path - The path of the file
 @return {ig.Image} An image object on success, otherwise null
 */
Util.loadImage = function loadImage(path)
{
	if(path != null)
	{
		return new ig.Image('media/' + path + '.png');
	}
	return null;
}

/*
 Loads image settings into object
 @param {object} obj - The object to use for checking properties (base will be used to default)
 @param {object} targetObj - The target object to set the properties of
 @param {ig.Image} img - The Image object to default the width and height to
 @return {bool} true if the object is defined, false otherwise
 */
Util.loadImageSettingsFromObject = function(obj, targetObj, img)
{
	targetObj.targetX = Util.getOverrideProperty('x', obj, obj.base, 0);
	targetObj.targetY = Util.getOverrideProperty('y', obj, obj.base, 0);
	targetObj.sourceX = Util.getOverrideProperty('sx', obj, obj.base, 0);
	targetObj.sourceY = Util.getOverrideProperty('sy', obj, obj.base, 0);
	targetObj.width = Util.getOverrideProperty('w', obj, obj.base, img.width);
	targetObj.height = Util.getOverrideProperty('h', obj, obj.base, img.height);
}

/*
 Loads an image from a property
 @param (string) property - The property to load the image from
 @param {object} obj - The object to check the property of
 @param {object} baseobj - The base object to default to if the obj is missing the property field
 @return {ig.Image} An image object on success, otherwise null
 */
Util.loadImageFromOverridePropery = function(property, obj, baseobj)
{
	if(obj.hasOwnProperty(property))
	{
		return new ig.Image( obj[property] );
	}
	else if(typeof baseobj !== 'undefined' && baseobj != null && baseobj.hasOwnProperty(property))
	{
		return new ig.Image(baseobj[property]);
	}
	return null;
}

/*
 Loads an image from a property
 @param (string) property - The property to load the image from
 @param {object} obj - The object to check the property of
 @param {object} baseobj - The base object to default to if the obj is missing the property field
 @return {ig.Image} An image object on success, otherwise null
 */
Util.loadImageFromProperty = function(property, obj)
{
	if(obj.hasOwnProperty(property))
	{
		return new ig.Image( obj[property] );
	}
	return null;
}

/*
 Draws an image based on the settings object supplied
 @param (ig.Image) img - The image to draw
 @param {object} settings - The object containing the settings to use to draw the image
 */
Util.drawImage = function(img, settings)
{
	if(img != null)
	{
		img.draw(settings.targetX, settings.targetY, settings.sourceX, settings.sourceY, settings.width, settings.height);
	}
}

/*
 Logs a message about the given entity
 @param {object} entity - The entity to log for
 @param (string) msg - The message to log
 */
Util.lg = function(entity, msg)
{
    ig.log('(' + entity.pos.x + ',' + entity.pos.y + ') LOG: ' + msg);
}

/*
 Logs an error message about the given entity
 @param {object} entity - The entity to log for
 @param (string) msg - The message to log
 */
Util.lge = function(entity, msg)
{
    ig.log('(' + entity.pos.x + ',' + entity.pos.y + ') ERROR: ' + msg);
}

/*
 Loads an image ('media/' is prepended and '.png' is appended)
 @param (string) path - The path to the file
 @return {ig.Font} A font object on success, otherwise null
 */
Util.loadFont = function(fontPath)
{
	return new ig.Font( 'media/' + fontPath + '.png');
}

/*
 Loads an AnimationSheet ('media/' is prepended and '.png' is appended)
 @param (string) path - The path to the file
 @param {number} width - Width of a single frame of the animation
 @param {number} height - Height of a single frame of the animation
 @return {ig.AnimationSheet} An animationsheet object on success, otherwise null
 */
Util.loadAnimationSheet = function(path, width, height)
{
	return new ig.AnimationSheet( 'media/' + path + '.png', width, height);
}

Util.createNestedObject(ig.global, 'support.util');
ig.global.support.util = Util;
// create object for in-game objects
ig.global.objects = {};
ig.global.objects.level = {};

});
