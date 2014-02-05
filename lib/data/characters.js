ig.module(
    'data.characters'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'data.init'
)
.defines(function(){

var Characters = {};
ig.global.data.characters = Characters;

Characters.mrblue =
{
    n:'mrblue', // entity name to assign
    i:
    {
        d:'characters.mrblue', // dialog
        ht: 'Mr. Blue', // character name (shown in hud if able to interact and this is specified)
        ao: // animation object
        {
            i:'boxblue', // image name ('media/' is prepended)
            w:16, // width of frame
            h:16, // height of frame
            a: // array of animation states
            [
                {
                    n:'idle',
                    ft:1, // frametime
                    seq:[0] // sequence
                },
                {
                    n:'run',
                    ft:1, // frametime
                    seq:[0] // sequence
                }
            ]
        }
    }
}

});