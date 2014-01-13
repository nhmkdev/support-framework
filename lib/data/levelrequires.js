/*
 Central include containing all the levels in the game
 */

ig.module(
	'data.levelrequires'
)
.requires(
    'game.levels.demo01',
    'game.levels.demo02',
    'game.levels.demo03',
    'game.levels.demo03a',
    'game.levels.demo03b',
    'game.levels.demo03c'
)
.defines(function(){

    // NOTE: this is always included AFTER data.gamedata in main.js

});


