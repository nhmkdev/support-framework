/*
 Level Manager is a basic wrapper around the ig.game.loadLevelDeferred functionality allowing for checkpoints and
 tracking of how/when the player entered a level (knowledge of where the player was).

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

// TODO: this auto-checkpoints on entry to a new level -- make that optional
// TODO: document why the last level id is important (as it is for spawn points resulting from level transition)

ig.module(
	'support.levelmanager'
)
.requires(
	'impact.game',
	'support.util',
    'support.save'
)
.defines(function(){

var Support = ig.global.support;
var Save = Support.save;
var Util = Support.util;

function LevelManager()
{
    this.currentLevel = null;
    this.currentLevelId = null;
    this.lastLevelId = null;
}

/*
 Wrapper for the ImpactJS loadDeferred. Loads the specified level id (property name in level data).
 @param (string) levelId - The id of the level to load
 */
LevelManager.prototype.loadDeferred = function(levelId)
{
    // this data is not available immediately
    var Levels = ig.global.data.levels;

    Save.levelLoadReset();
    this.lastLevelId = this.currentLevelId;
    this.currentLevelId = levelId;

    this.updateSpawnPoint();

    // TODO: allow optional save on level change (NOTE: something will need to create the initial save if disabled)
    Save.saveData();

    this.currentLevel = Util.getProperty(Levels[levelId], null);
    if(this.currentLevel != null && Util.defined(this.currentLevel['n']))
    {
        ig.game.loadLevelDeferred( ig.global['Level' + this.currentLevel.n] );
        ig.game.playerEntity = null;
    }
    else
    {
        ig.log('Level definition invalid: ' + levelId);
    }
}

/*
 Updates the spawn point of the player (either from level transition and/or spawn point update (pending!))
 @param (string) id - (optional) The unique identifier for the spawn point in the level
 */
LevelManager.prototype.updateSpawnPoint = function(id)
{
    Save.setTag('g', 'lastlevelid', this.lastLevelId);
    Save.setTag('g', 'levelid', this.currentLevelId);
    Save.setTag('g', 'spawnid', Util.defined(id) ? id : '');
}

/*
 Reloads the save for the player in relation to the spawn point in the save data
 */
LevelManager.prototype.reloadSave = function()
{
    Save.loadData(true);
    // TODO: this is a bit messy
    this.currentLevelId = Save.getTag('g', 'lastlevelid');
    this.loadDeferred(Save.getTag('g', 'levelid'));
}

Support.levelmanager = new LevelManager();
});