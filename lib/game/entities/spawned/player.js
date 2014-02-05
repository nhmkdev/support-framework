/*
 This entity is the main player entity the user controls. The player is actually spawned.

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
	name:'player',
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
    controlsEnabled:true,

    animPlayerStateEnum:
    {
        NORMAL:0,
        SHORT:1
    },

    animPlayerState:null,
    animPlayerStateArray:[],
    animPlayerStateIndex:-1, // defaults to undefined
    moveCompleteCallback:null,

	init: function( x, y, settings )
    {
		this.parent( x, y, settings );

        this.maxGroundVel = this.maxVel;

        //this.flip = Util.getProperty(settings['flip'], false);

		// Add the animations
		this.animSheet = Util.loadAnimationSheet( 'boxred', 16, 16 );
        this.animPlayerStateArray.push({});
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'run', 1, [0] );
		this.addAnim( 'jump', 1, [0] );
		this.addAnim( 'fall', 1, [0] );
        this.animPlayerStateArray[this.animPlayerStateEnum.NORMAL].idle = this.anims.idle;
        this.animPlayerStateArray[this.animPlayerStateEnum.NORMAL].run = this.anims.run;
        this.animPlayerStateArray[this.animPlayerStateEnum.NORMAL].jump = this.anims.jump;
        this.animPlayerStateArray[this.animPlayerStateEnum.NORMAL].fall = this.anims.fall;

        this.animPlayerStateArray.push({});
        this.addAnim( 'idle_sm', 1, [1] );
        this.addAnim( 'run_sm', 1, [1] );
        this.addAnim( 'jump_sm', 1, [1] );
        this.addAnim( 'fall_sm', 1, [1] );
        this.animPlayerStateArray[this.animPlayerStateEnum.SHORT].idle = this.anims.idle_sm;
        this.animPlayerStateArray[this.animPlayerStateEnum.SHORT].run = this.anims.run_sm;
        this.animPlayerStateArray[this.animPlayerStateEnum.SHORT].jump = this.anims.jump_sm;
        this.animPlayerStateArray[this.animPlayerStateEnum.SHORT].fall = this.anims.fall_sm;

        this.changePlayerState(this.animPlayerStateEnum.NORMAL);

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

        if( ig.input.state('left') && this.controlsEnabled)
        {
			this.accel.x = -accel;
			this.flip = true;
		}
		else if( ig.input.state('right') && this.controlsEnabled)
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
            if(ig.input.pressed('secondary') && this.controlsEnabled)
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
		if( ig.input.pressed('primary') && this.weaponsEnabled && this.controlsEnabled)
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

		if(this.accel.x == 0 && this.accel.y == 0 && this.standing)
		{
            if(ig.input.pressed('up') && this.controlsEnabled)
            {
                if(this.interactable != null)
                {
                    this.vel.x = this.vel.y = this.accel.x = this.accel.y = 0;
                    this.interactable.performInteraction();
                }
            }
		}
        
		// always reset the interact
		this.interactable = null;

		ig.game.draw('vel: ' + this.vel.y, this.pos.x, this.pos.y);
		
		// set the current animation, based on the player's speed
		if( this.vel.y < 0 ) 
        {
			this.currentAnim = this.animPlayerState.jump;
		}
		else if( this.vel.y > 25 ) 
        {
			this.currentAnim = this.animPlayerState.fall;
		}
		else if( this.vel.x < -5  || this.vel.x > 5) 
        {
			this.currentAnim = this.animPlayerState.run;
		}
		else 
        {
			this.currentAnim = this.animPlayerState.idle;
		}
		
		this.currentAnim.flip.x = this.flip;

        //HUD.setStatusMessage('' + this.attackTimer.delta());

        if(this.moveCompleteCallback != null)
        {
            this.moveCompleteCallback();
            this.moveCompleteCallback = null;
        }

		this.parent();
	},

    changePlayerState: function(newState)
    {
        if(this.animPlayerStateIndex > -1)
        {
            if(newState == 0) { this.offset.y = 0; this.size.y = 16; this.pos.y -= 8;}
            else if(newState == 1) { this.offset.y = 8; this.size.y = 8; this.pos.y += 8;}
        }
        this.animPlayerState = this.animPlayerStateArray[newState];
        this.animPlayerStateIndex = newState;
    },

    moveTo: function(x, y, callback)
    {
        this.pos.x = x;
        this.pos.y = y;
        this.moveCompleteCallback = callback;
    },

    animAction: function(key, val)
    {
        if(key == 'ps')
        {
            this.changePlayerState(this.animPlayerStateIndex == 0 ? 1 : 0);
        }
    },

    saveChangedHandler: function()
    {
        this.weaponsEnabled = Save.getFlag('i', 'we', 0) == 1;
        this.controlsEnabled = Save.getFlag('i', 'dc', 1) == 1;
    },

    kill: function()
    {
        this.parent();
        LevelManager.reloadSave();
    }
});

});