let speedlimit = 15; //speedlimit of ball


//variables related to player's clone
let is_clone_mode_done = 0;
let is_clone_mode_on = 0;
let clone_mode_id;
let clone;

//variables related to player
let ballRadius;
let ball;

//variable for player's cheat mode
let cheatGrid;
let lVerticals;
let lHorizontals;
let is_win = 0;
let off = [];

//variable for player's autoplay mode
let is_autoplay_done = 0;
let is_autoplay_on = 0;
let auto_play_id;

//method to create the object of player
const createPlayerObject = () => {
    ballRadius = Math.min(unitLengthX, unitLengthY) * 0.2; //calculating the radius of the ball so it will always fit in the game
    ball = Bodies.circle(
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
}

//method to turn the cheat mode on
const cheatOn = () => {
    // document.querySelector('#cheaton').classList.add('hidden');
    // document.querySelector('#cheatoff').classList.remove('hidden');

    is_win = 0;
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

//method to solve the cheat-mode path
const solve = (row, column) => {
    //check if node we are on is already in array path or we reach to goal
    if (cheatGrid[cellsHorizontal - 1][cellsVertical - 1]) {
        if (is_win) {
            is_win = 1;
            return 1;
        }
    }
    if (cheatGrid[row][column] || cheatGrid[cellsHorizontal - 1][cellsVertical - 1]) {
        return 0;
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
        should_stay = solve(nextRow, nextColumn);
        if (cheatGrid[cellsHorizontal - 1][cellsVertical - 1] && should_stay) {

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
    return 1;
}

//method to create the line for player's cheat mode
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

//method to turn the cheat mode off
const cheatOff = () => {
    // document.querySelector('#cheaton').classList.remove('hidden');
    // document.querySelector('#cheatoff').classList.add('hidden');
    world.bodies.forEach(body => {
        if (body.label === 'line') {
            off.push(body);
        }
    });
    off.forEach((body) => {
        World.remove(world, body);
    });
}



//method to turn the auto play mode on
const autoplayOn = () => {
    is_autoplay_on = 1;
    // document.querySelector('#autoplayon').classList.add('hidden');
    // document.querySelector('#autoplayoff').classList.remove('hidden');

    let timer = is_in_phone_mode ? 100 : 1;
    is_autoplay_done = 0;
    auto_play_id = setInterval(function() {
        autoPlay();
    }, timer);
}

//function to autocomplete the game for player
const autoPlay = () => {
    is_autoplay_done = 0;
    autoPlayVisitedGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    autoPlayPathGrid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
    autoSolve(
        getRow(ball), //starting row
        getColumn(ball), //starting column
        cellsHorizontal - 1, //finishing row
        cellsVertical - 1, //finishing columns
        autoPlayVisitedGrid, //array to keep track of visited nodes
        autoPlayPathGrid, //array to store the final path
        is_autoplay_done, //boll to show is task done
    );
    autoPlayPathGrid[getRow(ball)][getColumn(ball)] = true;

    autoMoveObject(ball, autoPlayPathGrid, [cellsHorizontal - 1, cellsVertical - 1]);
}

//method to turn the autoplay mode off
const autoplayOff = () => {
    // document.querySelector('#autoplayoff').classList.add('hidden');
    // document.querySelector('#autoplayon').classList.remove('hidden');
    if (is_autoplay_on) {
        is_autoplay_on = 0;
        clearInterval(auto_play_id);
    }
}



//method to make the clone run on random path
const cloneModeOn = (object) => {
    is_clone_mode_on = 1;
    // document.querySelector('#autoplayon').classList.add('hidden');
    // document.querySelector('#autoplayoff').classList.remove('hidden');

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
            is_clone_mode_done = autoMoveObject(clone, clonePlayPathGrid, [clone_final_row, clone_final_column], 0.1);
        } else {
            is_clone_mode_done = 0;
            clone_final_row = randomIntFromInterval(0, cellsVertical - 2);
            clone_final_column = randomIntFromInterval(0, cellsHorizontal - 2);
        }

    }, timer);
}

//method to stop the clone from running on random path and remove it from world
const cloneModeOff = () => {
    // document.querySelector('#autoplayoff').classList.add('hidden');
    // document.querySelector('#autoplayon').classList.remove('hidden');
    if (is_clone_mode_on) {
        is_clone_mode_on = 0;
        clearInterval(clone_mode_id);
        World.remove(world, clone);
        window.dispatchEvent(remove_clone_evt);
    }
}