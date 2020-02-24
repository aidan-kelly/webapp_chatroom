$(function () {
    //create a client-side socket
    var socket = io();

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
        $('#messages').append($("<li>").text(msg));
    });
});