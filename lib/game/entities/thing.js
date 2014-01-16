/*
 This entity is one the player collides with and triggers the action of. It may be configured to support numerous
 animation states to be controlled by Save flags.

 (TODO: may be used for invisible collision?)

 Keys for Weltmeister:

 thing
    A thing object (see things structure)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.entities.thing'
)
.requires(
    'impact.entity',
    'support.util',
    'support.animutil',
    'support.save',
    'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var Things = ig.global.data.things;

EntityThing = ig.Entity.extend
({
    // weltmeister vars
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(91, 95, 195, 0.7)',

    // entity vars
    size: {x: 16, y: 16},
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.NEVER,

    // thing vars
    disableCheck:false,
    thing:null,

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );

        this.thing = Util.getProperty(settings['thing'], null);
        this.thing = Util.getNestedProperty(Things, this.thing, null);
        if(this.thing != null)
        {
            //TODO: use this object for flags (invisble collects)
            if(Util.defined(this.thing['ao']))
            {
                // Note: the collision size is updated in loadEntityAnimations
                Util.loadEntityAnimations(this, this.thing.ao);
                if(!ig.global.wm)
                {
                    this.updateAnimationState();
                    Save.addSaveListener(this);
                }
            }
            else
            {
                Util.lge(this, 'EntityThing: No animation object specified');
            }
        }
        else
        {
            Util.lge(this, 'EntityThing: No thing or invalid thing specified');
        }
    },

    check: function( other )
    {
        if(this.disableCheck)
        {
            return;
        }
        if(other instanceof EntityPlayer)
        {
            // on player interaction perform the associated actions
            if(this.currentAnimState != null)
            {
                Save.processActionObject(this, this.currentAnimState.a);
            }
            this.updateAnimationState();
        }
    },

    updateAnimationState: function()
    {
        // special wrapped version to allow for the disableCheck var
        var nextAnimState = Util.updateAnimationState(this, this.thing.ao.a);
        if(nextAnimState != null)
        {
            this.disableCheck = Util.getProperty(nextAnimState['d'], false);
        }
    },

    saveChangedHandler: function()
    {
        // NOTE: this does not fire the Action object functionality (only player interaction triggers it)
        this.updateAnimationState();
    }
});
});
