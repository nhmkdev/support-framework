/*
 This is a specialized class for level (or otherwise grouping) functionality tied to dialogs/interacts/etc. Any
 functions written here and associated with an object under ig.global.objects can be accessed from the given definition
 (be it a dialog/interact/etc.)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.objects.level.demo'
)
.requires(
    'impact.game',
    'support.util',
    'support.save',
    'game.objects.hud'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;

function Demo(){};

Demo.prototype.spawnBot = function()
{
}

ig.global.objects.level.demo = new Demo();

});
