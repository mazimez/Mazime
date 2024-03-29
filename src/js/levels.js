//maze generation for given level
let setLevel = (level) => {

    //adjusting thickness of the lines according to level
    cellsWidth = 10 - (level - 1);
    if (cellsWidth < 1) {
        cellsWidth = 1;
    }
    cellsHorizontal = level + 5; //adjusting the horizontal based on level
    cellsVertical = level + 5; //adjusting the vertical based on level
    unitLengthX = width / cellsHorizontal; //calculating the width of one cell(section or box)
    unitLengthY = height / cellsVertical; //calculating the height of one cell(section or box)
    //array that store the data of visited/unvisited cells
    grid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    //array that stores the data of vertical lines/blocks/rectangles 
    verticals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(false));

    //array that stores the data of horizontal lines/block/rectangle
    horizontals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));

    //randomly selecting one cell to start generating maze
    startRow = Math.floor(Math.random() * cellsVertical);
    startColumn = Math.floor(Math.random() * cellsHorizontal)


    speedlimit = 15 - (level - 1)
    if (speedlimit < 4) {
        speedlimit = 4;
    }
    ghost_speed = speedlimit * 1.5;
    autoPlaySpeed = 0.1 * (27 - ghost_speed);
    // ghost_speed = 10 - ((level - 1) * 5)
    // if (ghost_speed < 5) {
    //     ghost_speed = 5;
    // }


    //creating the goal to finish the game
    createGoalObject();

    //creating the ball to start the game
    createPlayerObject();

    //creating the ghost to follow the ball
    createGhostObject();

}



//next Level
const nextLevel = (is_for_multiplayer = false) => {
    special_ability_count_left = 3;
    document.querySelector('#special').classList.remove('deactivate');
    special_ability_wait_time = 2000;
    is_special_ability_in_use = 0;
    is_lose = false;
    is_won = false;
    if (!is_for_multiplayer) {
        ghostplayOff();
    }
    if (level >= 20) {
        console.log("no more level nor now");
    } else {
        deleteMaze();

        //removing the win/lose tag
        if (!document.querySelector('.winner').classList.contains('hidden')) {
            document.querySelector('.winner').classList.add('hidden');
        }
        if (!document.querySelector('.losser').classList.contains('hidden')) {
            document.querySelector('.losser').classList.add('hidden');
        }

        World.remove(world, ball);
        World.remove(world, goal);
        World.remove(world, ghost);


        if (is_clone_mode_on) {
            deactivateClone()
        }
        hidePath();

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
        ghost_speed = speedlimit * 1.5;
        autoPlaySpeed = 0.1 * (27 - ghost_speed);
        // if (ghost_speed > 5) {
        //     ghost_speed = ghost_speed - 5;
        // }

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

        createPlayerObject();
        World.add(world, ball);

        createGhostObject();
        World.add(world, ghost);

        createGoalObject();
        World.add(world, goal);
        level++;

        if (is_for_multiplayer) {
            if (whoAmI == 'player') {
                addControlsToObject(ball);
            } else {
                addControlsToObject(ghost);
            }
        } else {
            addControlsToObject(ball);
            ghostPlayOn();
        }
    }
}

//method to restart the whole game(reload page)
const restart = () => {
    window.location.reload();
}