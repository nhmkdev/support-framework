/*
 Level information for use with the Support Framework LevelManager (and more)
 */

ig.module(
	'data.levels'
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.init'
)
.defines(function(){

var Levels = {};
ig.global.data.levels = Levels;

Levels.demo = 
{
    n:'Demo',
}

Levels.demo02 =
{
    n:'Demo02',
}

Levels.demo03 =
{
    n:'Demo03',
}

Levels.demo03a =
{
    n:'Demo03a',
}

Levels.demo03b =
{
    n:'Demo03b',
}

Levels.demo03c =
{
    n:'Demo03c',
}
});