/*
 Window is a single data-driven image to be displayed to the user.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.window'
)
.requires(
	'impact.game',
	'support.util'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Window = {};
Support.window = Window;

/*
 Loads all of the windows into the specified windowCollection
 @param (array) windows - Array of window data to load
 @param {array} windowCollection - Array to push all the windows into
 */
Window.loadWindows = function(windows, windowCollection)
{
    if(Util.defined(windows) && windows != null)
    {
        for( var idx = 0, len = windows.length; idx < len; idx++)
        {
            var windowData = windows[idx];
            var window = {};
            window.img = Util.loadImage(Util.getOverrideProperty('i', windowData, windowData.base, null));
            if(window.img != null)
            {
                Util.loadImageSettingsFromObject(windowData, window, window.img);
                windowCollection.push(window);
            }
        }
    }		
}

/*
 Draws all of the windows
 @param (array) windows - Array of window data to draw
 */
Window.drawWindows = function(windows)
{
    for( var idx = 0, len = windows.length; idx < len; idx++)
    {
        var window = windows[idx];
        Util.drawImage(window.img, window);
    }
}

});