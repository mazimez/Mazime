
//initializing the constants and engine from the matter libarary
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth - 5; //the actual width of the part where matter will render it's engine
const height = window.innerHeight - 5; //the actual height of the part where matter will render it's engine
let cellsWidth = 10;  //the thickness of the lines
let cellsHorizontal = 5; //amount of columns at start
let cellsVertical = 5; //amount of rows at start
let speedlimit = 15; //speedlimit of ball
let unitLengthX = width / cellsHorizontal; //calculating the width of one cell(section or box)
let unitLengthY = height / cellsVertical; //calculating the height of one cell(section or box)
let level = 1 //the current level

const engine = Engine.create(); //creating the engine for all the matter to work
engine.world.gravity.y = 0; //setting the gravity to 0 so everything doesn't fall down
const { world } = engine; //getting the world variable from the engine

//creating the render object on the body tag of HTML file with dimentions
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


//creating the array of the walls(rectangles) that cover the world
// Bodies.rectangle(
//     "x-position of this object",
//     "y-position of this object",
//     "width of this object",
//     "height of this object",
//     "any other options you want to add"
// ),
const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }), //upper wall
    Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }), //lower wall
    Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }), //wall at left side
    Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }), //wall at right side
];
World.add(world, walls); //adding the wall array to world so it shows on HTML file

//maze generation

//function to shuffle the array 
const shuffle = (arr) => {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

//array that store the data of visited/unvisited cells
let grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

//array that stores the data of vertical lines/blocks/rectangles 
let verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));


//array that stores the data of horizontal lines/block/rectangle
let horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

//function to get the number of rows that the given object is in
const getRow = (object) => {
    return (parseInt(object.position.y / unitLengthY));
}
//function to get the number of columns that the given object is in
const getColumn = (object) => {
    return (parseInt(object.position.x / unitLengthX));
}


//function that goes throw each and every cells in maze and also update the arrays
const stepThroughCell = (row, column) => {
    //if cell is already visited, no need to do anything else
    if (grid[row][column]) {
        return;
    } else {
        //if cell is not visited, mark it visited first
        grid[row][column] = true;

        //creat the array of that cell's neighbor cells and shuffle them to randomly go throw each one
        const neighbors = shuffle([
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left']
        ]);

        //go throw each neighbor cell and repeat the process until every cell gets visited
        for (let neighbor of neighbors) {
            //getting the neighbor's row-column-direction to use in algorithm
            const [nextRow, nextColumn, direction] = neighbor;

            //check if neigbour cell is out of bounds (if it is, just skip that cell)     
            if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
                continue;
            }

            //check if this cell is already visited (if it is, just skip that cell)
            if (grid[nextRow][nextColumn]) {
                continue;
            }


            /*
            if cells not out of bound and not visited, 
            then we can remove the wall/block/rectangle between that 2 cells
            */
            if (direction === 'left') {  //checking the direction to make sure which wall to remove
                verticals[row][column - 1] = true;
            } else if (direction === 'right') {
                verticals[row][column] = true;
            }
            if (direction === 'up') {
                horizontals[row - 1][column] = true;
            } else if (direction === 'down') {
                horizontals[row][column] = true;
            }

            //calling that method again to repeat the same process for this cell(neighbor)
            stepThroughCell(nextRow, nextColumn);
        }
    }
};

//randomly selecting one cell to start generating maze
let startRow = Math.floor(Math.random() * cellsVertical);
let startColumn = Math.floor(Math.random() * cellsHorizontal)


//starting the maze generation algorithm by calling this function
stepThroughCell(startRow, startColumn);


//making the function to create the maze with arrays using matter.js
const createMaze = () => {

    /*
    going throw horizontal array to put 
    block/wall/rectangle according to array's data
    */
    horizontals.forEach((row, rowIndex,) => {
        row.forEach((open, columnIndex) => {
            /*
            if the array's value is true, that means there are no wall at that point
            so, we don't need to add wall here, simply return
            */
            if (open) {
                return;
            } else {
                /*
                if the array's value is false, that means there are wall at that point
                so, we need to add wall here, first create that wall(rectangle)
                */
                const wall = Bodies.rectangle(
                    columnIndex * unitLengthX + (unitLengthX / 2), //calculating the center x-point of that rectangle
                    (rowIndex + 1) * unitLengthY, //calculation the center y-point of that rectangle
                    unitLengthX, //width of that rectangle will be unit lenght of x(because it's horizontal)
                    cellsWidth, //height(thickness) of that rectangle 
                    {
                        label: 'wall',  //labeling the rectangle as wall
                        isStatic: true, //making the wall static so it does't get effected by gravity
                        render: {
                            fillStyle: 'white'  //giving the color to wall
                        }
                    }
                );
                World.add(world, wall); //adding the created rectangle into the world
            }
        })
    });

    /*
    going throw verticals array to put 
    block/wall/rectangle according to array's data
    */
    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            /*
            if the array's value is true, that means there are no wall at that point
            so, we don't need to add wall here, simply return
            */
            if (open) {
                return;
            }
            const wall = Bodies.rectangle(
                (columnIndex + 1) * unitLengthX, //calculating the center x-point of that rectangle
                rowIndex * unitLengthY + (unitLengthY / 2), //calculation the center y-point of that rectangle
                cellsWidth, //width(thickness) of that rectangle 
                unitLengthY, //height of that rectangle will be unit lenght of y(because it's vertical)
                {
                    label: 'wall', //labeling the rectangle as wall
                    isStatic: true, //making the wall static so it does't get effected by gravity
                    render: {
                        fillStyle: 'white' //giving the color to wall
                    }
                }
            );
            World.add(world, wall); //adding the created rectangle into the world
        })
    });

}

//calling the function to creat the maze according to array's data
createMaze();


//creating the goal to finish the game
let goal = Bodies.rectangle(
    width - (unitLengthX / 2), //calculating center x-point of the goal so it will be at bottom
    height - (unitLengthY / 2), //calculating center y-point of the goal so it will be at bottom
    unitLengthX * 0.6, //width of the goal block
    unitLengthY * 0.6, //height of the goal block
    {
        isStatic: true, //making it static so gravity doesn't effect it
        label: 'goal', //labeling it as a goal
        render: {
            fillStyle: 'green' //giving it a color
        }
    }
);
World.add(world, goal); //adding the goal to the world

//creating the ball to start the game
let ballRadius = Math.min(unitLengthX, unitLengthY) * 0.2; //calculating the radius of the ball so it will always fit in the game
let ball = Bodies.circle(
    unitLengthX / 2, //center x-point of the ball so it will be at top
    unitLengthY / 2, //center y-point of the ball so it will be at top
    ballRadius, //radius of the ball
    {
        label: 'ball', //labeling it as ball
        render: {
            fillStyle: 'blue' //giving it color
        }
    }
);
World.add(world, ball); //adding the ball to the world

//ball controls (for phone and PC)
var w = window.innerWidth;
var h = window.innerHeight;

if (w <= 500 && h <= 800) {
    console.log("phone mode is on");
    let acl = new Accelerometer({ frequency: 60 });
    acl.start();
    let p = document.getElementById('test');
    setInterval(function () {
        // console.log("Acceleration along the X-axis " + acl.x);
        // p.innerHTML = "the x is " + acl.x + "<br>" + "the y is " + acl.y + "<br>" + "the z is " + acl.z;
        const { x, y } = ball.velocity;
        let speedx = Math.ceil(acl.x);
        let speedy = Math.ceil(acl.y);
        let rate = 0.7;
        //up
        if (speedy <= -1) {
            if (y < -speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x, y: y - (Math.abs(speedy) * rate) });
            }
        }
        //down
        if (speedy > 1) {
            if (y > speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x, y: y + (Math.abs(speedy) * rate) });
            }
        }
        //left
        if (speedx > 1) {
            if (x < -speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x: x - (Math.abs(speedx) * rate), y });
            }
        }
        //right
        if (speedx < -1) {
            if (x > speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x: x + (Math.abs(speedx) * rate), y });
            }
        }

    }, 100);
} else {
    console.log("PC mode is on");
    var keyState = {};
    document.addEventListener('keydown', function (e) {
        keyState[e.key] = true;
    });
    document.addEventListener('keyup', function (e) {
        keyState[e.key] = false;
    });

    setInterval(function () {
        const { x, y } = ball.velocity;
        if (keyState['w'] || keyState['ArrowUp']) {
            if (y < -speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x, y: y - 3 });
            }
        }
        if (keyState['s'] || keyState['ArrowDown']) {
            if (y > speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x, y: y + 3 });
            }
        }
        if (keyState['a'] || keyState['ArrowLeft']) {
            if (x < -speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x: x - 3, y });
            }
        }
        if (keyState['d'] || keyState['ArrowRight']) {
            if (x > speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x: x + 3, y });
            }
        }
    }, 100);
}

//win condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            if (cellsHorizontal >= 20 || cellsVertical >= 20) {
                document.querySelector("#next").remove();
            }
            document.querySelector('.winner').classList.remove('hidden');
            document.addEventListener('keypress', enterEvent);
            // world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    });
});
function enterEvent(event) {
    if (event.key === 'Enter') {
        document.removeEventListener('keypress', enterEvent);
        nextLevel();
    }
}

//next Level
const nextLevel = () => {

    if (level >= 20) {
        console.log("no more level nor now");
    } else {
        let out = [];

        //removing the win tag
        document.querySelector('.winner').classList.add('hidden');

        world.bodies.forEach(body => {
            if (body.label === 'wall') {
                out.push(body);
            }
        });

        //removing the old maze
        out.forEach((body) => {
            World.remove(world, body);
        });
        World.remove(world, ball);
        World.remove(world, goal);

        cheatOff();

        //updating the data for next level

        engine.world.gravity.y = 0;

        cellsHorizontal = cellsHorizontal + 1;
        cellsVertical = cellsVertical + 1;
        if (cellsWidth <= 1) {
            cellsWidth = 1;
        } else {
            cellsWidth = cellsWidth - 1;
        }
        if (speedlimit <= 4) {
            speedlimit = 4;
        } else {
            speedlimit = speedlimit - 1;
        }

        unitLengthX = width / cellsHorizontal;
        unitLengthY = height / cellsVertical;

        grid = Array(cellsVertical)
            .fill(null)
            .map(() => Array(cellsHorizontal).fill(false));

        verticals = Array(cellsVertical)
            .fill(null)
            .map(() => Array(cellsHorizontal - 1).fill(false));

        horizontals = Array(cellsVertical - 1)
            .fill(null)
            .map(() => Array(cellsHorizontal).fill(false));

        startRow = Math.floor(Math.random() * cellsVertical);
        startColumn = Math.floor(Math.random() * cellsHorizontal)

        stepThroughCell(startRow, startColumn);
        createMaze();

        ballRadius = Math.min(unitLengthX, unitLengthY) * 0.2;
        ball = Bodies.circle(
            unitLengthX / 2,
            unitLengthY / 2,
            ballRadius,
            {
                label: 'ball',
                render: {
                    fillStyle: 'blue'
                }
            }
        );
        World.add(world, ball);

        goal = Bodies.rectangle(
            width - (unitLengthX / 2),
            height - (unitLengthY / 2),
            unitLengthX * 0.6,
            unitLengthY * 0.6,
            {
                isStatic: true,
                label: 'goal',
                render: {
                    fillStyle: 'green'
                }
            }
        );
        World.add(world, goal);
        level++;
    }
}

let cheatGrid;
let lVerticals;
let lHorizontals;

const cheatOn = () => {
    document.querySelector('#cheaton').classList.add('hidden');
    document.querySelector('#cheatoff').classList.remove('hidden');

    cheatGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
    lVerticals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(true));
    lHorizontals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(true));
    solve(getRow(ball), getColumn(ball));
    createLine();
}
const createLine = () => {
    lHorizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
            const line = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + (unitLengthY / 2),
                unitLengthX,
                3,
                {
                    label: 'line',
                    isStatic: true,
                    render: {
                        fillStyle: 'green'
                    },
                    collisionFilter: {
                        group: -1,
                        category: 2,
                        mask: 0
                    }
                }
            );
            World.add(world, line);
        })
    });

    lVerticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
            const line = Bodies.rectangle(
                columnIndex * unitLengthX + (unitLengthX / 2),
                rowIndex * unitLengthY + unitLengthY,
                3,
                unitLengthY,
                {
                    label: 'line',
                    isStatic: true,
                    render: {
                        fillStyle: 'green'
                    },
                    collisionFilter: {
                        group: -1,
                        category: 2,
                        mask: 0
                    }
                }
            );
            World.add(world, line);
        })
    })

}
const solve = (row, column) => {
    //check if node we are on is already in array path or we reach to goal
    if (cheatGrid[row][column] || cheatGrid[cellsHorizontal - 1][cellsVertical - 1]) {
        return;
    }

    //making node visited to puch in array soon
    cheatGrid[row][column] = true;

    //assemble list of neighbour
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    //for each neighbour
    for (let neighbor of neighbors) {
        //see if neigbour is out of bounds
        const [nextRow, nextColumn, direction] = neighbor;
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }

        //if we visited neigbour, contunie checking
        if (cheatGrid[nextRow][nextColumn]) {
            continue;
        }

        //chek if there is wall between 2 node
        if (direction === 'up') {
            if (horizontals[row - 1][column]) {
                lVerticals[row - 1][column] = false;
            } else {
                continue;
            }
        }
        if (direction === 'down') {
            if (horizontals[row][column]) {
                lVerticals[row][column] = false;
            } else {
                continue;
            }
        }
        if (direction === 'left') {
            if (verticals[row][column - 1]) {
                lHorizontals[row][column - 1] = false;
            } else {
                continue;
            }
        }
        if (direction === 'right') {
            if (verticals[row][column]) {
                lHorizontals[row][column] = false;
            } else {
                continue;
            }
        }
        solve(nextRow, nextColumn);
        if (cheatGrid[cellsHorizontal - 1][cellsVertical - 1]) {

        } else {
            if (direction === 'up') {
                if (horizontals[row - 1][column]) {
                    lVerticals[row - 1][column] = true;
                }
            }
            if (direction === 'down') {
                if (horizontals[row][column]) {
                    lVerticals[row][column] = true;
                }
            }
            if (direction === 'left') {
                if (verticals[row][column - 1]) {
                    lHorizontals[row][column - 1] = true;
                }
            }
            if (direction === 'right') {
                if (verticals[row][column]) {
                    lHorizontals[row][column] = true;
                }
            }
        }


    }
}
let off = [];
const cheatOff = () => {
    document.querySelector('#cheaton').classList.remove('hidden');
    document.querySelector('#cheatoff').classList.add('hidden');
    world.bodies.forEach(body => {
        if (body.label === 'line') {
            off.push(body);
        }
    });
    off.forEach((body) => {
        World.remove(world, body);
    });
}


