/*
 Main game module for the support framework demo

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'game.main' 
)
.requires(
    // XDK Enabled
    //'plugins.dc.dc',

    'impact.game',
    'impact.debug.debug',
    
    'support.util',
    'support.pause',
    'support.levelmanager',
    'support.custommenu',
    'support.dialog',
    'support.inputconfigmenu',
    'support.modestack',
    'game.entities.spawned.player',
    'game.objects.gameobjects',
    'data.gamedata',
    'data.levelrequires',
    'data.unittest'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var InputConfig = Support.inputConfig;
var Dialog = Support.dialog;
var Pause = Support.pause;
var Save = Support.save;
var LevelManager = Support.levelmanager;
var HUD = ig.global.objects.hud;

var Dialogs = ig.global.data.dialogs;
var InputData = ig.global.data.inputData;
var Menus = ig.global.data.menus;
var UnitTest = ig.global.data.unittest;

var ModeStack = Support.modestack;

MainGame = ig.Game.extend
({
    // Game vars
	gravity: 250, // All entities are affected by this

    // MainGame vars
    playerEntity:null,

    init: function()
	{
        // TODO: central data file that just creates all the flags at startup in the desired state
        Save.defaultFlag('sv', 'active', 1);
        //Save.defaultFlag('i', 'we', 1);

        // TODO: better method of new game vs. load game
        if(Save.getTag('g', 'levelid', null) == null)
        {
		    LevelManager.loadStartLevel();
        }
        else
        {
            LevelManager.reloadSave();
        }

        if(ig.ua.android)
        {
            // TODO: re-evaluate
            /*
            this.buttonImage = Util.loadImage('buttons');

            this.buttons = new ig.TouchButtonCollection([
                new ig.TouchButton( 'left', {left: 0, bottom: 0}, 64, 64, this.buttonImage, 0),
                new ig.TouchButton( 'right', {left: 64, bottom: 0}, 64, 64, this.buttonImage, 1),
                new ig.TouchButton( 'up', {right: 32, bottom: 64}, 64, 64, this.buttonImage, 2),
                new ig.TouchButton( 'primary', {right: 64, bottom: 0}, 64, 64, this.buttonImage, 4),
                new ig.TouchButton( 'secondary', {right: 0, bottom: 0}, 64, 64, this.buttonImage, 5)
            ]);
            this.buttons.align();
            */
        }
	},

    spawnPlayer: function()
    {
        var spawns = this.getEntitiesByType(EntityPlayerspawn);
        var spawnPoint = null;
        var defaultSpawn = null;
        // find the matching spawn and/or default
        if(Util.defined(spawns))
        {
            for(var idx = 0, len = spawns.length; idx < len; idx++)
            {
                var spawn = spawns[idx];
                if(LevelManager.spawnId == spawn.id)
                {
                    // spawn player and move on
                    spawnPoint = spawn;
                    break;
                }
                if(spawn.defaultSpawn)
                {
                    defaultSpawn = spawn;
                }
            }
        }
        if(spawnPoint == null)
        {
            spawnPoint = defaultSpawn;
        }

        if(spawnPoint != null)
        {
            var offsetSpawn = spawnPoint.getOffset();
            var playerEntity = ig.game.spawnEntity( EntityPlayer, offsetSpawn.x, offsetSpawn.y, {flip:spawnPoint.flip});
            playerEntity.pos.x += playerEntity.offset.x;
            playerEntity.pos.y += playerEntity.offset.y;
            spawnPoint.updateVelocity(playerEntity);
            this.playerEntity = playerEntity;
            // destroy all the spawn entities
            for(var idx = 0, len = spawns.length; idx < spawns.length; idx++)
            {
                spawns[idx].kill();
            }
        }
        else
        {
            ig.log('No good spawn point found!');
            ig.game.spawnEntity( EntityPlayer, 0, 0);
        }
    },

	update: function()
	{
        if(this.playerEntity == null && this._levelToLoad == null)
        {
            // post level load find the appropriate spawn point for the player
            this.spawnPlayer();
        }

		HUD.update();
        if(Dialog.update())
		{
            // updating the dialog (all other game updates are halted)
            return;
		}

        Save.update();

		if( ig.input.pressed('pause') )
		{
			Pause.togglePause();
		}
		
        if(ig.input.pressed('debugmenu'))
        {
			Dialog.initData(null, Dialogs.DebugMenu);
        }

        if(ig.input.pressed('menu'))
        {
            // TODO: this should prompt with a dialog allowing the user to pop the mode stack
            // TODO: deal with save data issues (temp partition etc.)
            ModeStack.pop();
            return;
        }
        
        // Update all entities and BackgroundMaps (NOTE: this may not actually happen if a dialog is open)
		this.parent();
        
        // TODO: use another camera system (this follow is super simple/limited)
        if( this.playerEntity != null )
		{
			this.screen.x = this.playerEntity.pos.x - ig.system.width/2;
			this.screen.y = this.playerEntity.pos.y - ig.system.height/2;
		}

        // update the screen position for all background maps
        // TODO: why was this disabled? (due to pre-render?)
        /*
        for( var i = 0, len = this.backgroundMaps.length; i < len; i++ ) {
            this.backgroundMaps[i].setScreenPos( this.screen.x, this.screen.y);
        }
       */
    },
	
	draw: function()
	{
        // TODO: expand upon this for between level transitions
        // pause all drawing on level load and player spawn
        if(this._levelToLoad != null || this.playerEntity == null) { return; }

		// Draw all entities and BackgroundMaps
		this.parent();

        HUD.draw();
        
		Dialog.draw();

        // Draw all touch buttons - if we have any
        if( this.buttons ) {
            this.buttons.draw();
        }
	},

    // pre-rendering on all background maps when a level
    // was loaded
    loadLevel: function( data ) {
        this.parent( data );

        for( var i = 0, len = this.backgroundMaps.length; i < len; i++ ) {
            this.backgroundMaps[i].preRender = true;
        }
    }
});

// Startup mode to initialize the game
Initializer = ig.Game.extend
({
	
	init: function()
	{
        if(Util.defined(UnitTest) && Util.defined(UnitTest['run']))
        {
            UnitTest.run();
        }

		// TODO: load input config from save
        inputBinding = {};
		for(var idx = 0, len = InputData.length; idx < len; idx++)
		{
            inputBinding[InputData[idx].action] = InputData[idx].input;
		}
		InputConfig.loadBinding(inputBinding, true);
        Save.loadData();
        HUD.initialize();
	},
	
	update: function()
	{
		Support.custommenu.data = Menus.mainMenu;
		ig.system.setGame(CustomMenu);
	}
});

// Start the Game with 60fps, a resolution of 240x160, scaled
// up by a factor of 2
// XDK Disabled
ig.main( '#canvas', Initializer, 60, 320, 180, 2 );

// XDK Enabled
//ig.main( intel.xdk.canvas, Initializer, 60, 160, 240, 1 );

});
