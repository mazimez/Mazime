let speedlimit = 15; //speedlimit of ball

//variables related to player
let ballRadius;
let ball;

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