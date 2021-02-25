const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth - 5;
const height = window.innerHeight - 5;
let cells = 10;
let cellsHorizontal = 5;
let cellsVertical = 5;
let speedlimit = 15;
//const unitLength = width/cells;
let unitLengthX = width / cellsHorizontal;
let unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);


//walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 10, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 10, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 10, height, { isStatic: true }),
];
World.add(world, walls);

//maze generation

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
let grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

let verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

let horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

let startRow = Math.floor(Math.random() * cellsVertical);
let startColumn = Math.floor(Math.random() * cellsHorizontal)

const stepThroughCell = (row, column) => {
    //if visited => return
    if (grid[row][column]) {
        return;
    }

    //mark cell as visited
    grid[row][column] = true;

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
        if (grid[nextRow][nextColumn]) {
            continue;
        }

        //remove wall
        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        }
        if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        //visit next cell=> call again
        stepThroughCell(nextRow, nextColumn);
    }
};

stepThroughCell(startRow, startColumn);

const createMaze = () => {
    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + (unitLengthX / 2),
                (rowIndex + 1) * unitLengthY,
                unitLengthX,
                cells,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'white'
                    }
                }
            );
            World.add(world, wall);
        })
    });

    verticals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
            const wall = Bodies.rectangle(
                (columnIndex + 1) * unitLengthX,
                rowIndex * unitLengthY + (unitLengthY / 2),
                cells,
                unitLengthY,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle: 'white'
                    }
                }
            );
            World.add(world, wall);
        })
    });

}
createMaze();
//goal
let goal = Bodies.rectangle(
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

//ball
let ballRadius = Math.min(unitLengthX, unitLengthY) * 0.2;
let ball = Bodies.circle(
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
document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;
    if (event.key === 'w' || event.key === 'ArrowUp') {
        if (y < -speedlimit) {
            //
        } else {
            Body.setVelocity(ball, { x, y: y - 3 });
        }
    }
    if (event.key === 's' || event.key === 'ArrowDown') {
        if (y > speedlimit) {
            //
        } else {
            Body.setVelocity(ball, { x, y: y + 3 });
        }
    }
    if (event.key === 'a' || event.key === 'ArrowLeft') {
        if (x < -speedlimit) {
            //
        } else {
            Body.setVelocity(ball, { x: x - 3, y });
        }
    }
    if (event.key === 'd' || event.key === 'ArrowRight') {
        if (x > speedlimit) {
            //
        } else {
            Body.setVelocity(ball, { x: x + 3, y });
        }
    }

})

//win condition
let out = [];
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            if (cellsHorizontal >= 20 || cellsVertical >= 20) {
                document.querySelector("#next").remove();
            }
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                    out.push(body);
                }
            });
        }
    });
});

//next Level
const nextLevel = () => {

    //removing the win tag
    document.querySelector('.winner').classList.add('hidden');

    //removing the old maze
    out.forEach((body) => {
        World.remove(world, body);
    });
    World.remove(world, ball);
    World.remove(world, goal);

    cheatOff();

    //updating the data for next level

    engine.world.gravity.y = 0;

    cellsHorizontal = cellsHorizontal + 3;
    cellsVertical = cellsVertical + 3;
    cells = cells - 1;
    speedlimit = speedlimit - 2;

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
}

let cheatGrid;
let lVerticals;
let lHorizontals;

const cheatOn = () => {
    cheatGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
    lVerticals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(true));
    lHorizontals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(true));
    solve(0, 0);
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
    world.bodies.forEach(body => {
        if (body.label === 'line') {
            off.push(body);
        }
    });
    off.forEach((body) => {
        World.remove(world, body);
    });
}


//for phones(accelometer)
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
        if (speedy > 2) {
            if (y > speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x, y: y + (Math.abs(speedy) * rate) });
            }
        }
        //left
        if (speedx > 2) {
            if (x < -speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x: x - (Math.abs(speedx) * rate), y });
            }
        }
        //right
        if (speedx < -2) {
            if (x > speedlimit) {
                //
            } else {
                Body.setVelocity(ball, { x: x + (Math.abs(speedx) * rate), y });
            }
        }

    }, 10);
}