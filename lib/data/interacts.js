/*
 Interact data for use with the associated Support Framework entities (Interact, leveldoor, switch, etc.)
 */

ig.module(
	'data.interacts' 
)
.requires(
	'impact.game',
	'impact.font',
	'support.util',
    'data.init'
)
.defines(function(){

var Interacts = {};
ig.global.data.interacts = Interacts;
Interacts.switch = {};
Interacts.door = {};

Interacts.switch.generic =
{
    ao:
    {
        i:'switch',
        w:16,
        h:16,
        a:
        {
            off:
            {
                ft:1,
                seq:[0],
                v:0
            },
            on:
            {
                ft:1,
                seq:[1],
                v:1
            }
        }
    }
}

Interacts.door.generic =
{
    ao:
    {
        i:'door01',
        w:24,
        h:24,
        a:
        {
            idle:
            {
                ft:1,
                seq:[0]
            }
        }
    }
}


Interacts.atm =
{
    d:'ATM.main',
    ht: 'All Things Machine',
    ao:
    {
        i:'atm',
        w:32,
        h:48,
        a:
        {
            main:
            {
                ft:'0.2',
                seq:[0, 1, 2, 3, 0, 4, 4, 0, 4, 4]
            }
        }
    }
}
});