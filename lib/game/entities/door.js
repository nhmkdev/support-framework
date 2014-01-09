/*
 This entity acts as a door blocking/allowing progress in the current level. Door state is saved by level and sid
 as follows: 0-closed, 1-open, 2-locked

// TODO: support for doors/switches that toggle opposite one another (ie. on = doorA open and doorB closed)

 Keys for Weltmeister:

 thing
    The name of the thing object to use for this interact entity

 state
    The starting state of the door (default if save not defined) - defaults to 0

 sid
    Save id (flag name) for controlling the state of the door

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.entities.door'
)
.requires(
    'impact.entity',
    'support.util',
    'support.animutil',
    'support.dialog',
    'support.levelmanager',
    'support.save',
    'game.objects.hud',
    'data.gamedata',
    'game.entities.interact'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var LevelManager = Support.levelmanager;
var Save = Support.save;

var DOOR_STATE =
{
    CLOSED:0,
    OPEN:1,
    LOCKED:2
};

var ANIM_STATE_NAMES =
[
    'closed',
    'open',
    'locked'
];

EntityDoor= EntityThing.extend
({
    // weltmeister vars
    _wmBoxColor: 'rgba(80, 255, 0, 0.7)',

    // door vars
    sid:null,
    doorAnimStates:[],
    initalized:false,

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );

        if(this.thing != null)
        {
            this.sid = Util.getProperty(settings['sid'], null);
            if(this.sid == null)
            {
                Util.lge(this, 'EntityDoor: No sid specified')
            }
            Save.defaultFlag(LevelManager.currentLevelId, this.sid, Util.getProperty(settings['state'], DOOR_STATE.CLOSED));

            if(!ig.global.wm)
            {
                this.doorAnimStates[DOOR_STATE.CLOSED] = Util.getProperty(this.animationStateMap[ANIM_STATE_NAMES[DOOR_STATE.CLOSED]], null);
                this.doorAnimStates[DOOR_STATE.OPEN] = Util.getProperty(this.animationStateMap[ANIM_STATE_NAMES[DOOR_STATE.OPEN]], null);
                this.doorAnimStates[DOOR_STATE.LOCKED] = Util.getProperty(this.animationStateMap[ANIM_STATE_NAMES[DOOR_STATE.LOCKED]], null);
                this.initalized = true;
                this.updateAnimationState();
            }
        }
    },

    updateAnimationState: function()
    {
        if(!this.initalized) return;
        var flag = Save.getFlag(LevelManager.currentLevelId, this.sid);
        var newAnimState = this.doorAnimStates[flag];
        if(Util.defined(newAnimState) && newAnimState != null)
        {
            Util.setAnimationState(this, newAnimState);
            this.collides = (flag == DOOR_STATE.OPEN) ? ig.Entity.COLLIDES.NEVER : ig.Entity.COLLIDES.FIXED;
        }
    },

    saveChangedHandler: function()
    {
        this.updateAnimationState();
    }
});

});