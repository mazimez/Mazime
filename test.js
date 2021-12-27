 //CODE TO set-up peer-js 
 let peer = new Peer();//peer object manage RTC connection
 let peer_id = null; //id of peer object
 let another_peer_id = null; //id of peer on another side
 let is_connected = 0;//boolean to know is peer connected with another peer
 let conn; //variable for connection object
 let whoAmI = null;
 peer.on('open', function (id) {
    peer_id = id; //assigning value to peer id
    console.log("my peer id: "+peer_id);
 });
 peer.on('connection', function (con) {    
    con.on('data', function (data) {
       console.log("We received :");
       console.log(data);
       receiveMessage(data);         
    });
 });
 const connect = (id) =>{
    conn = peer.connect(id);
    conn.on('open', function (data) {
        is_connected =1;

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
           "peer_id":peer_id
        });
    });
}



const sendMessage = (data) =>{    
    conn.send({
        "data":data
    });
}

const receiveMessage = (data) =>{
    if(data.peer_id){   
        another_peer_id = data.peer_id;
    }
    if(!is_connected && another_peer_id){
        document.getElementById('peer_key').remove();
        conn = peer.connect(another_peer_id);
        conn.on('open', function (data) {
            is_connected =1;

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
               "verticals":verticals,
               "horizontals":horizontals,
            });        
            createMaze();
            return 1;
        });
        return 0;
    }
    if(data.verticals && data.horizontals){
        verticals = data.verticals;
        horizontals = data.horizontals;
        createMaze();   
    }

    
}
