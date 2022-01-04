//CODE TO set-up peer-js 
let peer = new Peer(); //peer object manage RTC connection
let peer_id = null; //id of peer object
let another_peer_id = null; //id of peer on another side
let is_connected = 0; //boolean to know is peer connected with another peer
let conn; //variable for connection object
let whoAmI = null;
let speedlimit = 15; //speedlimit of ball
let level = 1 //the current level
let ghost_speed = 30;
let can_teleport = true;
let width_ratio = null;
let height_ratio = null;
let is_autoplay_done = 0;
let is_autoplay_on = 0;
let auto_play_id;
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

}, false);




peer.on('open', function(id) {
    peer_id = id; //assigning value to peer id
    console.log("my peer id: " + peer_id);
});
peer.on('connection', function(con) {
    con.on('data', function(data) {
        //    console.log("We received :");
        //    console.log(data);
        receiveMessage(data);
    });
});
const connect = (id) => {
    conn = peer.connect(id);
    conn.on('open', function(data) {
        is_connected = 1;

        //we are connected, so lets render the game
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

        conn.send({
            "peer_id": peer_id,
            "width": window.innerWidth,
            "height": window.innerHeight,
        });
    });
}



const sendMessage = (data) => {
    conn.send({
        "data": data
    });
}

const receiveMessage = (data) => {
    // console.log(data.ball);
    if (data.ball && whoAmI != 'player') {
        Body.setPosition(ball, { x: data.ball.x, y: data.ball.y });
    }
    if (data.ghost && whoAmI != 'ghost') {
        Body.setPosition(ghost, { x: data.ghost.x, y: data.ghost.y });
    }
    if (data.peer_id) {
        another_peer_id = data.peer_id;
    }
    if (data.width) {
        width_ratio = window.innerWidth / data.width;
    }
    if (data.height) {
        height_ratio = window.innerHeight / data.height;
    }
    if (data.width_ratio) {
        width_ratio = data.width_ratio;
    }
    if (data.height_ratio) {
        height_ratio = data.height_ratio;
    }
    if (!is_connected && another_peer_id) {
        document.getElementById('peer_key').remove();
        conn = peer.connect(another_peer_id);
        conn.on('open', function(data) {
            is_connected = 1;

            //we are connected, so lets render the game
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

            //creating maze
            stepThroughCell(startRow, startColumn);
            conn.send({
                "verticals": verticals,
                "horizontals": horizontals,
                "width_ratio": width_ratio,
                "height_ratio": height_ratio,
            });
            createMaze();
            World.add(world, goal); //adding the goal to the world
            World.add(world, ball); //adding the ball to the world
            World.add(world, ghost); //adding the ghost to the world
            addControlsToObject(ball); //adding the controls on ball
            startDataTransfer();
            return 1;
        });
        return 0;
    }
    if (data.verticals && data.horizontals) {
        verticals = data.verticals;
        horizontals = data.horizontals;
        World.add(world, goal); //adding the goal to the world
        World.add(world, ball); //adding the ball to the world
        World.add(world, ghost); //adding the ghost to the world
        createMaze();
        addControlsToObject(ghost); //adding the controls on ball
        startDataTransfer();

    }

}
const startDataTransfer = () => {
    setInterval(function() {
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
        // sendMessage({
        //     "ball":{
        //         "x":ball.position.x,
        //         "y":ball.position.y,
        //     },
        //     "ghost":{
        //         "x":ghost.position.x,
        //         "y":ghost.position.y,
        //     }
        // })
    }, 10);
}