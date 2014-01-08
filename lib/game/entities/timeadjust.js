/*
 This entity changes the time rate of the game (0.0-X.0).
 See the documentation for ig.Timer.timeScale for more information.

 Keys for Weltmeister:

 timerate
    The new timerate

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.entities.timeadjust'
)
.requires(
	'impact.entity',
	'support.util'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
    
EntityTimeadjust = ig.Entity.extend
({
    // weltmeister vars
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(226, 226, 35, 0.7)',
	

    // entity vars
    size: {x: 16, y: 16},
    gravityFactor:0,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,

    // timeadjust vars
    timerate:1,

	init: function( x, y, settings ) 
    {
        this.timerate = Util.getProperty(settings['timerate'], null);
		this.parent( x, y, settings );
	},
	
	
	check: function( other ) 
    {
		if(other instanceof EntityPlayer)
        {
            if(ig.Timer.timeScale != this.timerate)
            {
                ig.log('TimeAdjust: ' + this.timerate);
            }
            ig.Timer.timeScale = this.timerate;
        }
	},

});

});