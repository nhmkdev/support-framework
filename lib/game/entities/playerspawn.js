/*
 This entity triggers a collect item

 Keys for Weltmeister:

 level
    Last levelid loaded spawn point (entry from level)

 default
    1 (one) indicates this is the default spawn point (default: 0)

 face
    1 indicates left facing (default: r)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair

 */

ig.module(
    'game.entities.playerspawn'
)
.requires(
    'impact.entity',
    'support.levelmanager'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var LevelManager = Support.levelmanager;

EntityPlayerspawn = ig.Entity.extend
({
    // weltmeister vars
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(64, 28, 230, 0.7)',

    // entity vars
    size: {x: 16, y: 16},
    gravityFactor:0,
    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    // spawn vars
    defaultSpawn:0,
    id:null,
    useXOffset:false,
    useYOffset:false,
    useVelocity:false,

    // TODO: offset so when play falls/jumps through a spawn/exit they start in the same position they left

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );
        this.id = Util.getProperty(settings['id'], '');
        this.defaultSpawn = Util.getProperty(settings['default'], '0') == '1';
        this.flip = Util.getProperty(settings['face'], '0') == '1';
        this.useXOffset = Util.getProperty(settings['usex'], '0') == '1';
        this.useYOffset = Util.getProperty(settings['usey'], '0') == '1';
        this.useVelocity = Util.getProperty(settings['usev'], '0') == '1';
    },

    getOffset: function()
    {
        // TODO: this may cause an issue if the player spawns into an exit!
        var point ={};
        point.x = this.useXOffset ? this.pos.x + LevelManager.relativeExitOffset.x : this.pos.x;
        point.y = this.useYOffset ? this.pos.y + LevelManager.relativeExitOffset.y : this.pos.y;
        return point;
    },

    updateVelocity: function(entity)
    {
        if(this.useVelocity)
        {
            entity.vel.x = LevelManager.exitVelocity.x;
            entity.vel.y = LevelManager.exitVelocity.y;
        }
    }
});

});