ig.module(
    'data.anims'
)
.requires(
    'impact.game',
    'support.util',
    'data.init'
)
.defines(function(){

var Animations = {};
ig.global.data.anims = Animations;

// All very experimental

Animations.sparkle =
{
    s:
    {
        // TODO: fa not implemented
        fa:true, // flipped allowed (meaning the offset entity can meet the requirements on the left/right
        dc:true // disable player controls (no input)
    },
    es:
    [
        {
            n:'_initiator',
        },
        {
            n:'player',
            x:6, // xoffset from other entities
        },
    ],

    ao: // animation object
    {
        i:'sparkle', // image name ('media/' is prepended)
        w:8, // width of frame
        h:8, // height of frame
        a: // array of animation states
        [
            {
                n:'swing', // TODO/Note name is non-critical in current implementation
                ft:0.1, // frametime
                seq:[0, 0, 0, 0, 1, 2, 0, 1, 2, 3], // sequence
                // TODO: consider supporting the standard action objects on a given frame
                actseq:
                [
                    { f:8, e:'player', k:'ps' } // on frame 8 (or higher if skipped, execute the animAction on the player
                ],
                s:true
            }
        ]
    }
}

});