/*
 Level Manager is a basic wrapper around the ig.game.loadLevelDeferred functionality allowing for checkpoints and
 tracking of how/when the player entered a level (knowledge of where the player was).

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

// TODO: this auto-checkpoints on entry to a new level -- make that optional

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
    this.spawnId = null; // used to determine which player spawn point to place the player at
}

LevelManager.prototype.loadStartLevel = function()
{
    // this data is not available immediately
    var Levels = ig.global.data.levels;
    for(var levelId in Levels)
    {
        if(Util.defined(Levels[levelId]['s']) && Levels[levelId]['s'] == true)
        {
            this.loadDeferred(levelId);
            return;
        }
    }
}

/*
 Wrapper for the ImpactJS loadDeferred. Loads the specified level id (property name in level data).
 @param (string) levelId - The id of the level to load
 @param (string) spawnId - (optional) The spawn id to set (default is null)
 */
LevelManager.prototype.loadDeferred = function(levelId, spawnId)
{
    // this data is not available immediately
    var Levels = ig.global.data.levels;

    Save.levelLoadReset();
    this.spawnId = Util.defined(spawnId) ? spawnId : null;
    this.currentLevelId = levelId;

    this.updateSpawnPoint(spawnId);

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
 @param (string) id - The unique identifier for the spawn point in the level
 */
LevelManager.prototype.updateSpawnPoint = function(id)
{
    Save.setTag('g', 'levelid', this.currentLevelId);
    this.spawnId = id;
    Save.setTag('g', 'spawnid', this.spawnId);
}

/*
 Reloads the save for the player in relation to the spawn point in the save data
 */
LevelManager.prototype.reloadSave = function()
{
    Save.loadData(true);
    this.loadDeferred(Save.getTag('g', 'levelid'), Save.getTag('g', 'spawnid'));
}

Support.levelmanager = new LevelManager();
});