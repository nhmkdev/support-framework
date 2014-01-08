/*
 The first data include to initialize any high level data
 */

ig.module(
    'data.init'
)
.requires(
    'impact.game',
    'support.util'
)
.defines(function(){
 var Support = ig.global.support;
 var Util = Support.util;
 Util.createNestedObject(ig.global, 'data');
});
