/*
 Single inclusion point for all the objects within the game.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.objects.gameobjects'
)
.requires(
    'game.objects.hud',
    'game.objects.level.demo',
    'game.objects.debugmenu'
)
.defines(function(){

});