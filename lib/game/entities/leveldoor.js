/*
 This entity detects the player and allows optional interaction via player input

 Keys for Weltmeister:

 interact
    The name of the interact object to use for this interact entity

 level
    The name of the level to load (optional -- if this is a door)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.entities.leveldoor'
)
.requires(
	'impact.entity',
	'support.util',
    'support.animutil',
    'support.dialog',
    'support.levelmanager',
    'support.save',
    'game.objects.hud',
	'data.gamedata',
    'game.entities.interact'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Levels = ig.global.data.levels;
var LevelManager = Support.levelmanager;

EntityLeveldoor = EntityInteract.extend
({
    // weltmeister vars
	_wmBoxColor: 'rgba(40, 255, 0, 0.7)',

    // leveldoor vars
    levelData:null,
    levelId:null,

	init: function( x, y, settings )
	{
        this.parent( x, y, settings );

        if(this.interact != null)
        {
            this.levelId = Util.getProperty(settings['level'], null);
            if(this.levelId != null && Util.defined(Levels[this.levelId]))
            {
                this.levelData = Levels[this.levelId];
                this.hudText = this.levelData.n;
            }
        }
	},
	
	performInteraction: function()
	{
        this.parent();
        // TODO: locked door support (animation state)
        if(this.levelId != null)
        {
            LevelManager.loadDeferred(this.levelId);
        }
	}
});

});