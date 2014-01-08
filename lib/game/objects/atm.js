ig.module( 
	'game.objects.atm'
)
.requires(
	'impact.game',
    'support.util',
    'support.save',
    'game.objects.hud'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;
var HUD = ig.global.objects.hud;
    
var ATM_PARTITION = 'atm';
    
function ATM()
{
    this.keyTranslators = [];
    this.keyTranslators['points'] = function() { return Save.getFlag(ATM_PARTITION, 'pt', 0); }
}

ATM.prototype.save = function(actionVar)
{
    var amt = actionVar.pt;
    if(amt == -1)
    {
        // This is the case where the player empties the savings
        amt = Save.getFlag(ATM_PARTITION, 'pt', 0);
    }
    Save.adjustFlag(ATM_PARTITION, 'pt', -amt);
    Save.adjustFlag('i', 'pt', amt);
    if(amt < 0)
    {
        HUD.addStatusMessage('Increased savings by ' + -amt +' points.', 3);
    }
    else
    {
        HUD.addStatusMessage('Decreased savings by ' + amt +' points.', 3);
    }
}

ATM.prototype.gamble = function(actionVar)
{
    Save.adjustFlag(ATM_PARTITION, 'pt', actionVar.pt);
    if(50 >= Math.floor((Math.random()*100)+1))
    {
        HUD.addStatusMessage('Gambled and won ' + actionVar.ptw +' points!', 3);
        Save.adjustFlag(ATM_PARTITION, 'pt', actionVar.ptw);
    }
    else
    {
        HUD.addStatusMessage('Gambled and lost!', 3);
    }
}
    
// key localizer
ATM.prototype.getKeyString = function(key)
{
    if(Util.defined(this.keyTranslators[key]))
    {
        return this.keyTranslators[key]();
    }
    return '-UNKOWN-';
}

ig.global.objects.atm = new ATM();
});
