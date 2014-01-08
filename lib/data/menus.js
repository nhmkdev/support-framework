/*
 Menu data for use with the Support Framework CustomMenu
 */

ig.module(
	'data.menus' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.init'
)
.defines(function(){

var Menus = {};
ig.global.data.menus = Menus;

var baseSettings =
{
	x:50,
	y:20,
	ys:20,
	w:true,
	ab:false,
	f: '04b03.font'
};

Menus.mainMenu =
{
	mi:
    [
        {t: "Start Game", g:'MainGame'},
        // TODO: coming soon....
        //{t: "Configure Controls", g:"InputConfigMenu"}
    ],
	s:
	{
		base:baseSettings
	}
};


});