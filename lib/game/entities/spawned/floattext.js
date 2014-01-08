/*
 Floating text entity for displaying text that floats up from a given point.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.entities.spawned.floattext'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;

EntityFloatText = ig.Entity.extend
({
    // entity vars
    size:{x:1, y:1},
    maxVelocity:{x:1000, y:1000},
    minBounceVelocity: 0,
    gravityFactor:0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    // floattext vars
    fadeTime:1,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );

        this.font = Util.loadFont('04b03.font');
        this.vel.y = settings.vy;
        this.points = settings.p;
        this.lifeTime = settings.l;
        this.lifeTimer = new ig.Timer();
        this.lifeTimer.set(this.lifeTime);
        //this.fadeTime = 1;
    },

    update: function()
    {
        var delta = this.lifeTimer.delta();
        if( this.lifeTimer.delta() >= 0 )
        {
            this.kill();
            return;
        }
        // TODO/NOTE: Alpha fade on the text is not possible due to shared resources (causes all text of the same font
        // to alpha fade)
        /*
        if(delta > -this.fadeTime)
        {
            this.font.alpha = -delta / this.fadeTime;
        }
        ig.log('a:' + this.font.alpha);*/
        this.parent();
    },

    draw: function()
    {
        this.parent();
        this.font.draw(this.points, this.pos.x - ig.game._rscreen.x, this.pos.y - ig.game._rscreen.y, ig.Font.ALIGN.CENTER);
    }
});

});
