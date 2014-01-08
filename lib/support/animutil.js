/*
 Animation Utils (extends the Util object). This is the centralized code for all data based animation loading and
 state based controls to determine what animation should be active at a given time.

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'support.animutil'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'support.save'
)
.defines(function(){

var Support = ig.global.support;
var Util = Support.util;
var Save = Support.save;

/*
 Loads all the animations on an entity object
 @param (object) entity - The entity to load/configure the animations into
 @param {object} animtion - The animation object to load the settings from
 */
Util.loadEntityAnimations = function(entity, animation)
{
    // TODO: error checking! (also allow non specification of the with and height?)
    entity.animSheet = Util.loadAnimationSheet(animation.i, animation.w, animation.h);
    // default the bounds of the item to the size of the art
    entity.size.x = animation.w;
    entity.size.y = animation.h;
    entity.size = Util.getProperty(animation['s'], entity.size);
    entity.offset = Util.getProperty(animation['o'], entity.offset);
    entity.gravityFactor = Util.getProperty(animation['g'], entity.gravityFactor);
    for(var n in animation.a)
    {
        // TODO: flip x/y (fx, fy)?
        var animState = animation.a[n];
        entity.addAnim(n, animState.ft, animState.seq, Util.getProperty(animState['s'], false));
    }
}

/*
 Loads an image from a property
 @param (object) entity - The entity to update the animation state of
 @param {object} animsCollection - The animation object to determine what the next state should be
 @return {object} The next animation state
 */
Util.updateAnimationState = function(entity, animsCollection)
{
    var nextAnimState = null;
    // TODO: the animsCollection order is not guaranteed so extra data is required to lock to a given state in
    // some situations
    // find the next state
    for(var stateName in animsCollection)
    {
        // TODO: has own property check necessary?

        var anim = animsCollection[stateName];
        if(Util.defined(anim['r']))
        {
            if(Save.processReqsObject(anim.r))
            {
                nextAnimState = anim;
                break;
            }
        }
        else
        {
            nextAnimState = anim;
            break;
        }
    }
    if(nextAnimState != null)
    {
        Util.setAnimationState(entity, nextAnimState, stateName);
    }
    return nextAnimState;
}

/*
 Sets the animation state on an entity
 @param (object) entity - The entity to update the animation state of
 @param {object} animState - The animation state object to set
 @param {string} stateName - The animation name to set
 */
Util.setAnimationState = function(entity, animState, stateName)
{
    // TODO: if the current matches should this skip?

    // TODO: rewind may not always be desired (?)
    entity.currentAnim = entity.anims[stateName].rewind();
    entity.size = Util.getProperty(animState['b'], entity.size);
    entity.offset = Util.getProperty(animState['bo'], entity.offset);
    entity.gravityFactor = Util.getProperty(animState['g'], entity.gravityFactor);
    entity.collides = ig.Entity.COLLIDES[Util.getProperty(animState['c'], 'NEVER')];
    entity.currentAnimStateName = stateName;
    entity.currentAnimState = animState;
}

});