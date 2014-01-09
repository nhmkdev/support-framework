/*
 This entity acts as a switch for cycling settings (interact based)

 Keys for Weltmeister:

 interact
    The name of the interact object to use for this interact entity

 level
    The name of the level to save the state of the switch with (optional - defaults to current level)

 sid
    Save id (flag name) to set when the switch is toggled

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair

 */

// NOTE: default state value should be handled wherever default save settings are defined (some other central spot)

ig.module(
	'game.entities.switch'
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
var Save = Support.save;
var LevelManager = Support.levelmanager;

EntitySwitch = EntityInteract.extend
({
    // weltmeister vars
    _wmBoxColor: 'rgba(140, 0, 0, 0.7)',

    // switch vars
    levelId:null,
    sid:null,
    states:0,

	init: function( x, y, settings )
	{
        this.parent( x, y, settings );
        this.levelId = Util.getProperty(settings['level'], LevelManager.currentLevelId);
        this.sid = Util.getProperty(settings['sid'], null);
        if(this.sid == null)
        {
            Util.lge(this, 'EntitySwitch: No sid specified')
        }
        if(!ig.global.wm)
        {
            this.states = this.interact.ao.a.length;
            // TODO: This seems unit test like...
            for(var x = 0; x < this.states; x++)
            {
                var animState = this.interact.ao.a[x];
                if(!Util.defined(animState['v']))
                {
                    Util.lge(this, 'Interact does not define values for all the animation states');
                    break;
                }
            }
            this.updateAnimationState();
        }
	},

    updateAnimationState: function()
    {
        var flagVal = Save.getFlag(this.levelId, this.sid);
        for(var x = 0; x < this.states; x++)
        {
            var animState = this.interact.ao.a[x];
            if(animState.v == flagVal)
            {
                Util.setAnimationState(this, animState);
                break;
            }
        }
    },

	performInteraction: function()
	{
        this.parent();
        if(this.currentAnimState != null)
        {
            var nextStateVal = this.currentAnimState.v + 1;
            if(nextStateVal >= this.states) nextStateVal = 0;
            Save.setFlag(this.levelId, this.sid, nextStateVal);
        }
	}
});

});