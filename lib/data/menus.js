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
	x:20,
	y:20,
	ys:20,
	w:200,
	ab:false,
	f: '04b03.font',
    o:
    {
        x:20,
        y:40,
        yo:5,
        w:200
    }
};

Menus.mainMenu =
{
    t:'Main Menu',
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