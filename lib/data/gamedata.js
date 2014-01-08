/*
 Centralized data include to control the order of inclusion (TODO: appears this does not work!)
 */


ig.module(
	'data.gamedata'
)
.requires(
    'data.init',
    'data.requirements', // TODO: test direct references to reqs
    'data.windows',
    'data.levels',
    'data.input',
    'data.interacts',
    'data.menus', // should require windows (TODO: direct references)
    'data.particles',
    'data.things',

    'data.dialogs', // requires windows
    'data.projectiles', // requires particles
    'data.triggeractions' // requires requirements
)
.defines(function(){
});
