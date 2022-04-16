//declaring the variables to set-up some basic parameter for world
let cellsWidth; //the thickness of the lines
let cellsHorizontal; //amount of columns at start
let cellsVertical; //amount of rows at start
let unitLengthX; //the width of one cell(section or box)
let unitLengthY; // height of one cell(section or box)
let is_in_phone_mode = 0; //to indicate is game running on phone or not

//declaring variables for maze generation
let grid; //multidimensional array that stores the rows and columns of maze 
let verticals; //multidimensional array that show where to put the vertical wall
let horizontals; //multidimensional array that show where to put the horizontal wall
let startRow; //number of row from which the algorithm starts making the maze and walls
let startColumn; //number of columns from which the algorithm starts making the maze and walls

//declaring variables to show the state of game (win, lose, any collision events etc..)
let is_won; //is the user playing in this device won?
let is_lose; //is the user playing in this device lose?
let ball_goal_collision_evt; //event for the ball and goal collide
let ball_ghost_collision_evt; //event for the ball and ghost collide
let clone_ghost_collision_evt; //event for the clone and ghost collide
let make_object_transparent_evt; //event for the object becoming transparent
let remove_transparency_evt; //event for the object's transparency removed
let make_clone_evt; //event for the object's clone creation;
let remove_clone_evt; //event for the object's clone removal;

//declaring variables for clone mode
let is_clone_mode_on;
let is_clone_mode_done;
let clone_mode_id;
let clone;

//creating the array of the walls(rectangles) that cover the world
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
            if (direction === 'left') { //checking the direction to make sure which wall to remove
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
    horizontals.forEach((row, rowIndex, ) => {
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
                        label: 'wall', //labeling the rectangle as wall
                        isStatic: true, //making the wall static so it does't get effected by gravity
                        render: {
                            fillStyle: 'white' //giving the color to wall
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



//function to add the controls on the object
const addControlsToObject = (object) => {
    //object controls (for phone and PC)
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (w <= 500 && h <= 800) {
        console.log("phone mode is on");
        is_in_phone_mode = 1;
        let acl = new Accelerometer({ frequency: 60 });
        acl.start();
        setInterval(function() {
            const { x, y } = object.velocity;
            let speedx = Math.ceil(acl.x);
            let speedy = Math.ceil(acl.y);
            let rate = 0.7;
            //up
            if (speedy <= -1) {
                if (y < -speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x, y: y - (Math.abs(speedy) * rate) });
                }
            }
            //down
            if (speedy > 1) {
                if (y > speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x, y: y + (Math.abs(speedy) * rate) });
                }
            }
            //left
            if (speedx > 1) {
                if (x < -speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x: x - (Math.abs(speedx) * rate), y });
                }
            }
            //right
            if (speedx < -1) {
                if (x > speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x: x + (Math.abs(speedx) * rate), y });
                }
            }

        }, 100);
    } else {
        console.log("PC mode is on");
        var keyState = {};
        document.addEventListener('keydown', function(e) {
            keyState[e.key] = true;
            if (e.code == 'Space') {
                useSpecialAbility();
            }
        });
        document.addEventListener('keyup', function(e) {
            keyState[e.key] = false;
        });
        setInterval(function() {
            const { x, y } = object.velocity;
            if (keyState['w'] || keyState['ArrowUp']) {
                if (y < -speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x, y: y - 3 });
                }
            }
            if (keyState['s'] || keyState['ArrowDown']) {
                if (y > speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x, y: y + 3 });
                }
            }
            if (keyState['a'] || keyState['ArrowLeft']) {
                if (x < -speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x: x - 3, y });
                }
            }
            if (keyState['d'] || keyState['ArrowRight']) {
                if (x > speedlimit) {
                    //
                } else {
                    Body.setVelocity(object, { x: x + 3, y });
                }
            }
        }, 100);
    }
}

//collision condition && events
is_won = false;
is_lose = false;
ball_goal_collision_evt = new CustomEvent("ball_goal_collision");
ball_ghost_collision_evt = new CustomEvent("ball_ghost_collision");
ball_clone_ghost_collision_evt = new CustomEvent("ball_clone_ghost_collision");
ghost_clone_ball_collision_evt = new CustomEvent("ghost_clone_ball_collision");
ghost_clone_ball_clone_collision_evt = new CustomEvent("ghost_clone_ball_clone_collision");
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const ball_goal_labels = ['ball', 'goal'];
        const ball_ghost_labels = ['ball', 'ghost'];
        const ball_clone_ghost_labels = ['ball_clone', 'ghost'];
        const ghost_clone_ball_labels = ['ghost_clone', 'ball'];
        const ghost_clone_ball_clone_labels = ['ghost_clone', 'ball_clone'];
        if (ball_goal_labels.includes(collision.bodyA.label) && ball_goal_labels.includes(collision.bodyB.label)) {
            window.dispatchEvent(ball_goal_collision_evt);
        }
        if (ball_ghost_labels.includes(collision.bodyA.label) && ball_ghost_labels.includes(collision.bodyB.label)) {
            window.dispatchEvent(ball_ghost_collision_evt)
        }
        if (ball_clone_ghost_labels.includes(collision.bodyA.label) && ball_clone_ghost_labels.includes(collision.bodyB.label)) {
            window.dispatchEvent(ball_clone_ghost_collision_evt)
        }
        if (ghost_clone_ball_labels.includes(collision.bodyA.label) && ghost_clone_ball_labels.includes(collision.bodyB.label)) {
            window.dispatchEvent(ghost_clone_ball_collision_evt)
        }
        if (ghost_clone_ball_clone_labels.includes(collision.bodyA.label) && ghost_clone_ball_clone_labels.includes(collision.bodyB.label)) {
            window.dispatchEvent(ghost_clone_ball_clone_collision_evt)
        }
    });
});

//TODO::check if we need this method or not
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


//method to teleport he object to random place in maze
const teleportObject = (object) => {
    row = randomIntFromInterval(0, cellsVertical - 1);
    column = randomIntFromInterval(0, cellsHorizontal - 1);
    // var audio = new Audio("assets/audio/teleportation.mp3");
    // audio.play();
    changePosition(object, row, column);
}


//method to make the object transparent
make_object_transparent_evt = new CustomEvent("make_object_transparent");
remove_transparency_evt = new CustomEvent("remove_transparency");
const makeObjectTransparent = (object) => {
    let color = object.render.fillStyle;
    let category = object.collisionFilter.category;
    let mask = object.collisionFilter.mask;
    object.render.fillStyle = 'white';
    window.dispatchEvent(make_object_transparent_evt);
    object.collisionFilter = {
        'category': 2,
        'mask': 2,
    };
    setTimeout(function() {
        window.dispatchEvent(remove_transparency_evt);
        object.render.fillStyle = color;
        object.collisionFilter.category = category;
        object.collisionFilter.mask = mask;
    }, 500);
}

//method to give the solved path-arrays from 1 place in maze to another place
const autoSolve = (row, column, finishRow, finishColumn, visitedGrid, pathGrid, is_done) => {

    //check if node we are on is already in array path or we reach to goal
    if (visitedGrid[finishRow][finishColumn]) {
        if (!is_done) {
            is_done = 1;
            return 0;
        }
        return 0;
    }
    if (visitedGrid[row][column]) {
        return 0;
    }
    //making node visited to puch in array soon
    visitedGrid[row][column] = true;


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
        if (visitedGrid[nextRow][nextColumn]) {
            continue;
        }

        //chek if there is wall between 2 node
        if (direction === 'up') {
            if (horizontals[row - 1][column]) {
                pathGrid[row - 1][column] = true;
            } else {
                continue;
            }
        }
        if (direction === 'down') {
            if (horizontals[row][column]) {
                pathGrid[row + 1][column] = true;
            } else {
                continue;
            }
        }
        if (direction === 'left') {
            if (verticals[row][column - 1]) {
                pathGrid[row][column - 1] = true;
            } else {
                continue;
            }
        }
        if (direction === 'right') {
            if (verticals[row][column]) {
                pathGrid[row][column + 1] = true;
            } else {
                continue;
            }
        }
        should_stay = autoSolve(nextRow, nextColumn, finishRow, finishColumn, visitedGrid, pathGrid, is_done);
        if (pathGrid[finishRow][finishColumn] && should_stay) {

        } else {
            if (direction === 'up') {
                if (horizontals[row - 1][column]) {
                    pathGrid[row - 1][column] = false;
                }
            }
            if (direction === 'down') {
                if (horizontals[row][column]) {
                    pathGrid[row + 1][column] = false;
                }
            }
            if (direction === 'left') {
                if (verticals[row][column - 1]) {
                    pathGrid[row][column - 1] = false;
                }
            }
            if (direction === 'right') {
                if (verticals[row][column]) {
                    pathGrid[row][column + 1] = false;
                }
            }
        }
    }
    return 1;
}

//method to move the object automatically just by given the path-arrays
const autoMoveObject = (object, pathGrid, target, speed = 3) => {
    let targetRow = target[0];
    let targetColumn = target[1];
    if (getRow(object) == targetRow && getColumn(object) == targetColumn) {
        return 1;
    }
    objectVisitedGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    let row, column;
    let is_target_reached = 0;
    let neighbors;
    let interval = 0;
    while (!is_target_reached && interval < 10) {
        let { x, y } = object.velocity;
        row = getRow(object);
        column = getColumn(object);
        objectVisitedGrid[row, column] = true;

        //assemble list of neighbour
        neighbors = shuffle([
            [row - 1, column, 'up'],
            [row, column + 1, 'right'],
            [row + 1, column, 'down'],
            [row, column - 1, 'left']
        ]);

        //for each neighbour
        for (let neighbor of neighbors) {
            interval++;
            //see if neigbour is out of bounds
            const [nextRow, nextColumn, direction] = neighbor;
            if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
                continue;
            }

            //if we visited neigbour, contunie checking
            if (objectVisitedGrid[nextRow][nextColumn]) {
                continue;
            }

            //check in path grid that should we go to that neighbor
            if (!pathGrid[nextRow][nextColumn]) {
                continue;
            }

            //check if there is wall between 2 node
            if (direction === 'up') {
                if (horizontals[row - 1][column]) {
                    if (y < -speedlimit) {
                        //
                    } else {
                        Body.setVelocity(object, { x, y: y - speed });
                    }
                } else {
                    continue;
                }
            }
            if (direction === 'down') {
                if (horizontals[row][column]) {
                    if (y > speedlimit) {
                        //
                    } else {
                        Body.setVelocity(object, { x, y: y + speed });
                    }
                } else {
                    continue;
                }
            }
            if (direction === 'left') {
                if (verticals[row][column - 1]) {
                    if (x < -speedlimit) {
                        //
                    } else {
                        Body.setVelocity(object, { x: x - speed, y });
                    }
                } else {
                    continue;
                }
            }
            if (direction === 'right') {
                if (verticals[row][column]) {
                    if (x > speedlimit) {
                        //
                    } else {
                        Body.setVelocity(object, { x: x + speed, y });
                    }
                } else {
                    continue;
                }
            }
            row = getRow(object);
            column = getColumn(object);
            if (row == targetRow && column == targetColumn) {
                is_target_reached = 1;
            }
        }
    }
    return is_target_reached;
}

//method that makes 1 object follow
const followObject = (object, object_to_follow) => {
    let followVisitedGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    let followPathGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    let is_follow_done = 0;
    autoSolve(
        getRow(object), //starting row
        getColumn(object), //starting column
        getRow(object_to_follow), //finishing row
        getColumn(object_to_follow), //finishing columns
        followVisitedGrid, //array to keep track of visited nodes
        followPathGrid, //array to store the final path
        is_follow_done, //boll to show is task done
    );
    followPathGrid[getRow(object)][getColumn(object)] = true;
    autoMoveObject(object, followPathGrid, [getRow(object_to_follow), getColumn(object_to_follow)]);
}

//method to path from 1 place of maze to another
const showPath = (startRow, startColumn, endRow, endColumn) => {
    let is_solved = 0;
    let cheatGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
    let lVerticals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(true));
    let lHorizontals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(true));
    solvePath(startRow, startColumn, endRow, endColumn, cheatGrid, lVerticals, lHorizontals, is_solved);
    lHorizontals.forEach((row, rowIndex) => {
        row.forEach((open, columnIndex) => {
            if (open) {
                return;
            }
            const line = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + (unitLengthY / 2),
                unitLengthX,
                3, {
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
                unitLengthY, {
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

//method to hide the path created from showPath
const hidePath = () => {
    let off = [];
    world.bodies.forEach(body => {
        if (body.label === 'line') {
            off.push(body);
        }
    });
    off.forEach((body) => {
        World.remove(world, body);
    });
}

//method to solve the path for showPath method
const solvePath = (startRow, startColumn, endRow, endColumn, cheatGrid, lVerticals, lHorizontals, is_solved) => {
    //check if node we are on is already in array path or we reach to goal
    if (cheatGrid[endRow][endColumn]) {
        if (is_solved) {
            is_solved = 1;
            return 1;
        }
    }
    if (cheatGrid[startRow][startColumn] || cheatGrid[endRow][endColumn]) {
        return 0;
    }

    //making node visited to put in array soon
    cheatGrid[startRow][startColumn] = true;

    //assemble list of neighbor
    const neighbors = shuffle([
        [startRow - 1, startColumn, 'up'],
        [startRow, startColumn + 1, 'right'],
        [startRow + 1, startColumn, 'down'],
        [startRow, startColumn - 1, 'left']
    ]);

    //for each neighbor
    for (let neighbor of neighbors) {
        //see if neigbour is out of bounds
        const [nextRow, nextColumn, direction] = neighbor;
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }

        //if we visited neigbour, contuse checking
        if (cheatGrid[nextRow][nextColumn]) {
            continue;
        }

        //check if there is wall between 2 node
        if (direction === 'up') {
            if (horizontals[startRow - 1][startColumn]) {
                lVerticals[startRow - 1][startColumn] = false;
            } else {
                continue;
            }
        }
        if (direction === 'down') {
            if (horizontals[startRow][startColumn]) {
                lVerticals[startRow][startColumn] = false;
            } else {
                continue;
            }
        }
        if (direction === 'left') {
            if (verticals[startRow][startColumn - 1]) {
                lHorizontals[startRow][startColumn - 1] = false;
            } else {
                continue;
            }
        }
        if (direction === 'right') {
            if (verticals[startRow][startColumn]) {
                lHorizontals[startRow][startColumn] = false;
            } else {
                continue;
            }
        }
        should_stay = solvePath(nextRow, nextColumn, endRow, endColumn, cheatGrid, lVerticals, lHorizontals, is_solved);
        if (cheatGrid[endRow][endColumn] && should_stay) {

        } else {
            if (direction === 'up') {
                if (horizontals[startRow - 1][startColumn]) {
                    lVerticals[startRow - 1][startColumn] = true;
                }
            }
            if (direction === 'down') {
                if (horizontals[startRow][startColumn]) {
                    lVerticals[startRow][startColumn] = true;
                }
            }
            if (direction === 'left') {
                if (verticals[startRow][startColumn - 1]) {
                    lHorizontals[startRow][startColumn - 1] = true;
                }
            }
            if (direction === 'right') {
                if (verticals[startRow][startColumn]) {
                    lHorizontals[startRow][startColumn] = true;
                }
            }
        }
    }
    return 1;
}

//method to make clone of given object and make that clone run randomly
make_clone_evt = new CustomEvent("make_clone");
remove_clone_evt = new CustomEvent("remove_clone");
is_clone_mode_done = 0;
is_clone_mode_on = 0;
const activateClone = (object) => {
    if (is_clone_mode_on) {
        return 0;
    }
    //creating the clone of the given
    let cloneRadius = Math.min(unitLengthX, unitLengthY) * 0.2; //calculating the radius of the clone so it will always fit in the game
    clone = Bodies.circle(
        object.position.x, //setting position of clone to exact position of object
        object.position.y, //setting position of clone to exact position of object
        cloneRadius, //radius of the clone
        {
            label: object.label + '_clone', //labeling clone with object label and _clone
            render: {
                fillStyle: 'white' //giving it color
            }
        }
    );
    window.dispatchEvent(make_clone_evt);
    World.add(world, clone); //adding this clone into world

    is_clone_mode_on = 1;

    let timer = is_in_phone_mode ? 100 : 1;
    is_clone_mode_done = 0;
    let clone_final_row = randomIntFromInterval(0, cellsVertical - 1);
    let clone_final_column = randomIntFromInterval(0, cellsHorizontal - 1);
    clone_mode_id = setInterval(function() {
        if (!is_clone_mode_done) {
            clonePlayVisitedGrid = Array(cellsVertical)
                .fill(null)
                .map(() => Array(cellsHorizontal).fill(false));

            clonePlayPathGrid = Array(cellsVertical)
                .fill(null)
                .map(() => Array(cellsHorizontal).fill(false));
            autoSolve(
                getRow(clone), //starting row
                getColumn(clone), //starting column
                clone_final_row, //finishing row
                clone_final_column, //finishing columns
                clonePlayVisitedGrid, //array to keep track of visited nodes
                clonePlayPathGrid, //array to store the final path
                0, //boll to show is task done
            );
            clonePlayPathGrid[getRow(clone)][getColumn(clone)] = true;
            is_clone_mode_done = autoMoveObject(clone, clonePlayPathGrid, [clone_final_row, clone_final_column], 0.03);
        } else {
            is_clone_mode_done = 0;
            clone_final_row = randomIntFromInterval(0, cellsVertical - 2);
            clone_final_column = randomIntFromInterval(0, cellsHorizontal - 2);
        }

    }, timer);

}

//method to remove clone from the world
const deactivateClone = () => {
    if (is_clone_mode_on) {
        is_clone_mode_on = 0;
        clearInterval(clone_mode_id);
        World.remove(world, clone);
        window.dispatchEvent(remove_clone_evt);
    }
}