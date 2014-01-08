/*
 Input Config Menu is a game mode that allows the player to map input. (TODO: move this to game side code)

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.inputconfigmenu'
)
.requires(
	'impact.game',
    'impact.font',

	'support.util',
	'support.modestack', // todo needed?
	'support.inputconfig'
)
.defines(function(){

var Support = ig.global.support;

// TODO: Make this more generic?

InputConfigMenu = ig.Game.extend
({
	CONFIG_MODE:
	{
		IDLE:0,
		LISTEN:1,
		LISTENALL:2
	},	
	// very likely this will not be stored in the inputconfigmenu itself
	constConfigBinding:
	{
		cancel_inputconfig:ig.KEY.ESC,
		reset_inputconfig:ig.KEY.F10,
	},
	defaultInputs:
	{
		up:ig.KEY.UP_ARROW,
		down:ig.KEY.DOWN_ARROW,
		left:ig.KEY.LEFT_ARROW,
		right:ig.KEY.RIGHT_ARROW,
		primary:ig.KEY.CTRL,
		secondary:ig.KEY.ALT,
	},
	inputConfig:null,
	mode:null,
	currentReplaceAction:null,
	selectedMenuIndex:0,
	controlItemIndex:0,
	menuItems:null,
	controlItems:null,
	lastErrorMessage:null,
	menuFont: null,
	menuExit: false,
	
	init: function()
	{
		Support.inputConfig.loadBinding(this.defaultInputs);
		this.mode = this.CONFIG_MODE.IDLE;
		// TODO: later this will include save/load data too
		this.inputConfig = Support.inputConfig;
		this.inputConfig.init(this.constConfigBinding, this.defaultInputs);
		this.menuItems = [];
		this.menuItems.push({ text:'Backup'});
		this.menuItems.push({ actionName:null, text:'Configure All'});
		this.controlItems = [];
		// TODO: an input array of all these types + description
		this.controlItems.push({ actionName:'up', text:'Up'});
		this.controlItems.push({ actionName:'down', text:'Down'});
		this.controlItems.push({ actionName:'left', text:'Left'});
		this.controlItems.push({ actionName:'right', text:'Right'});
		this.controlItems.push({ actionName:'primary', text:'Accept/Shoot'});
		this.controlItems.push({ actionName:'secondary', text:'Back/Jump'});
		for( var idx = 0, len = this.controlItems.length; idx < len; idx++)
		{
			this.menuItems.push(this.controlItems[idx]);
		}
		this.menuFont = Util.loadFont('04b03.font');
	},
	
	update: function()
	{
		this.parent();
		if(this.menuExit)
		{
			return;
		}		

		// TODO: toggle between the menu bindings and those for the game
		if(this.mode == this.CONFIG_MODE.LISTEN)
		{
			var result = this.inputConfig.checkForInput(this.controlItems[this.controlItemIndex].actionName);
			if(result == this.inputConfig.LISTEN_RESULT.ALREADY_BOUND)
			{
				// TODO: on already bound show the key and bound to what action
				this.setErrorText("Key already bound.");
			}
			else if(result == this.inputConfig.LISTEN_RESULT.SUCCESS ||
					result == this.inputConfig.LISTEN_RESULT.CANCEL)
			{
				this.switchToIdle();
			}
			//else {}
		}
		else if(this.mode == this.CONFIG_MODE.LISTENALL)
		{
			var result = this.inputConfig.checkForInput(this.controlItems[this.controlItemIndex].actionName);
			if(result == this.inputConfig.LISTEN_RESULT.ALREADY_BOUND)
			{
				this.setErrorText("Key already bound.");
			}
			else if(result == this.inputConfig.LISTEN_RESULT.SUCCESS)
			{
				this.controlItemIndex++;
				if(this.controlItemIndex >= this.controlItems.length)
				{
					this.switchToIdle();
				}
			}
			else if(result == this.inputConfig.LISTEN_RESULT.CANCEL)
			{
				this.switchToIdle();
			}
			//else {}			
		}
		else if(ig.input.pressed('up'))
		{
			this.selectedMenuIndex--;
			if(this.selectedMenuIndex < 0)
			{
				this.selectedMenuIndex = this.menuItems.length - 1;
			}				
		}
		else if(ig.input.pressed('down'))
		{
			this.selectedMenuIndex++;
			if(this.selectedMenuIndex >= this.menuItems.length)
			{
				this.selectedMenuIndex = 0;
			}	
		}
		else if(ig.input.pressed('primary'))
		{
			var menuItem = this.menuItems[this.selectedMenuIndex];
			this.currentReplaceAction = null;
			if(typeof menuItem.actionName === 'undefined')
			{
				this.menuExit = true;
				Support.gameModeStack.pop();
			}
			else
			{		
				this.controlItemIndex = Math.max(0, this.controlItems.indexOf(menuItem));
				this.switchToListen(
									menuItem.actionName == null ? this.CONFIG_MODE.LISTENALL : this.CONFIG_MODE.LISTEN,
									menuItem.actionName
									);
			}
		}
	},
		
	draw: function()
	{
		this.parent();
		if(this.menuExit)
		{
			return;
		}		
		//this.font.draw(this.stateText, this.getSetting('x', 0), this.getSetting('y', 0), ig.Font.ALIGN.LEFT);
		
		if(this.mode == this.CONFIG_MODE.IDLE)
		{
			// render dialog text items (and selector)
			var y = 0;
			for(var idx = 0, len = this.menuItems.length; idx < len; idx++)
			{
					var menuItem = this.menuItems[idx];
				
					// draw the indicator that this item is selected
					if (this.selectedMenuIndex == idx)
					{
						this.menuFont.draw('>', 10, y, ig.Font.ALIGN.RIGHT);
					}
					// draw the text
					this.menuFont.draw(menuItem.text +
									   (idx == 0 ? '' : ': ' + 
									   this.inputConfig.getKeyName(this.inputConfig.currentBinding[menuItem.actionName])),
									   10, y, ig.Font.ALIGN.LEFT);
					// TODO: draw the assigned input text...
					y += this.menuFont.height + 2;
			}
		}
		else
		{
			var controlItem = this.controlItems[this.controlItemIndex];
			this.menuFont.draw('Press key for ' + controlItem.text, 10, 10, ig.Font.ALIGN.LEFT);
			if(this.lastErrorMessage != null)
			{
				// TODO: fade after a number of frames
				this.menuFont.draw(this.lastErrorMessage, 10, 50, ig.Font.ALIGN.LEFT)
			}
		}
	},
	
	switchToIdle: function()
	{
		this.mode = this.CONFIG_MODE.IDLE;
		this.inputConfig.loadBinding(this.inputConfig.currentBinding, true);
		this.setErrorText(null);
	},
	
	switchToListen: function(configMode, actionToReplace)
	{
		// switch all bindings to listen
		this.inputConfig.initializeListen(actionToReplace);
		this.mode = configMode;
	},	
		
	setErrorText: function(msg)
	{
		this.lastErrorMessage = msg;
	},
	
	logErr: function(msg)
	{
		ig.log('ConfigMenu Error: ' + msg);
	},

	log: function(msg)
	{
		ig.log('ConfigMenu: ' + msg);
	}
});
        
});