/*
 XDK Test module for the support framework demo

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'game.xdktest'
)
.requires(
    'plugins.dc.dc',

    'impact.game'
)
.defines(function(){

// Startup mode to initialize the game
XDKTestMode = ig.Game.extend
({
    inputArray: ['up', 'left', 'right', 'primary', 'secondary'],
    lastInput:'None',

    init: function()
    {
        this.image = new ig.Image('media/boxblue.png');
        this.font = new ig.Font( 'media/04b03.font.png');
        //console.log( JSON.stringify(this.font.indices) );
        //console.log( JSON.stringify(this.font.widthMap) );

        // Hard code in the "working" font information
        //http://impactjs.com/forums/help/cocoon-js-issues#post22013
        this.font.indices = [0,5,7,11,17,22,28,34,36,39,42,46,50,53,57,59,65,70,73,78,83,88,93,98,103,108,113,115,117,121,125,129,134,140,145,150,154,159,163,167,172,177,181,186,191,195,201,206,211,216,221,226,231,235,240,245,251,256,261,265,268,274,277,281,286,289,294,299,303,308,313,317,322,327,329,332,337,339,345,350,355,360,365,369,374,378,383,388,394,398,403,408,412,414,418] ;
        this.font.widthMap = [4,1,3,5,4,5,5,1,2,2,3,3,2,3,1,5,4,2,4,4,4,4,4,4,4,4,1,1,3,3,3,4,5,4,4,3,4,3,3,4,4,3,4,4,3,5,4,4,4,4,4,4,3,4,4,5,4,4,3,2,5,2,3,4,2,4,4,3,4,4,3,4,4,1,2,4,1,5,4,4,4,4,3,4,3,4,4,5,3,4,4,3,1,3,4] ;
        this.fx = 0;
        this.fy = 0;
    },

    update: function()
    {
        var i = this.inputArray.length;
        while(i--)
        {
            if(ig.input.pressed(this.inputArray[i]))
            {
                this.lastInput = this.inputArray[i];
                break;
            }
        }
    },

    draw: function()
    {
        this.parent();

        this.image.draw(0,0);
        this.font.draw("(40,40)", 40, 40, ig.Font.ALIGN.CENTER);
        this.font.draw(this.lastInput, 20, 20, ig.Font.ALIGN.LEFT);
        this.font.draw("test", this.fx, this.fy, ig.Font.ALIGN.CENTER);
        this.fx += 10;
        if(this.fx > 1000)
        {
            this.fx = 0;
            this.fy += 10;
            if(this.fy > 1000)
            {
                this.fy = 0;
            }
        }
    }
});

// Start the Game with 60fps, a resolution of 240x160, scaled
ig.main( intel.xdk.canvas, XDKTestMode, 60, 160, 240, 1 );
console.log('started test');

// NOTE: pressing the menu button resumes rendering on the droid razr

/*
// TODO: set this up in its own file (it does work in the emulator)
var initControls = function()
{
    console.log('init controls');
    var addControl = function(maindiv, style, id, buttonName, img)
    {
        var div = maindiv.appendChild(document.createElement("div"));
        div.setAttribute('style', style);
        div.setAttribute('id', id);
        div.setAttribute('ontouchstart', "handleInputDown('" + buttonName +"');");
        div.setAttribute('ontouchend', "handleInputUp('buttonName');");
        div.appendChild(document.createElement("img")).setAttribute('src', "media/red64.png");
    }
    var mainDiv = document.body.appendChild(document.createElement("div"));
    addControl(mainDiv, 'position:absolute;bottom:0px;left:0px;', 'ButtonLeft', 'left');
    addControl(mainDiv, 'position:absolute;bottom:0px;left:64px;', 'ButtonRight', 'right');
    addControl(mainDiv, 'position:absolute;bottom:64px;left:32px;', 'ButtonUp', 'up');

    addControl(mainDiv, 'position:absolute;bottom:0px;right:64px', 'ButtonPrimary', 'primary');
    addControl(mainDiv, 'position:absolute;bottom:0px;right:0px', 'ButtonSecondary', 'secondary');

    console.log('All done.');
}

intel.xdk.webview.execute('window.initControls = ' + initControls);
intel.xdk.webview.execute('window.initControls();');
*/
});