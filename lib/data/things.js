/*
 Thing data for use with the associated Support Framework entities (thing, door, etc.)
 */

ig.module(
    'data.things'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'data.init',
    'data.requirements'
)
.defines(function(){

var Things = {};
ig.global.data.things = Things;
var Requirements = ig.global.data.requirements;

//TODO: sound on state change?

Things.demo02 = {};

Things.demo02.redFlagOne =
{
    // ao is for visible objects
    ao: // animation object
    {
        i:'redflag', // image name ('media/' is prepended)
        w:16, // width of frame
        h:16, // height of frame
        a: // animation states
        [
            {
                n:'collect',
                r:{i:[['t','lflag','==1'],['t','llap','<3']]}, // requirements (e == n != g > l < gte >= lte <=
                a:{sv:[['t','lflag',2]]}, // action (sv (setvalue) si(setinc) sd(setdec) k(kill, true/false))
                ft:1, // frametime
                seq:[0] // sequence
                //s:'', // stop (after play)
                //c: // impactjs style collision for this state
            },
            {
                n:'idle',
                ft:1, // frametime
                seq:[1], // sequence
                d:true // disabled (only affected by save change)
                //s:'', // stop (after play) (optional)
                //c: // impactjs style collision for this state (optional)
            }
        ]
    }
}

Things.demo02.redFlagTwo =
{
    ao: // animation object
    {
        i:'redflag', // image name ('media/' is prepended)
        w:16, // width of frame
        h:16, // height of frame
        a: // array of animation states
        [
            {
                n:'collect',
                r:{i:[['t','lflag','==2']]}, // requirements
                a:{sv:[['t','lflag',3]]}, // action (sv (setvalue) si(setinc) sd(setdec)
                ft:1, // frametime
                seq:[0] // sequence
                //s:'', // stop (after play)
            },
            {
                n:'idle',
                ft:1, // frametime
                seq:[1], // sequence
                d:true // disabled (only affected by save change)
                //s:'', // stop (after play)
            }
        ]
    }
}

Things.demo02.redFlagThree =
{
    ao: // animation object
    {
        i:'redflag', // image name ('media/' is prepended)
        w:16, // width of frame
        h:16, // height of frame
        a: // array of animation states
        [
            {
                n:'collect',
                r:{i:[['t','lflag','==3']]}, // requirements
                a:{sv:[['t','lflag',4]]}, // action (sv (setvalue) si(setinc) sd(setdec)
                ft:1, // frametime
                seq:[0] // sequence
                //s:'', // stop (after play)
            },
            {
                n:'idle',
                ft:1, // frametime
                seq:[1], // sequence
                d:true // disabled (only affected by save change)
                //s:'', // stop (after play)
            }
        ]
    }
}

Things.demo02.redFlagFour =
{
    ao: // animation object
    {
        i:'redflag', // image name ('media/' is prepended)
        w:16, // width of frame
        h:16, // height of frame
        a: // array of animation states
        [
            {
                n:'collect',
                r:{i:[['t','lflag','==4']]}, // requirements
                a:{sv:[['t','lflag',0], ['demo02', 'dlg.lap', 0]], si:[['t','llap']]}, // action (sv (setvalue) si(setinc) sd(setdec)
                ft:1, // frametime
                seq:[0] // sequence
                //s:'', // stop (after play)
            },
            {
                n:'idle',
                ft:1, // frametime
                seq:[1], // sequence
                d:true // disabled (only affected by save change)
                //s:'', // stop (after play)
            }
        ]
    }
}

Things.door = {};

Things.door.generic =
{
    ao: // animation object
    {
        i:'gate', // image name ('media/' is prepended)
        w:16,
        h:32,
        a: // array of animation states
        [
            {
                n:'closed',
                b: { x:2, y: 32},
                ft:1, // frametime
                seq:[1] // sequence
            },
            {
                n:'open',
                ft:1, // frametime
                seq:[0] // sequence
            }
        ]
    }
}

Things.demo03 = {};

Things.demo03.gate =
{
    ao: // animation object
    {
        i:'gate', // image name ('media/' is prepended)
        w:16,
        h:32,
        a: // array of animation states
        [
            {
                n:'open',
                r:Requirements.demo03.gate,
                ft:1, // frametime
                seq:[0], // sequence
                c:'NONE'
            },
            { // this is the fall through case (no requirements)
                n:'closed',
                b: { x:2, y: 32},
                ft:1, // frametime
                seq:[1], // sequence
                c:'FIXED'
            }
        ]
    }
}

Things.demo03.gateLight =
{
    ao:
    {
        i:'gatelight',
        w:16,
        h:16,
        g:0,
        a:
        [
            {
                n:'green',
                r:Requirements.demo03.gate,
                ft:1,
                seq:[1]
            },
            { // this is the fallthrough case
                n:'red',
                ft:1,
                seq:[0]
            }
        ]
    }
}

});