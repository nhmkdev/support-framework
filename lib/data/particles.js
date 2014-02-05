/*
 Particle data for use with the Support Framework Particle
 */

ig.module(
    'data.particles'
)
.requires(
    'impact.game',
    'impact.font',
    'support.util',
    'data.init'
)
.defines(function(){

var Particles = {};
ig.global.data.particles = Particles;

Particles.sample =
{
    // Note: many of the parameters are intended to be supplied by the code producing the particle
    n:{min:6, max:12}, // number of particles
    l:{min:0.75, max: 2}, // lifetime of particles
    vx: {min:20, max:100}, // velocity x
    vy: {min:-75, max:150}, // velocity y

    g:1, //gravity factor (default: 1)
    i:'particles', // image name ('media/' is prepended, '.png' is appended)
    w:2, // width of frame
    h:2, // height of frame
    f:{x:100, y: 0}, // fricton (default: {x:0, y:0})
    b:0, // bounciness
    fr: {min:0, max:1} // frames of the image to include (default is all) -- max is not included! (array indexing)
}

Particles.single =
{
    // Note: many of the parameters are intended to be supplied by the code producing the particle
    // n/l/vx/vy support a range for min/max randomness and a constant
    n:1, // number of particles
    l:3, // lifetime of particles
    vx:0, // velocity x
    vy:0, // velocity y

    g:0, //gravity factor (default: 1)
    i:'particles', // image name ('media/' is prepended, '.png' is appended)
    w:1, // width of frame
    h:1, // height of frame
    b:0, // bounciness
    fr: {min:0, max:1} // frames of the image to include (default is all) -- max is not included!
}

});