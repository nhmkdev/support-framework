ig.module( 
	'game.objects.debugmenu'
)
.requires(
	'impact.game',
    'support.save',
	'support.util'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;

function DebugMenu(){}

DebugMenu.prototype.adjustpoints = function(actionVar)
{
    if(Util.defined(actionVar) && Util.defined(actionVar.p))
    {
        Save.incFlag('i', 'pt', actionVar.p);
    }
}
ig.global.objects.debugmenu = new DebugMenu();

});
