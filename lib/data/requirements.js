/*
 Requirements data for use with various Support Framework data types
 */

ig.module(
    'data.requirements'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'data.init'
)
.defines(function(){

var Requirements = {};
ig.global.data.requirements = Requirements;

Requirements.lapBlaster =
{
    l:'or',
    i:[['t','llap','==1'],['t','llap','==2']]
}

});