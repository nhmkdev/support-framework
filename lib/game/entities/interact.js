/*
This entity detects the player and allows optional interaction via player input. The actual interaction takes place
in the player entity.

Keys for Weltmeister:

interact
	The name of the interact object to use for this interact entity

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
*/

ig.module(
	'game.entities.interact'
)
.requires(
	'impact.entity',
	'support.util',
    'support.animutil',
    'support.dialog',
    'support.levelmanager',
    'support.save',
    'game.objects.hud',
	'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var Dialog = Support.dialog;
var Interacts = ig.global.data.interacts;
var Dialogs = ig.global.data.dialogs;
var HUD = ig.global.objects.hud;

EntityInteract = ig.Entity.extend
({
    // weltmeister vars
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(140, 255, 0, 0.7)',

    // entity vars
    size: {x: 16, y: 16},
    animSheet:null,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,

    // interact vars
    dialog: null,
    interact: null,
    hudText: null,

	init: function( x, y, settings )
	{
        this.parent( x, y, settings );

        var interactId = Util.getProperty(settings['interact'], null);
		if(interactId != null)
		{
            var interact = interactId;
            if(typeof interactId === 'string')
            {
                interact = Util.getNestedProperty(Interacts, interactId, null)
            }
			if(interact != null)
			{
                this.interact = interact;
                this.hudText = Util.getProperty(this.interact['ht'], null);

                if(Util.defined(interact['d']) && interact.d != null)
				{
                    this.dialog = interact.d;
                    if(typeof interact.d === 'string')
                    {
					    this.dialog = Util.getNestedProperty(Dialogs, interact.d);
                    }
				}
				if(Util.defined(interact['ao']))
				{
                    Util.loadEntityAnimations(this, this.interact.ao);
                    this.initializeAnimationState();
				}
                else
                {
                    Util.lge(this, 'EntityInteract: no animation object property found')
                }
			}
			else
			{
				Util.lge(this, 'EntityInteract: interact not found: ' + interactId);
			}
		}
	},
	
	check: function( other )
	{
		if(other instanceof EntityPlayer)
		{
            // the player is assigned the interact
            other.interactable = this;
            if(this.hudText != null)
            {
                HUD.setStatusMessage(this.hudText);
            }

		}
	},

    initializeAnimationState: function()
    {
        if(!ig.global.wm)
        {
            this.updateAnimationState();
            Save.addSaveListener(this);
        }
    },

    updateAnimationState: function()
    {
        if(Util.defined(this.interact.ao))
        {
            Util.updateAnimationState(this, this.interact.ao.a);
        }
    },

    saveChangedHandler: function()
    {
        this.updateAnimationState();
    },

	performInteraction: function()
	{
        if(this.dialog != null)
		{
			Dialog.initData(this, this.dialog);
		}
        else
        {
            // when switching states always perform the action of the current state
            if(this.currentAnimState != null)
            {
                Save.processActionObject(this, this.currentAnimState['a']);
            }
        }
	}
});

});