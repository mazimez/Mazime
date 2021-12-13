//initializing the constants and engine from the matter libarary
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;
const engine = Engine.create(); //creating the engine for all the matter to work
engine.world.gravity.y = 0; //setting the gravity to 0 so everything doesn't fall down
const { world } = engine; //getting the world variable from the engine


const width = window.innerWidth - 5; //the actual width of the part where matter will render it's engine
const height = window.innerHeight - 5; //the actual height of the part where matter will render it's engine

//creating the render object on the body tag of HTML file with dimensions
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render); //start the rendering to show the world in HTML file
Runner.run(Runner.create(), engine); //attaching the engine with rendered world
