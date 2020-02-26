$(function () {
    //create a client-side socket
    var socket = io();
    let username = "";

    //on form submit
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val()); //send the message to the connection
        $('#m').val(''); //resets the input field. 
        return false;
    });

    //when client gets a message
    socket.on("chat message", function(msg){
        //add the message to the list of messages
        console.log(msg);
        msg = JSON.parse(msg);
        formatted = msg.timestamp + ` <span class='${msg.id}'>` + msg.user + "</span>: " + msg.msg;

        let newListItem = $("<li>");
        newListItem.html(formatted);
        if(msg.user == username){
            newListItem.css({"font-weight":"Bold"});
            $('#messages').append(newListItem);
            $(`.${msg.id}`).css({"color":`#${msg.colour}`});
        }else{
            $('#messages').append(newListItem);
            $(`.${msg.id}`).css({"color":`#${msg.colour}`});
        }
        
    });

    socket.on("username update", function(msg){
        $('#messages').append($("<li>").text(msg));
        if(msg.split(" ")[0] == username){
            username = msg.split(" ")[6];
        }
        
    });

    socket.on("colour update", function(msg, userID, colour){
        $('#messages').append($("<li>").text(msg));
        $(`.${userID}`).css({"color":`#${colour}`});
    })

    //when a user first joins the chat
    //they are given a username
    socket.on("username message", function(msg){
        $('#messages').append($("<li>").text(`You are currently: ${msg}.`));
        username = msg;
    });
});