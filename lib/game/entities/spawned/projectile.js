/*
 Projectile entity (weapons fire)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.entities.spawned.projectile'
)
.requires(
	'impact.entity',
	'support.util',
    'support.animutil',
	'support.pause',
    'support.particle',
    'data.gamedata'
)
.defines(function()
{

var Support = ig.global.support;
var Util = Support.util;
var Projectiles = ig.global.data.projectiles;
var Particle = Support.particle;

EntityProjectile = ig.Entity.extend
({
	// entity vars
    size: {x: 8, y: 4},
	offset: {x: 0, y: 2},
	maxVel: {x: 400, y: 400},
	gravityFactor:0,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.BOTH,
	collides: ig.Entity.COLLIDES.PASSIVE,
	animSheet: null,
    
    // projectile vars
    flip:false,
    damage:-10,
    velocityPush:0,
    source:null,
    collideParticle:null,
	
	init: function( x, y, settings ) 
    {
        // TODO: allow custom control over size, offset, gravity, bounce etc. (collision maybe?)
        
		this.parent( x, y, settings );
		
        if(Util.defined(settings['projectile']))
        {
            var projectile = settings['projectile'];
            if(typeof projectile == 'string')
            {
                // attempt to convert the string to the actual projectile object
                projectile = Util.getNestedProperty(Projectiles, projectile, null);
                if(!Util.defined(projectile) || projectile == null)
                {
                    Util.lge(this, 'EntityProjectile: Failed to convert string to projectile:' + settings['projectile']);
                    this.kill();
                    return;
                }
            }

            this.velocityPush = Util.getProperty(projectile['vp'], 0);

            this.collideParticle = Util.getProperty(projectile['p'], null);

            if(Util.defined(projectile['ao']))
            {
                Util.loadEntityAnimations(this, projectile.ao);
                // TODO: try catch this?
                // TODO: support both strings and objects? 
                this.damage = Util.getProperty(projectile['d'], -10);
                this.maxVel.x = Util.getProperty(projectile['v']['x'], 100);
                this.maxVel.y = Util.getProperty(projectile['v']['y'], 100);
            }
            else
            {
                Util.lge(this, 'EntityProjectile: Animation data not configured.');
            }
        }
        else
        {
            Util.lge(this, 'EntityProjectile: Invalid data');
            this.kill();
            return;
        }
           
        this.flip = Util.getProperty(settings['flip'], false);
        this.source = Util.getProperty(settings['source'], null);
        this.currentAnim.flip.x = this.flip;
        this.vel.x = (this.flip ? -this.maxVel.x : this.maxVel.x);
	},
		
    update: function()
    {
        // TODO: probably a bit odd...
        // kill anything that goes way out of range
        if(this.pos.x > 10000 || this.pos.x < -10000)
        {
            this.kill();
        }
        else if(this.currentAnim == this.anims.splash && this.currentAnim.loopCount > 0)
        {
            this.kill();
        }
        
        this.parent();
    },
    
	handleMovementTrace: function( res ) 
    {
        this.parent( res );

        // this is always collision layer collision
        if( res.collision.x || res.collision.y ) 
        {
            this.currentAnim = this.anims.splash;
            // flip is reversed on wall collision
            if(this.collideParticle != null)
            {
                Particle.spawn(this.pos.x, this.pos.y, { flip: !this.flip, p:this.collideParticle});
            }
            this.currentAnim.flip.x = this.flip;
		}

	},
    
    check: function ( other )
    {
        if(this.currentAnim == this.anims.splash) return;
        
        // Check is on the projectile vs. player ??
        // does not collide or damage the firing source (if applicable)
        if(other != this.source)
        {
            //TODO: plenty!
            /*
            //ig.log('check hit');
            if(other instanceof EntityPlayer)
            {
                other.adjustPoints(this.damage);
            }
            this.currentAnim = this.anims.splash;
            this.currentAnim.flip.x = this.flip;
            this.vel.x=0;*/
            // adjust the particles past the point of impact
            if(this.collideParticle != null)
            {
                Particle.spawn(this.pos.x + (this.flip ? -15 : 15), this.pos.y, { flip: this.flip, p:this.collideParticle});
            }
            if(this.velocityPush > 0 && other.collides != ig.Entity.COLLIDES.FIXED)
            {
                other.vel.x = other.vel.x + ((this.flip ? -1 : 1) * this.velocityPush);
            }
            if(Util.defined(other['adjustPoints']))
            {
                other.adjustPoints(this.damage);
            }
            this.kill();

        }
        if(other == this.source)
        {
            ig.log('check hit self');
            this.kill();
        }        
    },

    collideWith: function( other, axis )
    {
        if(this.currentAnim == this.anims.splash) return;

        // collideWith is on the projectile vs. entity
        // does not collide or damage the firing source (if applicable)
        if(other != this.source)
        {
            ig.log('collidewith hit');
            if(other instanceof EntityPlayer)
            {
                other.adjustPoints(this.damage);
            }
            this.currentAnim = this.anims.splash;
            this.currentAnim.flip.x = this.flip;
            this.vel.x=0;
        }
        if(other == this.source)
        {
            ig.log('collidewith hit self');
            this.kill();
        }
    }
});
    
});