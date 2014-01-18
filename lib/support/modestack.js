/*
 Modestack is a handler for stacking game modes. This allows for the concept of backing out of a game mode (ie.
 returning to another menu). The code directly interfaces with the Custom Menu functionality.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.modestack'
)
.requires(
	'impact.game',
    'impact.font',
	'support.util'
)
.defines(function(){

var Support = ig.global.support;

function ModeStack()
{
	this.modeStack = [];
}

/*
 Pushes a game mode onto the stack and sets the game mode to the new mode
 @param (string) prevMode - The previous mode name
 @param (object)  prevMenuData - menu data for the previous mode
 @param (string) newMode - The new mode name
 @param (object)  newMenuData - menu data for the new mode
 */
ModeStack.prototype.push = function(prevMode, prevMenuData, newMode, newMenuData)
{
    this.modeStack.push({mode: prevMode, data: prevMenuData});
    this.setMenuData(newMenuData);
    ig.system.setGame(eval(newMode));
}

/*
 Pops the game mode stack and sets the mode to the popped mode
 */
ModeStack.prototype.pop = function()
{
    if(this.modeStack.length > 0)
    {
        var item = this.modeStack.pop();
        this.setMenuData(item.data);
        ig.system.setGame(eval(item.mode));
    }
}

/*
 Sets the menu data on the current custommenu
 @param (object) menuData - the menu data to set
 */
ModeStack.prototype.setMenuData = function(menuData)
{
    Support.custommenu.data = menuData;
}

/*
 Clears the mode stack
 */
ModeStack.prototype.clear = function()
{
	this.modeStack = [];
}

Support.modestack = new ModeStack();

});
