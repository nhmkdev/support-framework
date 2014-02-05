/*
 This entity represents an interact based character (lightly implemented... plenty to still support)

 Keys for Weltmeister:

 character
 Character in the Characters data structure

 reqs
 string reference to a requirements object (optional)

 Required Animations

 idle
 run

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.entities.character'
)
.requires(
    'impact.entity',
    'support.util',
    'support.pause',
    'support.save',
    'game.entities.spawned.floattext',
    'game.objects.gameobjects',
    'data.gamedata',
    'game.entities.interact'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var Dialog = Support.dialog;
var Dialogs = ig.global.data.dialogs;
var Characters = ig.global.data.characters;
var HUD = ig.global.objects.hud;

EntityCharacter = EntityInteract.extend
({
    // weltmeister vars
    _wmScalable: false,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(64, 128, 0, 0.7)',

    //TODO: eval all these settings (most will come from animation)
    // entity vars
    maxVel: {x: 100, y: 200},
    friction: {x: 600, y: 0},
    type: ig.Entity.TYPE.B, // Enemy group
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE, // temporary -- should be customizable
    animSheet: null,
    zIndex:3,
    flip: false,

    // character vars
    charObj:null,
    hudText:null,
    dialog:null,
    moveCompleteCallback:null,

    init: function( x, y, settings )
    {
        var charName = Util.getProperty(settings['char'], null);

        if(charName == null)
        {
            Util.lge(this, 'EntityCharacter: Please set the char field');
            return;
        }

        this.charObj = Util.getNestedProperty(Characters, charName, null);

        if(this.charObj != null)
        {
            if(Save.processReqsObject(this.charObj['r']) == false)
            {
                this.kill();
                return;
            }
            settings.interact = Util.getProperty(this.charObj['i'], null);
            this.parent( x, y, settings );
        }

        this.name = Util.getProperty(this.charObj['n'], null);
    },

    update: function()
    {
        if(Util.defined(this.currentAnim))
        {
            if( this.vel.x < -5  || this.vel.x > 5)
            {
                this.currentAnim = this.anims.run;
            }
            else
            {
                this.currentAnim = this.anims.idle;
            }

            this.currentAnim.flip.x = this.flip;
        }

        if(this.moveCompleteCallback != null)
        {
            this.moveCompleteCallback();
            this.moveCompleteCallback = null;
        }

        this.parent();
    },

    initializeAnimationState: function(){},

    check: function( other )
    {
        if(other instanceof EntityPlayer)
        {
            other.interactable = this;
            if(this.hudText != null)
            {
                HUD.setStatusMessage(this.hudText);
            }
        }
    },

    performInteraction: function()
    {
        if(this.dialog != null)
        {
            Dialog.initData(this, this.dialog);
        }
    },

    moveTo: function(x, y, callback)
    {
        this.pos.x = x;
        this.pos.y = y;
        this.moveCompleteCallback = callback;
    }

});

});