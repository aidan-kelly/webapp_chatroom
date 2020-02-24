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
    let pls = socket.request.connection._peername;
    console.log(`A user connected from ${JSON.stringify(pls)}.`);
    //when a socket disconnects
    socket.on('disconnect', function(){
        console.log('user disconnected');
      });

    //when we receive a message from a client
    socket.on("chat message", function(msg){
        //send that message to all clients
        msg = getTimeStamp() + " " + msg;
        io.emit("chat message", msg);
    });
});

//we start our website on port 3000 and output it to console. 
http.listen(3000, function(){
    console.log("listening on port 3000");
})

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