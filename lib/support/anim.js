/*
 Anim entity (wrapper for simple animations -- utterly experimental and hacky)

// TODO flipping, positioning etc. is x only for now...

 Project: Support Framework (https://github.com/nhmkdev/support-framework)
 Author: Tim Stair
 */

ig.module(
    'support.anim'
)
.requires(
    'impact.entity',
    'support.util',
    'support.animutil',
    'support.particle',
    'data.gamedata'
)
.defines(function()
{

var Support = ig.global.support;
var Util = Support.util;
var Animations = ig.global.data.anims;
var Save = Support.save;
var Anim  = {};
Support.anim = Anim;

/*
 Processes an action object associated with an entity
 @param (object) entity - The entity to operate on
 @param (object) actionObj - The action object to operate with
 */
Anim.processActionObject = function(entity, actionObj)
{
    if(!Util.defined(actionObj)) return;

    var animId = Util.getProperty(actionObj['anim'], null);
    if(animId != null)
    {
        // need animation system to spawn the entity
        // this spawns the animation controller
        // (TODO: is the controller necessary as an entity? Just for the sake of the update()) ?
        // -- otherwise a higher level controller will need to manage and have knowledge of each anim instance
        ig.game.spawnEntity( EntitySupportAnim, entity.pos.x, entity.pos.y, {animId:animId, entity:entity} );
    }
}

EntitySupportAnim = ig.Entity.extend
({
    // entity vars
    gravityFactor:0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    animSheet: null,

    // anim vars
    animObj:null,
    flip:false,
    flipAllowed:false,
    entities:[], // not used yet, dictionary might be more useful
    entityCache:{},
    entitiesActing:0,
    initiatorEntity:null,
    disabledControls:false,

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );

        this.initiatorEntity = Util.getProperty(settings['entity'], null);
        if(Util.defined(settings['animId']))
        {
            this.animObj = Util.getNestedProperty(Animations, settings.animId, null);
            if(this.animObj != null)
            {
                var animSettings = Util.getProperty(this.animObj['s'], {});
                this.flipAllowed = Util.getProperty(animSettings['fa'], false);
                this.disabledControls = Util.getProperty(animSettings['dc'], false);
                this.toggleControls(false);
                var entitySettingsArray = Util.getProperty(this.animObj['es'], []);
                this.entitiesActing = entitySettingsArray.length - 1;
                // 0 index is always the static entity (for now...)
                var staticEntity = this.getEntity(Util.getProperty(entitySettingsArray[0]['n'], null));
                this.entities.push(staticEntity);
                for(var idx = 1, len = entitySettingsArray.length; idx < len; idx++)
                {
                    var entitySettings = entitySettingsArray[idx];
                    var entity = this.getEntity(Util.getProperty(entitySettings['n'], null));
                    if(entity != null)
                    {
                        var xOffset = Util.getProperty(entitySettings['x'], 0);
                        var yOffset = Util.getProperty(entitySettings['y'], 0);
                        if((xOffset + yOffset) != 0)
                        {
                            //NOTE: animations should always face right in the image (flip always means left facing)
                            if(Util.isFunction(entity['moveTo']))
                            {
                                // TODO: this is x only for now (har)
                                var left = (staticEntity.pos.x - xOffset) - entity.size.x;
                                var right = staticEntity.pos.x + staticEntity.size.x + xOffset;
                                var xDest = entity.pos.x;
                                var yDest = entity.pos.y;
                                // NOTE: these first two checks apply to non-interact anims (as the player generally is colliding with the static entity)
                                if(entity.pos.x > right)
                                {
                                    xDest = right;
                                }
                                else if(entity.pos.x + entity.size.x < left)
                                {
                                    xDest = left;
                                    this.flip = true;
                                }
                                else
                                {
                                    if(entity.pos.x > (staticEntity.pos.x + staticEntity.size.x / 2))
                                    {
                                        xDest = right;
                                    }
                                    else
                                    {
                                        xDest = left;
                                        this.flip = true;
                                    }
                                }

                                // TODO: enable entity can reach check
                                //if(this.canEntityReach(entity, xDest, yDest))
                                {
                                    entity.moveTo(xDest, yDest, this.entityReady.bind(this));
                                }
                                /*else
                                {
                                    Util.lge(entity, 'No valid movement to move entity, cheating position');
                                    entity.pos.x = xDest;
                                    entity.pos.y = yDest;
                                    this.entityReady();
                                }*/
                            }
                            else
                            {
                                Util.lge(entity, 'does not define moveTo function required for animation');
                            }
                        }
                        else
                        {
                            this.entitiesActing--;
                        }
                        this.entities.push(entity);
                    }
                }
            }
        }
        else
        {
            Util.lge(this, 'EntityAnim: no animObject property found');
        }
    },

    update: function()
    {
        this.parent();
    },

    getEntity: function(entityName)
    {
        if(entityName == null)
        {
            return null;
        }

        if(entityName == '_initiator')
        {
            return this.initiatorEntity;
        }

        return ig.game.getEntityByName(entityName, null);
    },

    canEntityReach: function(entity, x, y)
    {
        // TODO: collisionmap check might be able to be optimized depending on usage (only checking the middle of each block using bounds)
        // TODO: need to check other entities that would block movement
        var adjustX = entity.pos.x > x ? -1 : 1;
        var adjustY = entity.pos.y > y ? -1 : 1;
        var result = 0;
        while(entity.pos.x != x && entity.pos.y != y)
        {
            result = ig.game.collisionMap.getTile(x, y);
            if(result != 0)
            {
                return false;
            }
            if(entity.pos.x != x) x += adjustX;
            if(entity.pos.y != y) y += adjustY;
        }
        return true;
    },

    toggleControls: function(toggleOn)
    {
        // TODO move this to a central location
        if(this.disabledControls)
        {
            Save.setFlag('i', 'dc', toggleOn ? 1 : 0);
        }
    },

    kill: function()
    {
        this.toggleControls(true);
    },

    entityReady: function()
    {
        this.entitiesActing--;
        if(this.entitiesActing == 0)
        {
            // start the animation!
            ig.game.spawnEntity( EntityAnimPlay, this.pos.x + (this.flip ? 0 : this.size.x), this.pos.y, {flip:this.flip, ae:this, ao:this.animObj.ao} );
        }
    }

});

EntityAnimPlay = ig.Entity.extend
({
    // entity vars
    gravityFactor:0,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,
    animSheet: null,

    // AnimPlay vars
    animObj:null,
    animEntity:null,
    animActions:null,
    animActionIndex:0,

    init: function( x, y, settings )
    {
        this.parent( x, y, settings );

        this.animEntity = Util.getProperty(settings['ae'], null);

        if(Util.defined(settings['ao']))
        {
            this.animObj = settings['ao'];
            Util.loadEntityAnimations(this, settings.ao);
            if(Util.getProperty(settings['flip'], false))
            {
                this.pos.x -= this.animSheet.width;
                this.currentAnim.flip.x = true;
            }

            // TODO/Note: Assumes there is only 1 animation to play (probably okay... )
            if(Util.isArray(this.animObj.a) && this.animObj.a.length > 0 && Util.defined(this.animObj.a[0]['actseq']))
            {
                this.animActions = Util.getProperty(this.animObj.a[0].actseq);
            }
        }
        else
        {
            Util.lge(this, 'EntityAnim: no animObject property found')
        }
    },

    update: function()
    {
        this.parent();

        // look for the next action frame (may have multiple)
        while(this.animActionIndex < this.animActions.length)
        {
            if(this.animActions[this.animActionIndex].f <= this.currentAnim.frame)
            {
                var action = this.animActions[this.animActionIndex];
                var entity = this.animEntity.getEntity(action.e);
                if(Util.defined(entity))
                {
                    if(Util.isFunction(entity['animAction']))
                    {
                        //call the animAction(key, val) on the given entity
                        entity.animAction.apply(entity, [Util.getProperty(action['k'], null), Util.getProperty(action['v'], null)]);
                    }
                    else
                    {
                        Util.lge(entity, 'animAction is not a function of this type')
                    }
                }
                this.animActionIndex++;
            }
            else
            {
                break;
            }
        }

        if(this.currentAnim.loopCount > 0)
        {
            this.kill();
            // TODO: if there are multiple animations this will be invalid
            this.animEntity.kill();
        }
    }
});

});