let cellsWidth = 10;  //the thickness of the lines
let cellsHorizontal = 5; //amount of columns at start
let cellsVertical = 5; //amount of rows at start
let unitLengthX = width / cellsHorizontal; //calculating the width of one cell(section or box)
let unitLengthY = height / cellsVertical; //calculating the height of one cell(section or box)
let is_in_phone_mode = 0;

//creating the array of the walls(rectangles) that cover the world
// Bodies.rectangle(
//     "x-position of this object",
//     "y-position of this object",
//     "width of this object",
//     "height of this object",
//     "any other options you want to add"
// ),
const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, {
        isStatic: true,
        collisionFilter: {
            category: -1,
            mask: -1,
        }
    }), //upper wall
    Bodies.rectangle(width / 2, height, width, 10, {
        isStatic: true,
        collisionFilter: {
            category: -1,
            mask: -1,
        }
    }), //lower wall
    Bodies.rectangle(0, height / 2, 10, height, {
        isStatic: true,
        collisionFilter: {
            category: -1,
            mask: -1,
        }
    }), //wall at left side
    Bodies.rectangle(width, height / 2, 10, height, {
        isStatic: true,
        collisionFilter: {
            category: -1,
            mask: -1,
        }
    }), //wall at right side
];
World.add(world, walls); //adding the wall array to world so it shows on HTML file


//maze generation

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


//randomly selecting one cell to start generating maze
let startRow = Math.floor(Math.random() * cellsVertical);
let startColumn = Math.floor(Math.random() * cellsHorizontal)

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
                    ((rowIndex + 1) * unitLengthY) - 5, //calculation the center y-point of that rectangle
                    unitLengthX + 10, //width of that rectangle will be unit lenght of x(because it's horizontal)
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

//creating the ghost to follow the ball
let ghostRadius = Math.min(unitLengthX, unitLengthY) * 0.2; //calculating the radius of the ghost so it will always fit in the game
let ghost = Bodies.circle(
    (unitLengthX * cellsHorizontal) - (unitLengthX / 2), //center x-point of the ghost so it will be at top
    unitLengthY / 2, //center y-point of the ghost so it will be at top
    ghostRadius, //radius of the ghost
    {
        label: 'ghost', //labeling it as ghost
        render: {
            fillStyle: 'red' //giving it color
        }
    }
);

//function to add the controls on the ball
const addControlsToBall = () => {
    //ball controls (for phone and PC)
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w <= 500 && h <= 800) {
        console.log("phone mode is on");
        is_in_phone_mode = 1;
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
            if (e.code == 'Space') {
                specialAbility();
            }
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
}

//collision condition
let is_won = false;
let is_lose = false;
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const win_labels = ['ball', 'goal'];
        const lose_labels = ['ball', 'ghost'];
        //win condition
        if (win_labels.includes(collision.bodyA.label) && win_labels.includes(collision.bodyB.label)) {
            if (!is_lose) {
                is_won = true;
                if (cellsHorizontal >= 20 || cellsVertical >= 20) {
                    document.querySelector("#next").remove();
                }
                if (is_autoplay_on) {
                    autoplayOff();
                }
                ghostplayOff();
                document.querySelector('.winner').classList.remove('hidden');
                document.addEventListener('keypress', enterEvent);
                // world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                });
            }
        }
        if (lose_labels.includes(collision.bodyA.label) && lose_labels.includes(collision.bodyB.label)) {

            console.log(is_won);
            if (!is_won) {
                is_lose = true;
                if (is_autoplay_on) {
                    autoplayOff();
                }
                // ghostplayOff();
                document.querySelector('.losser').classList.remove('hidden');
                document.addEventListener('keypress', enterEvent);
                // world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false);
                    }
                });
            }

        }
    });
});
function enterEvent(event) {
    if (['Enter', ' '].includes(event.key)) {
        document.removeEventListener('keypress', enterEvent);
        nextLevel();
    }
}


/*useful methods*/
//function to get the number of rows that the given object is in
const getRow = (object) => {
    return (parseInt(object.position.y / unitLengthY));
}
//function to get the number of columns that the given object is in
const getColumn = (object) => {
    return (parseInt(object.position.x / unitLengthX));
}
//function to set the number of rows that the given object is in
const setRow = (object, row) => {
    if (row >= 0 && row < cellsVertical) {
        Body.setPosition(object, { x: object.position.x, y: ((unitLengthY * (row + 1)) - (unitLengthY / 2)) });
    } else {
        throw new Error('out of bound');
    }
}
//function to set the number of columns that the given object is in
const setColumn = (object, column) => {
    if (column >= 0 && column < cellsHorizontal) {
        Body.setPosition(object, { x: ((unitLengthX * (column + 1)) - (unitLengthX / 2)), y: object.position.y });
    } else {
        throw new Error('out of bound');
    }
}
//change position of any object in maze
const changePosition = (object, row, column) => {
    if (column >= 0 && column < cellsHorizontal && row >= 0 && row < cellsVertical) {
        Body.setPosition(object, { x: ((unitLengthX * (column + 1)) - (unitLengthX / 2)), y: ((unitLengthY * (row + 1)) - (unitLengthY / 2)) });
    } else {
        throw new Error('out of bound');
    }
}
