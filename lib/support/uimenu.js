/*
 UIMenu is a wrapper around the standard init/update/draw functionality of the Dialog and CustomMenu components.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'support.uimenu'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'support.save',
    'support.window'
)
.defines(function(){

var Support = ig.global.support;
var Save = Support.save;
var Window = Support.window;
var Util = Support.util;

ig.global.support.UIMenu = ig.Class.extend
({
    font:null,
    menuChoices:null,
    menuClass:null,
    menuData:null,
    menuObject:null,
    menuText:'',
    selectChar:'>',
    selectedIndex:0,
    selectedIcon:null,
    selectedIconSettings:null,
    settings:{},
    windows:[],
    windowsExtra:[],

    init:function(object, data)
    {
        this.menuObject = object;
        this.menuData = data;

        if(!Util.defined(this.menuData['s']))
        {
            this.logErr("UIMenu must have settings entry!");
            //TODO: throwing exception or returning null with constructor
        }

        this.selectChar = this.getSetting('sc', '>');
        var fontPath = this.getSetting('f', null);
        if(fontPath != null)
        {
            this.font = Util.loadFont(fontPath);
        }
        else
        {
            this.logErr("UIMenu must have a font defined!");
            //TODO: throwing exception or returning null with constructor
        }

        this.settings.x = this.getSetting('x', 0);
        this.settings.y = this.getSetting('y', 0);
        this.settings.width = this.getSetting('w', 0);

        var optionSettings = this.getSetting('o', {});
        this.settings.o = {};
        this.settings.o.x = Util.getProperty(optionSettings['x'], 0);
        this.settings.o.y = Util.getProperty(optionSettings['y'], 0);
        this.settings.o.width = Util.getProperty(optionSettings['w'], 0);
        this.settings.o.yOffset = Util.getProperty(optionSettings['yo'], 0);
        // this is an offset away from the selector (char or icon)
        this.settings.o.xOffset = Util.getProperty(optionSettings['xo'], 0);

        this.menuClass = this.getSetting('c', null);
        if(this.menuClass != null)
        {
            var dialogClass = Util.getNestedProperty(ig.global, this.menuClass, null);
            if(null == dialogClass)
            {
                this.logErr('Dialog class was unable to be evaluated');
                this.menuClass = null;
            }
            else
            {
                // set the actual class, not the string
                this.menuClass = dialogClass;
            }
        }

        var selectedIcon = this.getSetting('si', null);
        if(selectedIcon != null)
        {
            this.selectedIcon = Util.loadImage(selectedIcon);
            var iconSettings = this.getSetting('sia', {});
            this.selectedIconSettings = {};
            this.selectedIconSettings.sx = Util.getProperty(iconSettings['sx'], 0);
            this.selectedIconSettings.sy = Util.getProperty(iconSettings['sy'], 0);
            this.selectedIconSettings.w = Util.getProperty(iconSettings['w'], this.selectedIcon.width);
            this.selectedIconSettings.h = Util.getProperty(iconSettings['h'], this.selectedIcon.height);
            this.selectedIconSettings.yOffset = Util.getProperty(iconSettings['yo'], 0);
        }

        this.settings.o.selectWidth = (this.selectedIcon == null ?
            this.font.widthMap[this.selectChar.charCodeAt(0) - this.font.firstChar] :
            this.selectedIcon.width) + this.settings.o.xOffset;

        // load dialog windows
        // 'win' can include base windows
        Window.loadWindows(this.getSetting('win', null), this.windows);
        // 'winex' can include base windows but is also an extension
        Window.loadWindows(this.getSetting('winex', null), this.windows);
    },

    /*
     Gets a setting from the dialog data 's' property (defaulting to the base)
     @param (string) setting - The setting to get
     @param (object) defaultValue - The default value if nothing is found
     @return {object} The resulting value
     */
    getSetting:function(setting, defaultValue)
    {
        return Util.getOverrideProperty(setting, this.menuData.s, this.menuData.s.base, defaultValue);
    },

    /*
     Updates the layout/text/options based on the current state
     */
    updateLayout:function(rawText, arrayChoices)
    {
        var heightData = {};

        if(this.menuClass != null && Util.defined(this.menuClass['getKeyString']))
        {
            rawText = Util.localizeString(rawText, this.menuClass);
        }
        this.menuText = Util.splitStringToWidth(rawText, this.settings.width, this.font, heightData);

        // TODO: potential for overlap if the state text is too long, height of rectangle is meaningless

        this.menuChoices = [];

        if(Util.defined(arrayChoices))
        {
            var choiceY = this.settings.o.y;
            var optionMaxWidth = this.settings.o.width - this.settings.o.selectWidth;
            for( var idx = 0, len = arrayChoices.length; idx < len; idx++)
            {
                var choice = arrayChoices[idx];

                if(Util.defined(choice['r']))
                {
                    if(!Save.processReqsObject(choice.r))
                    {
                        continue;
                    }
                }
                var choiceData = {};
                rawText = choice.t;
                if(this.menuClass != null)
                {
                    rawText = Util.localizeString(rawText, this.menuClass);
                }
                choiceData.text = Util.splitStringToWidth(rawText, optionMaxWidth, this.font, heightData);
                choiceData.x = this.settings.o.x + this.settings.o.selectWidth;
                choiceData.y = choiceY;
                choiceData.optionData = choice;
                this.menuChoices.push(choiceData);
                choiceY += heightData.height + this.settings.o.yOffset;
            }

            // check the valid choices for the first that is marked as default
            for(var idx = 0, len = this.menuChoices.length; idx < len; idx++)
            {
                if(Util.getProperty(this.menuChoices['d']), false)
                {
                    this.selectedIndex = idx;
                    break;
                }
            }

            if(this.selectedIndex >= this.menuChoices.length || this.selectedIndex < 0)
            {
                this.selectedIndex = 0;
            }
        }
    },

    itemClicked:function(itemClicked){},

    backClicked:function(){},

    /*
     Update processor (usually called in the game mode blocking all other activity)
     @return (bool) true if still operating in the dialog, false otherwise
     */
    update:function()
    {
        if(this.menuData == null)
        {
            return false;
        }

        if(ig.input.pressed ('primary'))
        {
            this.itemClicked.apply(
                this.menuObject,
                this.menuChoices.length > 0 ? [this.menuChoices[this.selectedIndex].optionData] : null);
        }
        else if(ig.input.pressed('secondary') && this.settings.allowBack)
        {
            this.backClicked.apply(this.menuObject);
        }
        else if (ig.input.pressed('down'))
        {
            this.selectedIndex++;
            if (this.selectedIndex > this.menuChoices.length - 1)
            {
                this.selectedIndex = 0;
            }
        }
        else if (ig.input.pressed('up'))
        {
            this.selectedIndex--;
            if (0 > this.selectedIndex)
            {
                this.selectedIndex = this.menuChoices.length - 1;
            }
        }
        return true;
    },

    /*
     Draw processor for the dialog (usually called in the game mode)
     @return {bool} true if drawing the dialog, false otherwise
     */
    draw:function()
    {
        if(this.menuData == null)
        {
            return false;
        }

        // render windows
        Window.drawWindows(this.windows);
        Window.drawWindows(this.windowsExtra);

        // render text
        this.font.draw(this.menuText, this.settings.x, this.settings.y, ig.Font.ALIGN.LEFT);

        // render dialog text items (and selector)
        for( var idx = 0, len = this.menuChoices.length; idx < len; idx++)
        {
            var stateChoice = this.menuChoices[idx];

            // draw the indicator that this item is selected
            if (this.selectedIndex == idx)
            {
                if (this.selectedIcon == null)
                {
                    this.font.draw(this.selectChar, this.settings.o.x, stateChoice.y, ig.Font.ALIGN.RIGHT);
                }
                else
                {
                    this.selectedIcon.draw(this.settings.o.x, stateChoice.y + this.selectedIconSettings.yOffset,
                        this.selectedIconSettings.sx,
                        this.selectedIconSettings.sy,
                        this.selectedIconSettings.w,
                        this.selectedIconSettings.h);
                }
            }
            // draw the text
            this.font.draw(stateChoice.text, stateChoice.x, stateChoice.y, ig.Font.ALIGN.LEFT);
        }
        return true;
    }
})
});