let speedlimit = 15; //speedlimit of ball
let level = 1 //the current level
let ghost_speed = 30;
let can_teleport = true;
setLevel(1);
//adding events listeners for collision
window.addEventListener("ball_goal_collision", function(evt) {
    if (!is_lose) {
        is_won = true;
        if (cellsHorizontal >= 20 || cellsVertical >= 20) {
            document.querySelector("#next").remove();
        }
        if (is_autoplay_on) {
            autoplayOff();
        }
        try {
            ghostplayOff();
        } catch (err) {

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
}, false);

window.addEventListener("ball_ghost_collision", function(evt) {
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
}, false);

window.addEventListener("clone_ghost_collision", function(evt) {
    if (is_clone_mode_on) {
        cloneModeOff();

    }
}, false);


//creating the render object on the body tag of HTML file with dimensions
render = Render.create({
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
//starting the maze generation algorithm by calling this function
stepThroughCell(startRow, startColumn);

//calling the function to creat the maze according to array's data
createMaze();

World.add(world, goal); //adding the goal to the world
World.add(world, ball); //adding the ball to the world
World.add(world, ghost); //adding the ghost to the world
addControlsToObject(ball); //adding the controls on ball

let cheatGrid;
let lVerticals;
let lHorizontals;

let is_win = 0;

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
let is_autoplay_done = 0;
let is_clone_mode_done = 0;
let is_autoplay_on = 0;
let is_clone_mode_on = 0;
let auto_play_id;
let clone_mode_id;
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
const cloneModeOn = (object) => {
    is_clone_mode_on = 1;
    // document.querySelector('#autoplayon').classList.add('hidden');
    // document.querySelector('#autoplayoff').classList.remove('hidden');

    let timer = is_in_phone_mode ? 100 : 1;
    is_clone_mode_done = 0;
    let clone_final_row = randomIntFromInterval(0, cellsVertical - 1);
    let clone_final_column = randomIntFromInterval(0, cellsHorizontal - 1);
    console.log('clone final row: ' + clone_final_row + ' ,clone final columns ' + clone_final_column);
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
            console.log('clone final row: ' + clone_final_row + ' ,clone final columns ' + clone_final_column);
        }

    }, timer);
}
let ghost_play_id;
const ghostPlayOn = () => {
    document.querySelector('#ghostplayon').classList.add('hidden');
    document.querySelector('#ghostplayoff').classList.remove('hidden');
    World.remove(world, ghost);
    ghostRadius = Math.min(unitLengthX, unitLengthY) * 0.2; //calculating the radius of the ghost so it will always fit in the game
    ghost = Bodies.circle(
        (unitLengthX * cellsHorizontal) - (unitLengthX / 2), //center x-point of the ghost so it will be at top
        unitLengthY / 2,
        ghostRadius, //radius of the ghost
        {
            label: 'ghost', //labeling it as ghost
            render: {
                fillStyle: 'red' //giving it color
            }
        }
    );
    World.add(world, ghost);
    setTimeout(function() {
        let ghostTimer = ghost_speed * 10;
        ghost_play_id = setInterval(function() {
            ghostAutoPlay();
        }, ghostTimer);
    }, 3000);
}
const ghostplayOff = () => {
    document.querySelector('#ghostplayoff').classList.add('hidden');
    document.querySelector('#ghostplayon').classList.remove('hidden');
    clearInterval(ghost_play_id);
    World.remove(world, ghost);
}
const autoplayOff = () => {
    // document.querySelector('#autoplayoff').classList.add('hidden');
    // document.querySelector('#autoplayon').classList.remove('hidden');
    if (is_autoplay_on) {
        is_autoplay_on = 0;
        clearInterval(auto_play_id);
    }
}
const cloneModeOff = () => {
    // document.querySelector('#autoplayoff').classList.add('hidden');
    // document.querySelector('#autoplayon').classList.remove('hidden');
    if (is_clone_mode_on) {
        is_clone_mode_on = 0;
        clearInterval(clone_mode_id);
        World.remove(world, clone);
    }
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
let off = [];
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



const ghostAutoPlay = () => {
        ghostPlayVisitedGrid = Array(cellsVertical)
            .fill(null)
            .map(() => Array(cellsHorizontal).fill(false));

        ghostPlayPathGrid = Array(cellsVertical)
            .fill(null)
            .map(() => Array(cellsHorizontal).fill(false));
        let object_to_catch = ball;
        if (is_clone_mode_on) {
            object_to_catch = clone;
        }
        autoSolve(
            getRow(ghost), //starting row
            getColumn(ghost), //starting column
            getRow(object_to_catch), //finishing row
            getColumn(object_to_catch), //finishing columns
            ghostPlayVisitedGrid, //array to keep track of visited nodes
            ghostPlayPathGrid, //array to store the final path
            0, //boll to show is task done
        );
        ghostPlayPathGrid[getRow(ghost)][getColumn(ghost)] = true;

        autoMoveObject(ghost, ghostPlayPathGrid, [getRow(object_to_catch), getColumn(object_to_catch)]);
    }
    //function to autocomplete the game
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


const restart = () => {
    window.location.reload();
}


const specialAbility = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const character = urlParams.get('character');
    if (is_won) {
        return 0;
    }

    switch (character) {
        case 'sasuke':
            teleportObject(ball);
            break;
        case 'neji':
            // var audio = loadSound("byakugan.mp3");
            var audio_1 = new Audio("byakugan.mp3");
            audio_1.play();
            cheatOn();
            break;
        case 'rock_lee':
            autoplayOn();
            break;
        case 'obito':
            makeObjectTransparent(ball);
            break;
        case 'naurto':
            if (!is_clone_mode_on) {
                clone = makeClone(ball);
                World.add(world, clone);
                cloneModeOn(clone);
            }

            break;

        default:
            break;
    }
}
let special_ability_count_left = 3;
let special_ability_wait_time = 2000;
let is_special_ability_in_use = 0;
const useSpecialAbility = () => {
    if (special_ability_count_left <= 0) {
        document.querySelector('#special').classList.add('hidden');
        return 0;
    }
    if (!is_special_ability_in_use) {
        document.querySelector('#special').classList.add('hidden');
        special_ability_count_left = special_ability_count_left - 1;
        is_special_ability_in_use = 1;
        specialAbility();
        setTimeout(function() {
            document.querySelector('#special').classList.remove('hidden');
            is_special_ability_in_use = 0;
        }, special_ability_wait_time);
    }

}
ghostPlayOn();