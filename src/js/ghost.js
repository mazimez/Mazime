let ghost; //the variable to store the object label as ghost
let ghostRadius; //radius of ghost
let ghost_speed = 30; //speed limit of ghost
let ghost_play_id;

//method to create the object of ghost
const createGhostObject = () => {
    ghostRadius = Math.min(unitLengthX, unitLengthY) * 0.2; //calculating the radius of the ghost so it will always fit in the game
    ghost = Bodies.circle(
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
}

//method to turn on the ghost play
const ghostPlayOn = () => {
    if (document.querySelector('#ghostplayon')) {
        document.querySelector('#ghostplayon').classList.add('hidden');
        document.querySelector('#ghostplayoff').classList.remove('hidden');
    }

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
    setTimeout(function () {
        let ghostTimer = ghost_speed * 10;
        ghost_play_id = setInterval(function () {
            ghostAutoPlay();
        }, ghostTimer);
    }, 3000);
}

//method to turn off the ghost play
const ghostplayOff = () => {
    if (document.querySelector('#ghostplayon')) {
        document.querySelector('#ghostplayoff').classList.add('hidden');
        document.querySelector('#ghostplayon').classList.remove('hidden');
    }

    clearInterval(ghost_play_id);
    World.remove(world, ghost);
}

//method to move the ghost automatically
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