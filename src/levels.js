//next Level
const nextLevel = () => {
    special_ability_count_left = 3;
    special_ability_wait_time = 2000;
    is_special_ability_in_use = 0;
    is_lose = false;
    is_won = false;
    ghostplayOff();
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
        World.remove(world, ghost);

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
        if (ghost_speed > 5) {
            ghost_speed = ghost_speed - 5;
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
        addControlsToObject(ball);  
        ghostPlayOn();
    }
}