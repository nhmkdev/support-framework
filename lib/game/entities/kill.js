/*
 This entity kills the player/enemy.

 Keys for Weltmeister: TODO (possible active toggle)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair

 */

ig.module(
	'game.entities.kill'
)
.requires(
	'impact.entity'
)
.defines(function(){

EntityKill = ig.Entity.extend
({
    // weltmeister vars
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(95, 0, 195, 0.7)',

    // entity vars
    size: {x: 32, y: 32},
    gravityFactor:0,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.BOTH,
	collides: ig.Entity.COLLIDES.NEVER,

	init: function( x, y, settings )
    {
        this.parent( x, y, settings );
	},
	
	check: function( other ) 
    {
		if(other instanceof EntityPlayer)
		{
            other.kill();
        }
	}
});

});