//variables to set-up peer-js 
let peer = new Peer(); //peer object manage RTC connection
let peer_id = null; //id of peer object
let another_peer_id = null; //id of peer on another side
let is_connected = 0; //boolean to know is peer connected with another peer
let conn; //variable for connection object
let whoAmI = null; //variable to know that this peer is Player or Ghost
let level = 1 //the current level

//TODO::remove this variable if it's not being used
let can_teleport = true;

//variables to show the same ration of game screen on both peer's device
let width_ratio = null;
let height_ratio = null;

//variable to manage the followObject feature 
let follow_id;
let is_follow_on = 0;


//opening connection channel for peer to connect
peer.on('open', function (id) {
    peer_id = id; //assigning value to peer id
});
peer.on('connection', function (con) {
    con.on('data', function (data) {
        receiveMessage(data); //passing data to receiver method so it can process it 
    });
});

//method to connect peer to another with channel-id (becoming joiner)
const connect = (id) => {
    conn = peer.connect(id); //making connection by channel id
    conn.on('open', function (data) {
        is_connected = 1; //setting boolean to 1 if connected

        //we are connected(from joiner side), so lets render the game
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

        //sending the first message to given channel(becoming joiner) 
        conn.send({
            "peer_id": peer_id,
            "width": window.innerWidth,
            "height": window.innerHeight,
        });
    });
}


//receiver method that receive the the data and process it.
const receiveMessage = (data) => {
    //processing first message that will have the peer-id(channel id) init
    if (data.peer_id) {
        another_peer_id = data.peer_id //assigning the id as another peer to connect with it later
    }

    //adjusting height and width ration so it will look and feel same on both device of all sizes
    if (data.width) {
        width_ratio = window.innerWidth / data.width;
    }
    if (data.height) {
        height_ratio = window.innerHeight / data.height;
    }


    //checking if connection is established(from host side) and start transferring data between peers
    if (!is_connected && another_peer_id) {
        //removing peer id input field from webpage
        document.getElementById('peer_key').remove();

        //getting the selected level & removing it's input field from webpage
        level = parseInt(document.getElementById('choose_level').value);
        document.getElementById('level_selection').remove();

        //adding the option to use the special ability
        document.getElementById('special').classList.remove('hidden')

        //connecting this device with first message sender device(joiner)
        conn = peer.connect(another_peer_id);
        conn.on('open', function (data) {
            is_connected = 1; //setting boolean to 1 if connected

            //we are connected(from host side), so lets render the game
            setLevel(level);
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
            //sending the maze data and ratio to joiner side so it can render the same game on it's device too
            conn.send({
                "verticals": verticals,
                "horizontals": horizontals,
                "width_ratio": width_ratio,
                "height_ratio": height_ratio,
                "level": level,
            });
            //calling the function to creat the maze according to array's data
            createMaze();
            World.add(world, goal); //adding the goal to the world
            World.add(world, ball); //adding the ball to the world
            World.add(world, ghost); //adding the ghost to the world
            addControlsToObject(ball); //adding the controls on ball

            //method to start sending data(from host side) between peers to continue game
            startDataTransfer();

            return 1;
        });
        return 0;
    }

    //if ratio are given by host then changing it's value on joiner side
    if (data.width_ratio) {
        width_ratio = data.width_ratio;
    }
    if (data.height_ratio) {
        height_ratio = data.height_ratio;
    }

    //from joiner side, once we get the data of maze and ratio. we render the same game on joiner side too
    if (data.verticals && data.horizontals) {
        //setting up level
        if (data.level) {
            level = data.level;
            setLevel(level);
        }
        //normal stuff to create maze.
        verticals = data.verticals;
        horizontals = data.horizontals;
        World.add(world, goal); //adding the goal to the world
        World.add(world, ball); //adding the ball to the world
        World.add(world, ghost); //adding the ghost to the world
        createMaze();
        addControlsToObject(ghost); //adding the controls on ball

        //method to start sending data(from joiner side) between peers to continue game
        startDataTransfer();
    }


    //setting the position of player(host) on the ghost(joiner) side
    if (data.ball && whoAmI != 'player') {
        Body.setPosition(ball, { x: data.ball.x, y: data.ball.y });
    }
    //setting the position of ghost(joiner) on the player(host) side
    if (data.ghost && whoAmI != 'ghost') {
        Body.setPosition(ghost, { x: data.ghost.x, y: data.ghost.y });
    }

    //making the given object transparent
    if (data.make_object_transparent) {
        if (data.make_object_transparent.object == 'ghost') {
            //TODO::decide if we need to do something if the other player gets transparent
        }
        if (data.make_object_transparent.object == 'player') {
            //TODO::decide if we need to do something if the other player gets transparent
        }
    }

    //removing transparency of given object
    if (data.remove_transparency) {
        //TODO::decide if we need to do something if the other player remove transparency
    }

    //changing the label of object to clone of itself
    if (data.make_clone) {
        if (data.make_clone.object == 'ghost') {
            ghost.label = "ghost_clone";
        }
        if (data.make_clone.object == 'player') {
            ball.label = "ball_clone";
        }
    }

    //checking if other peer is already lost by clone
    if (data.lost) {
        if (data.lost.object == 'ghost') {
            window.dispatchEvent(ball_goal_collision_evt)
        }
        if (data.lost.object == 'player') {
            window.dispatchEvent(ball_ghost_collision_evt)
        }
    }

    //checking if other peer is already won by clone
    if (data.won) {
        if (data.won.object == 'ghost') {
            window.dispatchEvent(ball_ghost_collision_evt)
        }
        if (data.won.object == 'player') {
            window.dispatchEvent(ball_goal_collision_evt)
        }
    }

    //deactivating the clone is other player has catch the clone on it side
    if (data.deactivate_clone) {
        if (data.deactivate_clone.object == 'ghost') {
            deactivateClone();
        }
        if (data.deactivate_clone.object == 'player') {
            deactivateClone();
        }
    }


}


//method that will continually send the data to another peer
const startDataTransfer = () => {
    setInterval(function () {
        if (is_clone_mode_on) {
            switch (whoAmI) {
                case 'ghost':
                    conn.send({
                        "ball": {
                            "x": ball.position.x / width_ratio,
                            "y": ball.position.y / height_ratio,
                        },
                        "ghost": {
                            "x": clone.position.x * width_ratio,
                            "y": clone.position.y * height_ratio,
                        }
                    });
                    break;
                case 'player':
                    conn.send({
                        "ball": {
                            "x": clone.position.x / width_ratio,
                            "y": clone.position.y / height_ratio,
                        },
                        "ghost": {
                            "x": ghost.position.x * width_ratio,
                            "y": ghost.position.y * height_ratio,
                        }
                    });
                    break;

                default:
                    break;
            }
        } else {
            conn.send({
                "ball": {
                    "x": ball.position.x / width_ratio,
                    "y": ball.position.y / height_ratio,
                },
                "ghost": {
                    "x": ghost.position.x * width_ratio,
                    "y": ghost.position.y * height_ratio,
                }
            });
        }
    }, 10);
}


//adding events listeners for collision
window.addEventListener("ball_goal_collision", function (evt) {
    if (whoAmI == 'player') {
        if (!is_lose) {
            is_won = true;
            // if (cellsHorizontal >= 20 || cellsVertical >= 20) {
            //     document.querySelector("#next").remove();
            // }
            if (is_autoplay_on) {
                autoplayOff();
            }
            try {
                ghostplayOff();
            } catch (err) {

            }
            if (is_clone_mode_on) {
                window.dispatchEvent(ball_clone_ghost_collision_evt)
                conn.send({
                    "won": {
                        "object": whoAmI,
                    },
                });
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
    }
    if (whoAmI == 'ghost') {
        console.log('here1');
        if (!is_won) {
            console.log('here2');
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
    if (is_follow_on) {
        is_follow_on = 0;
        clearInterval(follow_id);
    }

}, false);

window.addEventListener("ball_ghost_collision", function (evt) {
    if (whoAmI == 'player') {
        if (!is_won) {
            is_lose = true;
            if (is_autoplay_on) {
                autoplayOff();
            }
            if (is_clone_mode_on) {
                window.dispatchEvent(ball_clone_ghost_collision_evt)
                conn.send({
                    "lost": {
                        "object": whoAmI,
                    },
                });
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
    if (whoAmI == 'ghost') {
        if (!is_lose) {
            is_won = true;
            // if (cellsHorizontal >= 20 || cellsVertical >= 20) {
            //     document.querySelector("#next").remove();
            // }
            if (is_autoplay_on) {
                autoplayOff();
            }
            try {
                ghostplayOff();
            } catch (err) {

            }
            if (is_clone_mode_on) {
                window.dispatchEvent(ghost_clone_ball_collision_evt)
                conn.send({
                    "won": {
                        "object": whoAmI,
                    },
                });
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
    }
    if (is_follow_on) {
        is_follow_on = 0;
        clearInterval(follow_id);
    }
}, false);

window.addEventListener("make_object_transparent", function (evt) {
    conn.send({
        "make_object_transparent": {
            "object": whoAmI,
        },
    });
}, false);
window.addEventListener("remove_transparency", function (evt) {
    conn.send({
        "remove_transparency": {
            "object": whoAmI,
        },
    });
}, false);
window.addEventListener("make_clone", function (evt) {
    conn.send({
        "make_clone": {
            "object": whoAmI,
        },
    });
}, false);
//ball clone+ghost
window.addEventListener("ball_clone_ghost_collision", function (evt) {
    if (whoAmI == 'player') {
        deactivateClone();
    }
    if (whoAmI == 'ghost') {
        if (is_clone_mode_on) {
            conn.send({
                "deactivate_clone": {
                    "object": "player",
                },
            });
        }
        ball.label = "ball";
    }
}, false);

//ball clone+ghost clone
window.addEventListener("ghost_clone_ball_clone_collision", function (evt) {
    if (whoAmI == 'player') {
        deactivateClone();
        ghost.label = "ghost";
    }
    if (whoAmI == 'ghost') {
        deactivateClone();
        ball.label = "ball";
    }
}, false);

//ghost clone+ball
window.addEventListener("ghost_clone_ball_collision", function (evt) {
    if (whoAmI == 'player') {
        if (is_clone_mode_on) {
            conn.send({
                "deactivate_clone": {
                    "object": "ghost",
                },
            });
        }
        ghost.label = "ghost";
    }
    if (whoAmI == 'ghost') {
        deactivateClone();
    }
}, false);

//method to activate the special ability based on selected character
const specialAbility = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const character = urlParams.get('character');
    if (is_won) {
        return 0;
    }

    switch (character) {
        case 'sasuke':
            teleportObject(whoAmI == 'ghost' ? ghost : ball);
            break;
        case 'neji':
            switch (whoAmI) {
                case 'ghost':
                    // byakugan.play();
                    showPath(getRow(ghost), getColumn(ghost), getRow(ball), getColumn(ball));
                    setTimeout(function () {
                        hidePath();
                    }, special_ability_wait_time);
                    break;
                case 'player':
                    // byakugan.play();
                    showPath(getRow(ball), getColumn(ball), getRow(goal), getColumn(goal));
                    setTimeout(function () {
                        hidePath();
                    }, special_ability_wait_time);
                    break;

                default:
                    break;
            }
            break;
        case 'rock_lee':
            let timer = is_in_phone_mode ? 100 : 1;
            is_follow_on = 1;
            switch (whoAmI) {
                case 'ghost':
                    follow_id = setInterval(function () {
                        followObject(ghost, ball);
                    }, timer);
                    break;
                case 'player':
                    follow_id = setInterval(function () {
                        followObject(ball, goal);
                    }, timer);
                    break;

                default:
                    break;
            }
            break;
        case 'obito':
            makeObjectTransparent(whoAmI == 'ghost' ? ghost : ball);
            break;

        case 'naurto':
            switch (whoAmI) {
                case 'ghost':
                    if (!is_clone_mode_on) {
                        activateClone(ghost);
                    }
                    break;
                case 'player':
                    if (!is_clone_mode_on) {
                        activateClone(ball);
                    }
                    break;

                default:
                    break;
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