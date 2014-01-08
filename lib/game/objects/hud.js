/*
 A basic implementation of a HUD for the demo.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.objects.hud'
)
.requires(
	'impact.game',
    'support.util',
    'support.window',
    'support.save',
    'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Save = Support.save;
var Util = Support.util;
var Window = Support.window;
var Windows = ig.global.data.windows;

var MAX_POINT_PAD = 10;

// TODO: weapon charge alpha image (etc.)

function HUD()
{
    this.font = Util.loadFont('04b03.font');
    this.pointPadString = '';
    this.statusText = '';
    this.statusTimeout = 0;
    this.showMessageThisFrame = false;
    for(var x = 0; x < MAX_POINT_PAD; x++)
    {
        this.pointPadString = this.pointPadString + '0';
    }
    this.windows = [];
    var windowsToLoad = [];
    Window.loadWindows(windowsToLoad, this.windows);
}

HUD.prototype.initialize = function()
{
    // these have to be configured after the size is actually set.
   this.pointsLocation = 
    {
        x:ig.system.width/2,
        y:ig.system.height - (this.font.height + 5)
    }
    this.statusLocation = 
    {
        x:ig.system.width/2,
        y:this.pointsLocation.y - (this.font.height + 15)
    }
}

HUD.prototype.setStatusMessage = function(message)
{
    this.showMessageThisFrame = true;
    this.statusText = message;
}

HUD.prototype.addStatusMessage = function(message, timeoutSeconds)
{
    this.statusText = message;
    this.statusTimeout = timeoutSeconds * 1000 + Date.now();
}
    
// TODO: cache of the points and flush at some other point (maybe register a method to set flags? --- or not...)

HUD.prototype.update = function()
{
}

HUD.prototype.draw = function()
{
    Window.drawWindows(this.windows);

    // TODO: register with save system to only update when inventory changes
    var pts = '' + Save.getFlag('i', 'pt', 0);
    var pointsStr = (this.pointPadString + pts).slice(Math.min(MAX_POINT_PAD, pts.length));
    
    this.font.draw( 'Points: ' + pointsStr, this.pointsLocation.x, this.pointsLocation.y, ig.Font.ALIGN.CENTER);

    // allow a timeout or a forced message (for persistent text when colliding with an entity for example)
    if((Date.now() < this.statusTimeout) || this.showMessageThisFrame)
    {
        this.showMessageThisFrame = false;
        this.font.draw( this.statusText, this.statusLocation.x, this.statusLocation.y, ig.Font.ALIGN.CENTER);
    }
}
    
ig.global.objects.hud = new HUD();

});
