let level = 1; //the current level

//TODO::remove this variable if it's not being used
let can_teleport = true;

//variables for special ability controls
let special_ability_count_left;
let special_ability_wait_time;
let is_special_ability_in_use;

//setting level to 1 at start
setLevel(1);

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


//adding events listeners for collision
//ball+goal
window.addEventListener("ball_goal_collision", function (evt) {
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
//ball+ghost
window.addEventListener("ball_ghost_collision", function (evt) {
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

//ball clone+ghost
window.addEventListener("ball_clone_ghost_collision", function (evt) {
    if (is_clone_mode_on) {
        deactivateClone();
    }
}, false);



//starting the maze generation algorithm by calling this function
stepThroughCell(startRow, startColumn);

//calling the function to creat the maze according to array's data
createMaze();

World.add(world, goal); //adding the goal to the world
World.add(world, ball); //adding the ball to the world
World.add(world, ghost); //adding the ghost to the world
addControlsToObject(ball); //adding the controls on ball

//method to activate the special ability based on selected character
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
            // byakugan.play();
            showPath(getRow(ball), getColumn(ball), getRow(goal), getColumn(goal));
            setTimeout(function () {
                hidePath();
            }, special_ability_wait_time);
            break;
        case 'rock_lee':
            autoplayOn();
            break;
        case 'obito':
            makeObjectTransparent(ball);
            break;
        case 'naurto':
            if (!is_clone_mode_on) {
                activateClone(ball);
            }

            break;

        default:
            break;
    }
}

special_ability_count_left = 3;
special_ability_wait_time = 2000;
is_special_ability_in_use = 0;
//method to manage the special ability counts and views
const useSpecialAbility = () => {
    if (special_ability_count_left <= 0) {
        document.querySelector('#special').classList.add('deactivate');
        return 0;
    }
    if (!is_special_ability_in_use) {
        document.querySelector('#special').classList.add('deactivate');
        special_ability_count_left = special_ability_count_left - 1;
        is_special_ability_in_use = 1;
        specialAbility();
        setTimeout(function () {
            if (special_ability_count_left > 0) {
                document.querySelector('#special').classList.remove('deactivate');
            }
            is_special_ability_in_use = 0;
        }, special_ability_wait_time);
    }

}
ghostPlayOn();