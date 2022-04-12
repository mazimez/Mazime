//CODE TO set-up peer-js 
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
peer.on('open', function(id) {
    peer_id = id; //assigning value to peer id
});
peer.on('connection', function(con) {
    con.on('data', function(data) {
        receiveMessage(data); //passing data to receiver method so it can process it 
    });
});

//method to connect peer to another with channel-id (becoming joiner)
const connect = (id) => {
    conn = peer.connect(id); //making connection by channel id
    conn.on('open', function(data) {
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

        //connecting this device with first message sender device(joiner)
        conn = peer.connect(another_peer_id);
        conn.on('open', function(data) {
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


    if (data.make_object_transparent) {
        if (data.make_object_transparent.object == 'ghost') {
            ghost.render.fillStyle = 'white';
            ghost.collisionFilter = {
                'category': 2,
                'mask': 2,
            };
        }
        if (data.make_object_transparent.object == 'player') {
            ball.render.fillStyle = 'white';
            ball.collisionFilter = {
                'category': 2,
                'mask': 2,
            };
        }
    }

    if (data.remove_transparency) {
        if (data.remove_transparency.object == 'ghost') {
            ghost.render.fillStyle = 'red';
            ghost.collisionFilter.category = 1;
            ghost.collisionFilter.mask = -1;
        }
        if (data.remove_transparency.object == 'player') {
            ball.render.fillStyle = 'blue';
            ball.collisionFilter.category = 1;
            ball.collisionFilter.mask = -1;
        }
    }
    if (data.width_ratio) {
        width_ratio = data.width_ratio;
    }
    if (data.height_ratio) {
        height_ratio = data.height_ratio;
    }



}


//method that will continually send the data to another peer
const startDataTransfer = () => {
    setInterval(function() {
        if (is_clone_mode_on) {
            switch (whoAmI) {
                case 'ghost':

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
window.addEventListener("ball_goal_collision", function(evt) {
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

window.addEventListener("ball_ghost_collision", function(evt) {
    if (whoAmI == 'player') {
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

window.addEventListener("make_object_transparent", function(evt) {
    conn.send({
        "make_object_transparent": {
            "object": whoAmI,
        },
    });
}, false);
window.addEventListener("remove_transparency", function(evt) {
    conn.send({
        "remove_transparency": {
            "object": whoAmI,
        },
    });
}, false);
// window.addEventListener("make_clone", function(evt) {
//     conn.send({
//         "make_clone": {
//             "object": whoAmI,
//         },
//     });
// }, false);


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
            // case 'neji':
            //     cheatOn();
            //     break;
        case 'rock_lee':
            let timer = is_in_phone_mode ? 100 : 1;
            is_follow_on = 1;
            switch (whoAmI) {
                case 'ghost':
                    follow_id = setInterval(function() {
                        followObject(ghost, ball);
                    }, timer);
                    break;
                case 'player':
                    follow_id = setInterval(function() {
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

                    break;
                case 'player':
                    if (!is_clone_mode_on) {
                        clone = makeClone(ball);
                        World.add(world, clone);

                        cloneModeOn(clone);
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