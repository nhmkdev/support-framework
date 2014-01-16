/*
 Input data settings for use with the Support Framework InputConfig
 */

ig.module(
	'data.input' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.init'
)
.defines(function(){

ig.global.data.inputData =
[
		{action:'up', 			input:ig.KEY.UP_ARROW, 		description:'Up'},
		{action:'down', 		input:ig.KEY.DOWN_ARROW, 	description:'Down'},
		{action:'left', 		input:ig.KEY.LEFT_ARROW, 	description:'Left'},
		{action:'right', 		input:ig.KEY.RIGHT_ARROW, 	description:'Right'},
		{action:'primary', 		input:ig.KEY.CTRL, 			description:'Accept/Shoot'},
		{action:'secondary', 	input:ig.KEY.ALT,			description:'Back/Jump'},
		{action:'pause',	 	input:ig.KEY.P,				description:'Pause'},
		{action:'menu', 		input:ig.KEY.ESC,			description:'Menu'},
        {action:'debugmenu',    input:ig.KEY.D, 			description:'debug menu'}
];

});