//this is server side code. Using nodejs.
var express = require('express');
var app = express();
app.use(express.static("."));
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//our dictionary of all users
let user_list = new Object();

//when a user loads our website, they are sent the index.html file.
app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

//handles connections from a socket
io.on("connection", function(socket){

    //make a new default user
    let new_user = new User(socket.id);

    //create a new dictionary entry with the socket id as the key
    user_list[new_user.userID] = new_user;

    //when a client first connects we send them their username
    socket.emit("username message", user_list[socket.id].userNickname);
    console.log(`A user connected. ID = ${user_list[socket.id].userNickname}.`);

    //when a socket disconnects
    socket.on('disconnect', function(){
        console.log('user disconnected');
        user_list[new_user.userID].status = false;
    });

    //when we receive a message from a client
    socket.on("chat message", function(msg){

        msg = new Message(msg, user_list[socket.id].userNickname, user_list[socket.id].userColour, socket.id);

        //check if user is trying to issue a command
        checkForCommand(msg, socket.id);
        
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


//constructor for a Message object
function Message(msg, user, colour, id){
    this.msg = msg;
    this.user = user;
    this.id = id;
    this.timestamp = getTimeStamp();
    this.colour = colour;
}


//constructor for a User object
function User(userID){
    this.userID = userID;
    this.userNickname = userID;
    this.userColour = "000000";
    this.status = true;
}


function checkForCommand(msg, userID){
    let split_msg = msg.msg.split(" ");

    if(split_msg[0] === "/nick"){
        changeNickname(split_msg, userID);
        return 1;
    }else if(split_msg[0] === "/nickcolor"){
        changeColour(split_msg, userID);
        return 2;
    }else if(split_msg[0] === "/nickcolour"){
        changeColour(split_msg, userID);
        return 2;
    }else{
        io.emit("chat message", JSON.stringify(msg));
    } 
}


function changeNickname(command, userID){

    //still need to implement check for existing usernames
    if(command[1] !== undefined){
        old_nickname = user_list[userID].userNickname;
        user_list[userID].userNickname = command[1];
        io.emit("username update", `${old_nickname} has changed their username to ${user_list[userID].userNickname}`);
        
    }else{
        console.log("FUCK");
    }
}


function changeColour(command, userID){
    //still need to implement check for existing usernames
    if(command[1] !== undefined){
        user_list[userID].userColour = command[1];
        io.emit("colour update", `${user_list[userID].userNickname} changed their colour!`, userID, user_list[userID].userColour);
        
    }else{
        console.log("FUCK");
    }
}