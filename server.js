//this is server side code. Using nodejs.
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

//struggling to get both of these working...
app.use(cookieParser());

var http = require('http').createServer(app);
var io = require('socket.io')(http);

//our dictionary of all users
let user_list = new Object();

//when a user loads our website, they are sent the index.html file.

//
//REALLY STRUGGLING WITH COOKIES. 
//MIGHT DO IT CLIENT SIDE. 
//
app.get("/", function(req, res){
    console.log();
    if(req.cookies.uid !== undefined){
        //we can use the previous cookie as UID.
        console.log(`We already have a cookie. UID = ${req.cookies.uid}.`);
    }else{
        console.log("We do not have a cookie.")
        //make a new cookie.
        res.cookie('uid', (Math.random() * 100000000000000000).toString(), { maxAge: 900000, httpOnly: true });
    }
    
    res.sendFile(__dirname + "/index.html");
});

//serve the css
app.get('/style.css', function(req, res) {
    res.sendFile(__dirname + "/" + "style.css");
});

//serve the client js
app.get('/client.js', function(req, res) {
    res.sendFile(__dirname + "/" + "client.js");
});

//handles connections from a socket
io.on("connection", function(socket){

    //make a new default user
    let new_user = new User(socket.id);

    //create a new dictionary entry with the socket id as the key
    user_list[new_user.userID] = new_user;
    findOnlineUsers(user_list);

    //when a client first connects we send them their username
    socket.emit("username message", user_list[socket.id].userNickname);
    console.log(`A user connected. ID = ${user_list[socket.id].userNickname}.`);

    //when a socket disconnects
    socket.on('disconnect', function(){
        console.log('user disconnected');
        user_list[new_user.userID].status = false;
        findOnlineUsers(user_list);
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


//changes a users nickname
function changeNickname(command, userID){

    //still need to implement check for existing usernames
    if(command[1] !== undefined){
        old_nickname = user_list[userID].userNickname;

        if(checkIfUniqueNickname(command[1], user_list)){
            user_list[userID].userNickname = command[1];
            io.emit("username update", `${old_nickname} has changed their username to ${user_list[userID].userNickname}`);
            findOnlineUsers(user_list);

        }else{
            console.log("FUCK");
        }
        
        
    }else{
        console.log("FUCK");
    }
}


//changes a users colour and let's all peers know
function changeColour(command, userID){
    //still need to implement check for existing usernames
    if(command[1] !== undefined){
        let colourReg = /[A-Fa-f\d]{6}/;
        if(colourReg.test(command[1])){
            user_list[userID].userColour = command[1];
            io.emit("colour update", `${user_list[userID].userNickname} changed their colour!`, userID, user_list[userID].userColour);
        //error handling in here.
        }else{
            console.log("FUCK");
        }
        
    //error handling in here.    
    }else{
        console.log("FUCK");
    }
}


//start of updated online users list
function findOnlineUsers(user_list){
    let online_users = [];
    for(let user in user_list){
        if(user_list[user].status === true){
            online_users.push(user_list[user].userNickname);
        }
    }
    return online_users;
}


//checks if a nickname is in use
function checkIfUniqueNickname(proposed_nickname, user_list){
    for(let user in user_list){
        if(user_list[user].userNickname === proposed_nickname){
            return false;
        }else{
            continue;
        }
    }
    return true;
}