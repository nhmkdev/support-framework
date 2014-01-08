/*
 Particle is a centralized processor for spawning data driven particles.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'support.particle'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util'
)
.defines(function(){

var Particle = {};
var Support = ig.global.support;
Support.particle = Particle;
var Util = Support.util;
// TODO: may need a system to load from a particle name from data...
//Util.createNestedObject(ig.global, 'data.particles');
//var Particles = ig.global.data.particles;

/*
 Gets a value within a given range (exclusive of max)
 @param (object/number) input - A number if the value is static, an array if a range is desired
 @param (bool) flip - Whether to flip the value (make negative)
 @param (bool) floor - Whether to floor the value
 @return {number} The resulting number
 */
function getRangedValue(input, flip, floor)
{
    // TODO: this is NOT inclusive of max
    if(typeof input === 'object')
    {
        val = (Math.random() * (input.max - input.min)) + input.min;
        if(floor)
        {
            val = Math.floor(val);
        }
    }
    else
    {
        val = input;
    }
    return val * (flip ? -1 : 1);
}

/*
 Spawns a set of particle entity at the specified location with the given settings
 @param (number) x - x location
 @param (number) y - y location
 @param (object) settings - The settings for a particle entity
 */
Particle.spawn = function(x, y, settings)
{
    var pobj = settings.p;
    var count = getRangedValue(pobj.n, false, true);

    for(var i = 0; i < count; i++)
    {
        ig.game.spawnEntity(EntitySupportParticle, x, y, settings);
    }
}

/*
 This is a particle entity driven by the particle data type specified in the Support Framework. This item is spawned
 and never specified directly in Weltmeister.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

EntitySupportParticle = ig.Entity.extend(
{
    macVelocity:{x:1000, y:1000},
    minBounceVelocity: 0,

    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.LITE,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );

        var pobj = settings.p;

        // TODO: error checking
        this.animSheet = Util.loadAnimationSheet(pobj.i, pobj.w, pobj.h);

        this.gravityFactor = Util.getProperty(pobj['g'], 1);

        this.size.x = pobj.w;
        this.size.y = pobj.h;

        this.friction = Util.getProperty(pobj['f'], { x:0, y: 0});
        this.bounciness = Util.getProperty(pobj['b'], 0);

        var frameRange = null;
        if(Util.defined(pobj['fr']))
        {
            frameRange = pobj['fr'];
        }
        else
        {
            var img = Util.loadImage(pobj.i);
            frameRange = {min:0, max:((img.height * img.width) / (pobj.w * pobj.h))};
        }
        var frame = getRangedValue(frameRange, false, true);

        this.addAnim( 'idle', 0.2, [frame] );

        this.currentAnim.flip.x = (Math.random() > 0.5);
        this.currentAnim.flip.y = (Math.random() > 0.5);

        // NOTE: flip only applies to X (TODO: support otherwise...)
        this.vel.x = getRangedValue(pobj.vx, settings.flip, true);
        this.vel.y = getRangedValue(pobj.vy, false, true);

        //ig.log('ParticleV: ' + this.vel.x + ',' + this.vel.y);

        this.lifeTimer = new ig.Timer();
        this.lifeTimer.set(getRangedValue(pobj.l, false, false));
    },

    update: function()
    {
        if( this.lifeTimer.delta() >= 0 )
        {
            this.kill();
            return;
        }
        this.parent();
    }
});

});
