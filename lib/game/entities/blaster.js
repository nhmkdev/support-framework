/*
 This entity fires projectiles from a static location.

 Keys for Weltmeister:

 seq
     firing sequence array (in x.x second values)

 active
    (0 or 1) indicates the blaster should fire (default: 1)

 face
    (l)eft or (r) (default: 'r')

 projectile
    Type of projectile (see projectiles structure)

 reqs
    string reference to a requirements object (optional)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.entities.blaster'
)
.requires(
	'impact.entity',
	'support.util',
    'game.entities.spawned.projectile',
    'support.save',
    'data.gamedata'
)
.defines(function(){

// TODO: Save the state based on SID
// TODO: art
    
var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var Requirements = ig.global.data.requirements;

EntityBlaster = ig.Entity.extend
({
    // weltmeister vars
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(91, 107, 195, 0.7)',
	
    // entity vars
    size: {x: 8, y: 8},
    gravityFactor:0,
    type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.FIXED,

    // blaster vars
    shouldFire:null, // default to a non true/false value
    timer:null,
    fireseq:null,
    seqidx:0,
    flip:false,
    projectile:null,
    requirements:null,

	init: function( x, y, settings ) 
    {
        this.parent( x, y, settings );

        // TODO: may want to make this generic / data driven
        this.animSheet = Util.loadAnimationSheet( 'blaster', 8, 8 );
        this.addAnim( 'idle', 1, [0] );

        this.projectile = Util.getProperty(settings['projectile'], null);
        this.flip = Util.getProperty(settings['face'], 'r') != 'r';
        this.currentAnim.flip.x = this.flip;
        this.fireseq = ('' + Util.getProperty(settings['seq'], '')).split(',');
        if(!ig.global.wm)
        {
            this.timer = new ig.Timer();
            this.changeActive(Util.getProperty(settings['active'], 1) == 1);
            if(this.projectile == null)
            {
                Util.lge(this, 'EntityBlaster: Invalid projectile');
                this.kill();
                return;
            }
            this.requirements = Util.getProperty(settings['reqs'], null);
            if(this.requirements != null)
            {
                this.requirements = Util.getNestedProperty(Requirements, this.requirements, null);
                if(Util.defined(this.requirements))
                {
                    Save.addSaveListener(this);
                    // initialize firing
                    this.saveChangedHandler();
                }
            }
        }
        if(this.fireseq.length == 0)
        {
            Util.lge(this, 'EntityBlaster: No seq defined.');
        }
	},
	
    changeActive: function(active)
    {
        if(this.shouldFire != active)
        {
            this.shouldFire = active;
            this.seqidx = 0;
            if(this.shouldFire && this.fireseq.length > 0)
            {
                this.timer.set(this.fireseq[this.seqidx]);
            }
        }
    },

    saveChangedHandler: function()
    {
        this.changeActive(Save.processReqsObject(this.requirements));
    },

    update: function()
    {
        if(this.shouldFire)
        {
            if(this.timer.delta() >= 0 || this.fireseq[this.seqidx] == 0)
            {
                (this.seqidx + 1 >= this.fireseq.length) ? this.seqidx = 0 : this.seqidx++; 
                this.timer.set(this.fireseq[this.seqidx]);
                ig.game.spawnEntity( EntityProjectile, this.pos.x + (this.flip ? -3 : this.size.x), this.pos.y,
                                    { flip:this.flip, projectile:this.projectile, source:this } );
            }
        }
        this.parent();
    }
});

});