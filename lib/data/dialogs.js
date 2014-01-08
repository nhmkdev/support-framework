/*
 Dialogs for use with the Support Framework Dialog
 */

ig.module(
	'data.dialogs' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.init',
    'data.windows'
)
.defines(function(){
var Windows = ig.global.data.windows;
var Dialogs = {};
ig.global.data.dialogs = Dialogs;

// NOTE/TODO: use a base, then another general layout item that you swap in the dialog data and pictures/windows etc.

// TODO: selector as graphic instead of char? (like custom menu)

dialogsBaseSettings =
{
        f:'04b03.font',
        w:200,
        h:0,
        x:30,
        y:0,
        osx:5,
        osy:6
}

speakerBase =
{
        f:'04b03.font',
        w:210,
        h:0,
        x:90,
        y:15,
        osx:5,
        osy:6,
        win: [ Windows.textbg, Windows.facebg ]
}

speakerBaseSeq =
{
    base:speakerBase,
    seq:true,
    winex: [ Windows.face ]
}

Dialogs.DebugMenu =
{
    s:
    {
        base:dialogsBaseSettings,
        c:'objects.debugmenu',
        win:
            [
                Windows.dialogbg
            ]
    },
    sa:
        [
            {
                n:'main',
                t:'DEBUG MENU',
                o:
                    [
                        {
                            t:'Add 100 points',
                            ca:'adjustpoints',
                            cav: { p:100 },
                            ns:'main'
                        }
                    ]
            }
        ]
};

Dialogs.demo = {};

Dialogs.demoend =
{
    s:speakerBaseSeq,
    sa:
    [
        {
            t:'The super limited demo is over! More features/demos/samples coming soon!',
        }
    ]
}

Dialogs.demo.d1 =
{
    s:speakerBaseSeq,
    sa:
    [
        {
            t:'Welcome to the demo! Select an option to continue. Both lead to the same thing!',
            o:
            [
                { t:'Option Sample 1' },
                { t:'Option Sample 2'}
            ]
        },
        {
            t:"Be sure to jump over the hole so you don't die and respawn. Though you can certainly try falling in..."
        },
        {
            t:"This dialog trigger will now go away so you won't hit it again.",
            a:{k:true}
        }
    ]
}

Dialogs.demo02 = {};

Dialogs.demo02.lap =
{
    s:
    {
        base:speakerBase,
        winex: [ Windows.face ]
    },
    sa:
        [
            {
                t:"Let's have you run 3 laps. Follow the flags (red indicates the next to collect).",
                r:{i:[['t','llap','==0'],['t','lflag','==0']]},
                a:{sv:[['t','lflag',1]]}
            },
            {
                t:"Nice Lap! Let's make this more fun! LASERS!",
                r:{i:[['t','llap','==1'],['t','lflag','==0']]},
                a:{sv:[['t','lflag',1]]}
            },
            {
                t:"One more to go!",
                r:{i:[['t','llap','==2'],['t','lflag','==0']]},
                a:{sv:[['t','lflag',1]]}
            },
            {
                t:"Way to go! I'll open the door and give you 100 points for fun!",
                r:{i:[['t','llap','==3'],['t','lflag','==0']]},
                a:{sv:[['t','lflag',1], ['i', 'pt', 100], ['demo02', 'gate', 1]], k:true}
            }
        ]
}

Dialogs.demo02.weapons =
{
    s:
    {
        base:speakerBase,
        winex: [ Windows.face ],
        r:{i:[['i','we', '==0']]}
    },
    sa:
    [
        {
            n:'main',
            t:"Do you want weapons enabled before you take the big jump?",
            o:
            [
                {
                    t:"Yes!",
                    a:{sv:[['i','we', 1]], k:true}
                },
                {
                    t:"Nope!",
                    ns:'confirm'
                }
            ]
        },
        {
            n:'confirm',
            t:"Are you sure you don't want weapons enabled before you take the big jump?",
            o:
                [
                    {
                        t:"Yes!",
                        a:{k:true}
                    },
                    {
                        t:"Nope!",
                        ns:'main'
                    }
                ]

        }
    ]
}

Dialogs.demo02.switch =
{
    s:speakerBaseSeq,
    sa:
        [
            {
                t:'Press up to interact with the switch. It controls the door you went through.',
                a:{k:true}
            }
        ]
}

Dialogs.demo03 = {};

Dialogs.demo03.saveinfo =
{
    s:speakerBaseSeq,
    sa:
        [
            {
                t:'If you return to the level you left the state of the switch will be persisted.'
            },
            {
                t:'The state of the flags will not be persisted as they use a temporary partition in the save data',
                a:{k:true}
            }
        ]
}

Dialogs.demo03.threedoors =
{
    s:speakerBaseSeq,
    sa:
        [
            {
                t:'There is a switch in each room. Figure out the sequence to open the door to the right.',
                a:{k:true}
            }
        ]
}

});