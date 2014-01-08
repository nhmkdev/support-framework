/*
 Custom Menu is a game mode that presents a data driven menu to the user.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
	'support.custommenu'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'support.modestack',
    'support.window'
)
.defines(function(){

// up front shortcut references
var Support = ig.global.support;
var Util = Support.util;
var Window = Support.window;
var GameModeStack = Support.gameModeStack;
	
// TODO: custom inputs for the menu ? (or just force the input names...)
// Sample: menu_input_accept

CustomMenu = ig.Game.extend
({
	// non settings vars
	menuFont: null,
	menuIcon:null,
	menuValid: true,
	
	// vars for menu implementation
	menuIndex:0,
	menuItems:null,
	menuItemCount:0,
	menuExit:false,
	baseMenuData:null,
    windows: [],
	
	// menu settings
	settings:{},
	
	init: function()
	{
		this.baseMenuData = Support.custommenu.data;
		this.menuItems = [];
		
		// load settings
		if (this.baseMenuData.hasOwnProperty('s'))
		{
			this.settings.xPos = this.getSetting('x', 0);
			this.settings.yPos = this.getSetting('y', 0);
			this.settings.ySpace = this.getSetting('ys', 10);
			this.settings.wrap = this.getSetting('w', false);
			this.settings.menuChar = this.getSetting('mc', '>');
			this.settings.menuSelectOffset = this.getSetting('mco', 10);
			this.settings.allowBack = this.getSetting('ab', true);
			// TODO: update menu icon args load... could use windows settings?
			// OR at least load them into a temp object and default the icon settings
			this.settings.menuIconArgs = this.getSetting('micna', null);
			
            var menuIcon = this.getSetting('micn', null);
            if(menuIcon != null)
            {
                    this.menuIcon = Util.loadImage(menuIcon);
            }
            var menuFont = this.getSetting('f', null);
			if (menuFont != null)
			{
				this.menuFont = Util.loadFont(menuFont);
			}
		}
		else
		{
			this.logErr("No settings entry found. This menu will not function correctly!");
		}
		
		if(this.baseMenuData.hasOwnProperty('mi') == false)
		{
				// fine...
			//this.logErr("menuItems not defined")
		}
		else if(this.baseMenuData.mi.length == 0)
		{
				// fine
			//this.logErr("menuItems is length 0")
		}
		else
		{
			// preprocess the menu (includes fixing up the items to have defaults)
			for( var idx = 0, len = this.baseMenuData.mi.length; idx < len; idx++)
			{
				var item = this.baseMenuData.mi[idx];
				var newMenuItem = {};
				newMenuItem.text = Util.getProperty(item['t'], 'Undefined Menu Item Text!');
				newMenuItem.xOffset = Util.getProperty(item['xOffset'], 0);
				newMenuItem.yOffset = Util.getProperty(item['yOffset'], 0);
				newMenuItem.xRaw = Util.getProperty(item['xRaw'], null);
				newMenuItem.yRaw = Util.getProperty(item['yRaw'], null);
				this.menuItems.push(newMenuItem);
			}
		}
		
		if(this.menuFont == null)
		{
			this.logErr("No font setup!");
		}
        
        // load dialog windows
        var windows = this.getSetting('win', null);
        if(windows != null)
        {
            Window.loadWindows(windows, this.windows);
        }        
	/*
		// menu items can have a length of 0 or be null	
		if(this.menuData.menuItems != null &&
		   this.menuData.menuItems.length > 0 &&
		   this.menuData.settings != null &&
		   this.menuFont != null)
		{
			this.menuValid = true;
		}
*/

        //ig.input.initMouse();
        // TEMP!!
        if(ig.ua.android)
        {
            /*this.buttonImage = Util.loadImage('buttons');

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
		this.parent();
		if(this.menuExit)
		{
			return;
		}
		if(ig.input.pressed ('primary'))
		{
			this.log("accept pressed");
			var menuItem = this.baseMenuData.mi[this.menuIndex];
			if(menuItem.hasOwnProperty('m'))
			{
                // TODO: this is problematic as the data is from game code... (so the reference to data is not allowed)
                // Possibly create the data object in utils.js
				var nextMenu = eval('ig.global.data.menus.' + menuItem.m);
                if(Util.defined(nextMenu))
                {
                    this.menuExit = true;
                    GameModeStack.push('CustomMenu', this.baseMenuData, 'CustomMenu', nextMenu);
                }
                else
                {
                    this.logErr('Invalid menu specified on item.');
                }
			}
			else if(menuItem.hasOwnProperty('g'))
			{
				this.menuExit = true;
				GameModeStack.push('CustomMenu', this.baseMenuData, menuItem.g, null);
			}
		}
		else if(ig.input.pressed('secondary') && this.settings.allowBack)
		{
			this.menuExit = true;
            GameModeStack.pop();
		}
		else if (ig.input.pressed('down'))
		{
			//this.log("down pressed");
			this.menuIndex++;
			if (this.settings.wrap && this.menuIndex > this.menuItems.length - 1)
			{
				this.menuIndex = 0;
			}
			this.menuIndex = Math.min(this.menuItems.length - 1, this.menuIndex);
		}
		else if (ig.input.pressed('up'))
		{
			//this.log("up pressed");
			this.menuIndex--;
			if (this.settings.wrap && 0 > this.menuIndex)
			{
				this.menuIndex = this.menuItems.length - 1;
			}
			this.menuIndex = Math.max(0, this.menuIndex);
		}
	},
	
	draw: function()
	{
		this.parent();
        
        // render windows
        Window.drawWindows(this.windows);
        
		if(this.menuValid == false || this.menuExit)
		{
			return;
		}

		var x = this.settings.xPos;
		var y = this.settings.yPos;
		for( var idx = 0, len = this.menuItems.length; idx < len; idx++)
		{
			var item = this.menuItems[idx];
			var actualX = item.xRaw == null ? x + item.xOffset: xRaw;
			var actualY = item.yRaw == null ? y + item.yOffset: yRaw;
			
			// draw the indicator that this item is selected
			if (this.menuIndex == idx)
			{
				if (this.menuIcon == null)
				{
					this.menuFont.draw(this.settings.menuChar, actualX - this.settings.menuSelectOffset, actualY, ig.Font.ALIGN.RIGHT);
				}
				else
				{
                    //TODO: use the Util.loadImageSettingsFromObject to load this
						if(this.settings.menuIconArgs == null)
						{
								this.menuIcon.draw(actualX - this.settings.menuSelectOffset, actualY);
						}
						else
						{
								// TODO: not perfect really... might need a y offset as well
								this.menuIcon.draw(actualX - this.settings.menuSelectOffset, actualY,
												   this.settings.menuIconArgs.sx,
												   this.settings.menuIconArgs.sy,
												   this.settings.menuIconArgs.w,
												   this.settings.menuIconArgs.h);
						}
				}
			}
			this.menuFont.draw(item.text, actualX, actualY, ig.Font.ALIGN.LEFT);
			y += this.settings.ySpace;
		}

        // Draw all touch buttons - if we have any
        if( this.buttons )
        {
            this.buttons.draw();
        }
	},
	
	getSetting: function(setting, defaultValue)
	{
		return Util.getOverrideProperty(setting, this.baseMenuData.s, this.baseMenuData.s.base, defaultValue);
	},
	
	logErr: function(msg)
	{
		ig.log('CustomMenu Error: ' + msg);
	},

	log: function(msg)
	{
		ig.log('CustomMenu: ' + msg);
	}
});

Util.createNestedObject(Support, 'custommenu.data', {})

});