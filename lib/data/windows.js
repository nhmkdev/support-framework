/*
 Window for use with the various Support Framework types that use it

 */

ig.module(
	'data.windows' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.init'
)
.defines(function(){

var Windows = {};
ig.global.data.windows = Windows;

// TODO: windows need text support?
    
Windows.dialogbg =
{
    i:'dialog_bg'
    //w:320,
    //h:240
}

Windows.facebg = 
{
    i:'facebg',
    x:20,
    y:10
}

Windows.textbg = 
{
    i:'textbg',
    x:80,
    y:10
}

Windows.face =
{
    i:'face',
    x:Windows.facebg.x + 4,
    y:Windows.facebg.y + 4
}

Windows.atmbg =
{
    i:'atmbg',
    x:10,
    y:10
}

});