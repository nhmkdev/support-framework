/*
 Pause is a system for managing whether the game entities are given any processing time or not.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.pause'
)
.requires(
	'impact.game',
	'impact.font',
	'support.util'
)
.defines(function(){

var Support = ig.global.support;

function Pause()
{
    this.paused = false;
	this.previousTimeScale = 1;
}

/*
 Toggles pause to the opposite of the current state (on unpause restores the previous time scale)
 */
Pause.prototype.togglePause = function()
{
	setPause(!this.paused);
};

/*
 Switches pause to the specified state (on unpause restores the previous time scale)
 @param (bool) pause - whether to pause or not
 */
Pause.prototype.setPause = function(pause)
{
	if(this.paused != pause)
	{
		if(pause)
		{
			this.previousTimeScale = ig.Timer.timeScale;
		}
		this.paused = pause;
		ig.Timer.timeScale = pause ? 0: this.previousTimeScale;
	}
};

Support.pause = new Pause();

});
