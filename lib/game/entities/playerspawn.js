/*
 This entity triggers a collect item

 Keys for Weltmeister:

 level
    Last levelid loaded spawn point (entry from level)

 start
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

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );
        this.lastLevelId = Util.getProperty(settings['level'], '');
        this.defaultSpawn = Util.getProperty(settings['start'], '0') == '1';
        this.flip = Util.getProperty(settings['face'], '0') == '1';
    }
});

});