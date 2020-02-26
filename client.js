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
        msg = JSON.parse(msg);
        formatted_msg = msg.timestamp + " " + msg.user + " " + msg.msg;

        let newListItem = $("<li>");
        newListItem.text(formatted_msg);

        if(msg.user == username){
            newListItem.css("font-weight","Bold");
            $('#messages').append(newListItem);
        }else{
            $('#messages').append(newListItem);
        }
        
    });

    //when a user first joins the chat
    //they are given a username
    socket.on("username message", function(msg){
        $('#messages').append($("<li>").text(`You are currently: ${msg}.`));
        username = msg;
    });
});