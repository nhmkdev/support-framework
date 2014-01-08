/*
 Start screen for the game (TODO: unused)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.startmenu' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util'
)
.defines(function(){

Util = ig.global.support.util;

StartScreen = ig.Game.extend
({
	instructText: null,

	init: function()
    {
		this.instructText = Util.loadFont('04b03.font');
	},
	
	update: function()
    {
		this.parent();
		if(ig.input.pressed('secondary'))
		{
			ig.global.support.gameModeStack.pop();
		}		
	},
	
	draw: function()
    {
		this.instructText.draw( 'Start Screen!', 80, 90, ig.Font.ALIGN.CENTER);
	}
});
});
