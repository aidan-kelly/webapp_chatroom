//this is server side code. Using nodejs.
var express = require('express');
var app = express();
app.use(express.static("."));
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//when a user loads our website, they are sent the index.html file.
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

//handles connections from a socket
io.on("connection", function(socket){

    //maintain a username for each client. Might need to make this persistant and not in memory
    let username = getUsername(socket);

    //when a client first connects we send them their username
    socket.emit("username message", username);

    console.log(`A user connected. ID = ${username}.`);
    //when a socket disconnects
    socket.on('disconnect', function(){
        console.log('user disconnected');
      });

    //when we receive a message from a client
    socket.on("chat message", function(msg){
        //send that message to all clients
        msg = new Message(msg, getUsername(socket))
        io.emit("chat message", JSON.stringify(msg));
    });
});

//we start our website on port 3000 and output it to console. 
http.listen(3000, function(){
    console.log("listening on port 3000");
})

//returns a formatted timestamp
function getTimeStamp(){
    let now = new Date();
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
    for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
            time[i] = "0" + time[i];
        }
    }
    return ("[" + time[0] + ":" + time[1] + ":" + time[2] + "]");
}

//might need to change this, want to make username persistant somehow
function getUsername(socket){
    return socket.id;
}

//constructor for a Message object
function Message(msg, user){
    this.msg = msg;
    this.user = user;
    this.timestamp = getTimeStamp();
}