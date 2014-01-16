/*
 This non-visible entity is one the player collides with and triggers the action of. The entity kills itself upon
 taking the action.

 Keys for Weltmeister:

 triggeraction
    A triggeraction object (see triggeraction structure)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.entities.triggeraction'
)
.requires(
    'impact.entity',
    'support.util',
    'support.save',
    'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var TriggerActions = ig.global.data.triggeractions;

EntityTriggeraction = ig.Entity.extend
({
    // weltmeister vars
    _wmScalable: true,
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(64, 195, 64, 0.7)',

    // entity vars
    size: {x: 16, y: 16},
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.NEVER,

    // triggeraction vars
    triggerAction:null,

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );

        this.triggerAction = Util.getProperty(settings['triggeraction'], null);
        if(!ig.global.wm)
        {
            this.triggerAction = Util.getNestedProperty(TriggerActions, this.triggerAction, null);
            if(this.triggerAction == null)
            {
                Util.lge(this, 'EntityTriggerAction: No triggeraction or invalid triggeraction specified.');
            }
        }
    },

    check: function( other )
    {
        // This is for non-animated/non-state versions
        if(Save.processReqsObject(this.thing['r']))
        {
            // TODO: support the disableCheck for invisible/toggle capable bounds
            Save.processActionObject(this, this.thing['a']);
            this.kill();
        }
    }
});
});
