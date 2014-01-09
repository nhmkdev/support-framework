/*
 Projectile data for use with Support Framework Projectile entity
 */

ig.module(
	'data.projectiles' 
)
.requires(
	'impact.game',
    'support.util',
    'data.init',
    'data.particles'
)
.defines(function(){

var Projectiles = {};
ig.global.data.projectiles = Projectiles;
var Particles = ig.global.data.particles;

// TODO: rename the a to ao for the animation object?
Projectiles.redLaser = 
{
    d:-10, // point damage
    vp:100, // x-position push on entity hit (default: 0)
    v: {x: 400, y: 400},
    p:Particles.sample,
    a: // animation object
    {
        i:'laser', // image name ('media/' is prepended)
        w:8, // width of frame
        h:8, // height of frame
        s: { x: 8, y: 2},
        o: { x: 0, y: 3},
        a:
        [ // animations
            {
                n:'active',
                ft:'0.2', // frametime
                seq:[0,1] // sequence
            },
            {
                n:'splash',
                ft:'0.1', // frametime
                seq:[2,3,4,5,6], // sequence
                s:true
            }
        ]
    }    
}

Projectiles.greenLaser = 
{
    d:-10, // point damage
    vp:100, // x-position push on entity hit (default: 0)
    v: {x: 400, y: 400},
    p:Particles.sample,
    a: // animation object
    {
        i:'laserg', // image name ('media/' is prepended)
        w:8, // width of frame
        h:8, // height of frame
        s: { x: 8, y: 2},
        o: { x: 0, y: 3},
        a:  // animations
        [
            {
                n:'active',
                ft:'0.2', // frametime
                seq:[0,1] // sequence
            },
            {
                n:'splash',
                ft:'0.1', // frametime
                seq:[2,3,4,5,6], // sequence
                s:true
            }
        ]
    }    
}

});