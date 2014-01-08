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

// TODO: windows need text support
    
Windows.sample =
{
    i:'04b03.font', // image
    //sx:0, // source x (default: 0)
    //sy:0, // source y (default: 0)
    x:30, // target x (default: 0)
    y:30, // target y (default: 0)
    //w:32, // width (default: image width)
    //h:16, // height (default: image height)
    //t:'' // text
}

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


Windows.l1 = {};

Windows.l1.sample =
{
    i:'tiles', // image
    //sx:0, // source x (default: 0)
    //sy:0, // source y (default: 0)
    x:30, // target x (default: 0)
    y:30, // target y (default: 0)
    //w:32, // width (default: image width)
    //h:16, // height (default: image height)
}

});