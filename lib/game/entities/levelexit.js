/*
 This entity detects the player and force loads another level

 Keys for Weltmeister:

 level
    Id of the level to load from the Levels data structure

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

// TODO: smooth out the transition between levels

ig.module(
	'game.entities.levelexit'
)
.requires(
	'impact.entity',
	'support.util',
    'game.objects.hud',
    'support.levelmanager'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var LevelManager = Support.levelmanager;

EntityLevelexit = ig.Entity.extend
({
	// weltmeister vars
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(196, 255, 0, 0.7)',

    // entity vars
    size: {x: 16, y: 16},
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,

    // levelexit vars
    levelId: null,

	init: function( x, y, settings )
    {
        this.parent( x, y, settings );
		this.levelId = Util.getProperty(settings['level'], '');
	},
	
	
	check: function( other )
	{
		if(other instanceof EntityPlayer &&
            this.levelId != null)
		{
            LevelManager.loadDeferred(this.levelId);
		}
	}
});

});