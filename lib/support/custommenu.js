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
    'support.window',
    'support.uimenu'
)
.defines(function(){

// up front shortcut references
var Support = ig.global.support;
var Util = Support.util;
var Window = Support.window;
var ModeStack = Support.modestack;
	
// TODO: custom inputs for the menu ? (or just force the input names...)
// Sample: menu_input_accept

CustomMenu = ig.Game.extend
({
	// non settings vars
	menuFont: null,
	menuIcon:null,
	menuValid: true,
	
	// vars for menu implementation
    windows: [],
    uiMenu:null,
    menuData:null,
    settings:{},
    menuExit:false,

	init: function()
	{
        // TODO: deal with errors
        this.menuData = Support.custommenu.data;
        this.uiMenu = new Support.UIMenu(this, this.menuData);
        this.uiMenu.itemClicked = this.itemClicked;
        this.settings.allowBack = this.uiMenu.getSetting('ab', true);

        // TODO: item length check?

        this.uiMenu.updateLayout(Util.getProperty(this.menuData['t'], ''), this.menuData.mi);
/*
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

    itemClicked:function(item)
    {
        if(item.hasOwnProperty('m'))
        {
            var nextMenu = Util.getProperty(ig.global.data.menus[item.m], null);
            if(null != nextMenu)
            {
                this.menuExit = true;
                ModeStack.push('CustomMenu', this.menuData, 'CustomMenu', nextMenu);
            }
            else
            {
                this.logErr('Invalid menu specified on item.');
            }
        }
        else if(item.hasOwnProperty('g'))
        {
            this.menuExit = true;
            ModeStack.push('CustomMenu', this.menuData, item.g, null);
        }
    },

    backClicked:function()
    {
        this.menuExit = true;
        ModeStack.pop();
    },

	update: function()
	{
		this.parent();
		if(this.menuExit)
		{
			return;
		}

        this.uiMenu.update();
	},
	
	draw: function()
	{
		this.parent();

        if(!this.menuValid || this.menuExit)
        {
            return;
        }

        this.uiMenu.draw();

        // Draw all touch buttons - if we have any
        if( this.buttons )
        {
            this.buttons.draw();
        }
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

Util.createNestedObject(Support, 'custommenu.data', {});
Util.createNestedObject(ig.global, 'data.menus', {});

});