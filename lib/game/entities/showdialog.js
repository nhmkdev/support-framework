/*
 This entity triggers a dialog. It can optionally remember the dialog has been shown.

 Keys for Weltmeister:

 dialog
    Specifies the dialog to show (does nothing without!)

 level
    The name of the level to check the sid for (default is current level)

 sid
 (optional) Save id (flag name) to verify is 0 before displaying. If not specified the dialog data should kill the
 entity as necessary.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair

 */

ig.module(
	'game.entities.showdialog'
)
.requires(
	'impact.entity',
	'support.util',
    'support.dialog',
    'support.save',
	'data.gamedata'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var Dialog = Support.dialog;
var LevelManager = Support.levelmanager;
var Dialogs = ig.global.data.dialogs;

EntityShowdialog = ig.Entity.extend
({
    // weltmeister vars
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: 'rgba(195, 91, 183, 0.7)',
	
    // entity vars
    size: {x: 16, y: 16},
    gravityFactor:0,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,

    // showdialog vars
    dlgObj:null, // actual reference to dialog
    levelId:null,
    sid:null,

	init: function( x, y, settings ) 
    {
        this.parent( x, y, settings );

        // default these properties
        this.levelId = Util.getProperty(settings['level'], LevelManager.currentLevelId);
        this.sid = Util.getProperty(settings['sid'], null);
        if(this.sid == null)
        {
            Util.lg(this, 'EntityShowdialog: No sid specified')
        }

        var dialogId = Util.getProperty(settings['dialog'], null);
        if(dialogId != null)
        {		
            this.dlgObj = Util.getNestedProperty(Dialogs, dialogId);
        }
        
        if(this.dlgObj == null)
        {
            Util.lge(this, 'No dialog specified');
        }
	},
	
	
	check: function( other ) 
    {
		if(other instanceof EntityPlayer &&
            this.dlgObj != null &&
            (this.sid == null || Save.getFlag(this.levelId, this.sid) == 0))
        {
            Save.setFlag(this.levelId, this.sid, 1);
            Dialog.initData(this, this.dlgObj);
        }
	},
});

});