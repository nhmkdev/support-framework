/*
 This entity is the main player entity the user controls. The player is actually spawned (TODO: move it to /spawned ?)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.entities.spawned.player'
)
.requires(
	'impact.entity',
	'support.util',
	'support.pause',
    'support.save',
    'support.particle',
    'support.levelmanager',
    'game.entities.spawned.projectile',
    'game.entities.spawned.floattext',
    'game.objects.gameobjects',
    'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var Projectiles = ig.global.data.projectiles;
var HUD = ig.global.objects.hud;
var Particle = Support.particle;
var Particles = ig.global.data.particles;
var LevelManager = Support.levelmanager;

EntityPlayer = ig.Entity.extend
({
    // entity vars
	name:'mainplayer',
    size: {x: 16, y:16},
	offset: {x: 0, y: 0},
	maxVel: {x: 90, y: 150},
	friction: {x: 600, y: 0},
	animSheet: null,
    zIndex:5,
    type: ig.Entity.TYPE.A, // Player friendly group
    checkAgainst: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.PASSIVE,

    // player vars
	maxGroundVel:null,
    maxAirVel: { x: 70, y:150 }, // when in the air the player is limited in x velocity a little
    flip: false,
	accelGround: 400,
	accelAir: 150,
    maxAirX: 50,
	jump: 150,
	exiting:false,
	interactable:null,
    projectileFireRate:0.1, // TODO: tunable by upgrades maybe? (HUD graphic with animation to indicate charge?)
    attackTimer:null,
    weaponsEnabled:false,

    // TODO: facing!?

	init: function( x, y, settings )
    {
		this.parent( x, y, settings );

        this.maxGroundVel = this.maxVel;

        //this.flip = Util.getProperty(settings['flip'], false);

		// Add the animations
		this.animSheet = Util.loadAnimationSheet( 'boxred', 16, 16 );
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'run', 1, [0] );
		this.addAnim( 'jump', 1, [0] );
		this.addAnim( 'fall', 1, [0] );
        this.addAnim( 'death', 1, [0] );

        this.attackTimer = new ig.Timer();

        // trigger an eval of any save settings
        this.saveChangedHandler();

        // TODO: invincible for any period of time?
        Save.addSaveListener(this);
	},
	
	update: function()
    {
		// move left or right
		var accel = this.standing ? this.accelGround : this.accelAir;
		
        ig.show( 'x vel', this.vel.x.round(3) );
        ig.show( 'y vel', this.vel.y.round(3) );

        if(this.currentAnim == this.anims.death)
        {
            if( this.currentAnim.loopCount > 15)
            {
                this.kill();
            }
            this.parent();
            return;
        }

        if( ig.input.state('left') ) 
        {
			this.accel.x = -accel;
			this.flip = true;
		}
		else if( ig.input.state('right') ) 
        {
			this.accel.x = accel;
			this.flip = false;
		}
		else 
        {
			this.accel.x = 0;
		}
		
		// jump
		if(this.standing)
        {
            // TODO: change this to allow for 2 jump heights (press and hold jump vs. tap)
            if(ig.input.pressed('secondary'))
            {
                this.vel.y = -this.jump;
                this.maxVel = this.maxAirVel;
            }
            else
            {
                this.maxVel = this.maxGroundVel;
            }
		}

		// shoot
		if( ig.input.pressed('primary') && this.weaponsEnabled)
        {
            // TODO: spawn point should be outisde of the player too (flipped determines this!)
            // TODO: x offset will be the side of the player width wise (may need to be tweaked to match art)
            if(this.attackTimer.delta() >= 0)
            {
			    ig.game.spawnEntity( EntityProjectile, this.pos.x + (this.flip ? -this.size.x : this.size.x), this.pos.y, {flip:this.flip, source:this, projectile:Projectiles.redLaser} );
                this.attackTimer.set(this.projectileFireRate);
            }
            // NOTE: this was to determine that the position is the TOP LEFT
            //Particle.spawn(this.pos.x, this.pos.y, { p:Particles.single})
		}

        this.exiting = false;
		if(this.accel.x == 0 && this.accel.y == 0 && this.standing)
		{
            if(ig.input.pressed('up'))
            {
                if(this.interactable != null)
                {
                    this.interactable.performInteraction();
                }
                else
                {
                    // TODO: this needs to be expanded big time (or reworked...)
                    this.exiting = true;
                }
            }
		}
        
		// always reset the interact, even if consumed (the order of things makes this invalid) --TODO: re-evaluate
		this.interactable = null;
		
		ig.game.draw('vel: ' + this.vel.y, this.pos.x, this.pos.y);
		
		// set the current animation, based on the player's speed
		if( this.vel.y < 0 ) 
        {
			this.currentAnim = this.anims.jump;
		}
		else if( this.vel.y > 25 ) 
        {
			this.currentAnim = this.anims.fall;
		}
		else if( this.vel.x < -5  || this.vel.x > 5) 
        {
			this.currentAnim = this.anims.run;
		}
		else 
        {
			this.currentAnim = this.anims.idle;
		}
		
		this.currentAnim.flip.x = this.flip;

        //HUD.setStatusMessage('' + this.attackTimer.delta());

		this.parent();
	},

    saveChangedHandler: function()
    {
        this.weaponsEnabled = Save.getFlag('i', 'we', 0) == 1;
    },

    kill: function()
    {
        this.parent();
        LevelManager.reloadSave();
    }
});

});