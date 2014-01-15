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
    //'impact.debug.debug',
    
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
var Save = Support.save;
var LevelManager = Support.levelmanager;
var HUD = ig.global.objects.hud;

var Dialogs = ig.global.data.dialogs;
var InputData = ig.global.data.inputData;
var Levels = ig.global.data.levels;
var Menus = ig.global.data.menus;
var UnitTest = ig.global.data.unittest;

MainGame = ig.Game.extend
({
    // Game vars
	gravity: 250, // All entities are affected by this

    // MainGame vars
    playerEntity:null,

    init: function()
	{
        var startLevel = 'demo01';
        // TODO: central data file that just creates all the flags at startup in the desired state
        Save.defaultFlag('sv', 'active', 1);
        Save.defaultTag('g', 'levelid', startLevel);
        //Save.defaultFlag('i', 'we', 1);

        // TODO: pull first level from data
		LevelManager.loadDeferred(startLevel);

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
	
	update: function()
	{
        // post level load find the appropriate spawn point for the player
        // TODO: move this to level manager?
        if(this.playerEntity == null && this._levelToLoad == null)
        {
            var spawns = this.getEntitiesByType(EntityPlayerspawn);
            var spawnPoint = null;
            var defaultSpawn = null;
            if(Util.defined(spawns))
            {
                for(var idx = 0, len = spawns.length; idx < len; idx++)
                {
                    var spawn = spawns[idx];
                    if(LevelManager.lastLevelId == spawn.lastLevelId)
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
                var playerEntity = ig.game.spawnEntity( EntityPlayer, spawnPoint.pos.x, spawnPoint.pos.y, {flip:spawnPoint.flip});
                playerEntity.pos.x += playerEntity.offset.x;
                playerEntity.pos.y += playerEntity.offset.y;
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
            // TODO: implement toggle
			//ig.global.support.pause.togglePause();
		}
		
        if(ig.input.pressed('debugmenu'))
        {
			Dialog.initData(null, Dialogs.DebugMenu);
        }
        
		// debug functionality for loading levels (TODO: list would be nice too...)
		if(ig.input.pressed('levelcycle'))
		{
            // TODO restore this
            /*
				var firstLevel = null;
				var levelToLoad = null;
				var loadNextLevel = false;
				for(var level in Levels)
				{
						var levelObj = Levels[level];
						if(loadNextLevel)
						{
								levelToLoad = levelObj;
						}
						
						if(firstLevel == null)
						{
								firstLevel = levelObj;
								levelToLoad = levelObj;
						}
						
						if(levelObj.n == LevelManager.currentLevelName)
						{
								loadNextLevel = true;
						}
				}
				
				LevelManager.loadDeferred(levelToLoad.n);
            */
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
        // TODO: why was this disabled?
        /*
        for( var i = 0, len = this.backgroundMaps.length; i < len; i++ ) {
            this.backgroundMaps[i].setScreenPos( this.screen.x, this.screen.y);
        }
       */
    },
	
	draw: function()
	{
		// Draw all entities and BackgroundMaps
		this.parent();

        // TODO: block here for level to complete load?

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

// Startup mode to initialize the game
XDKTestMode = ig.Game.extend
({
    init: function()
    {
        this.image = new ig.Image('media/boxblue.png');
        this.font = Util.loadFont('04b03.font');
        //console.log( JSON.stringify(this.font.indices) );
        //console.log( JSON.stringify(this.font.widthMap) );

        // Hard code in the "working" font information
        //http://impactjs.com/forums/help/cocoon-js-issues#post22013
        this.font.indices = [0,5,7,11,17,22,28,34,36,39,42,46,50,53,57,59,65,70,73,78,83,88,93,98,103,108,113,115,117,121,125,129,134,140,145,150,154,159,163,167,172,177,181,186,191,195,201,206,211,216,221,226,231,235,240,245,251,256,261,265,268,274,277,281,286,289,294,299,303,308,313,317,322,327,329,332,337,339,345,350,355,360,365,369,374,378,383,388,394,398,403,408,412,414,418] ;
        this.font.widthMap = [4,1,3,5,4,5,5,1,2,2,3,3,2,3,1,5,4,2,4,4,4,4,4,4,4,4,1,1,3,3,3,4,5,4,4,3,4,3,3,4,4,3,4,4,3,5,4,4,4,4,4,4,3,4,4,5,4,4,3,2,5,2,3,4,2,4,4,3,4,4,3,4,4,1,2,4,1,5,4,4,4,4,3,4,3,4,4,5,3,4,4,3,1,3,4] ;
        this.fx = 0;
        this.fy = 0;
    },

    draw: function()
    {
        this.parent();

        this.image.draw(0,0);
        this.font.draw("(40,40)", 40, 40, ig.Font.ALIGN.CENTER);
        this.font.draw("test", this.fx, this.fy, ig.Font.ALIGN.CENTER);
        this.fx += 10;
        if(this.fx > 1000)
        {
            this.fx = 0;
            this.fy += 10;
            if(this.fy > 1000)
            {
                this.fy = 0;
            }
        }
    }
});

// Start the Game with 60fps, a resolution of 240x160, scaled
// up by a factor of 2
// XDK Disabled
ig.main( '#canvas', Initializer, 60, 320, 180, 2 );

// XDK Enabled
//ig.main( intel.xdk.canvas, XDKTestMode, 60, 160, 240, 1 );

});
