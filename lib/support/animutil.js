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
    // create the convenience mapping of name -> state (as the original data is in array format)
    entity.animationStateMap = Util.createArrayToObjectMap(animation.a, 'n');
    for(var x = 0, len = animation.a.length; x < len; x++)
    {
        var animState = animation.a[x];
        entity.addAnim(animState.n, animState.ft, animState.seq, Util.getProperty(animState['s'], false));
    }
}

/*
 Loads an image from a property
 @param (object) entity - The entity to update the animation state of
 @param {object} animation - The animation array to use to determine the next state
 @return {object} The next animation state
 */
Util.updateAnimationState = function(entity, animationArr)
{
    var nextAnimState = null;
    // find the next state
    for(var x = 0, len = animationArr.length; x < len; x++)
    {
        var animState = animationArr[x];
        if(Util.defined(animState['r']))
        {
            if(Save.processReqsObject(animState.r))
            {
                nextAnimState = animState;
                break;
            }
        }
        else
        {
            nextAnimState = animState;
            break;
        }
    }
    if(nextAnimState != null)
    {
        Util.setAnimationState(entity, nextAnimState);
    }
    return nextAnimState;
}

/*
 Sets the animation state on an entity
 @param (object) entity - The entity to update the animation state of
 @param {object} animState - The animation state object to set
 */
Util.setAnimationState = function(entity, animState)
{
    // NOTE: checking entity.currentAnim would be invalid as ImpactJS automatically sets currentAnim upon initialization.
    if(Util.defined(entity.currentAnimState) && entity.currentAnimState.n == animState.n) return;

    // TODO: support fx/fy for flipping x/y

    // TODO: rewind may not always be desired (?)
    entity.currentAnim = entity.anims[animState.n].rewind();
    entity.size = Util.getProperty(animState['b'], entity.size);
    entity.offset = Util.getProperty(animState['bo'], entity.offset);
    entity.gravityFactor = Util.getProperty(animState['g'], entity.gravityFactor);
    entity.collides = ig.Entity.COLLIDES[Util.getProperty(animState['c'], 'NEVER')];
    entity.currentAnimState = animState;
}

});