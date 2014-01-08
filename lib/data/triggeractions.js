/*
 Trigger Action data for use with the associated Support Framework entities
 */

ig.module(
    'data.triggeractions'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'data.init'
)
.defines(function(){

var TriggerActions = {};
ig.global.data.triggeractions = TriggerActions;

TriggerActions.sample =
{
    r:null, // requirements (default:null)
    a:null // action (default:null)
}
});