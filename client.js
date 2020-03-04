$(function () {
    //create a client-side socket
    var socket = io();
    let username = "";

    //grab all cookies
    let cookies = document.cookie;

    //check to see if we have a uid cookie
    let uid = getCookie("uid");
    if(uid == ""){
        document.cookie = `uid=${(Math.floor(Math.random() * 100000000000) + 1)}`;
        uid = getCookie("uid");
    }

    //once we have created our uid, tell server.
    socket.emit("connection made", uid);

    //on form submit
    $('form').submit(function(e){
        e.preventDefault();
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    //when client gets a message
    socket.on("chat message", function(msg){
        //add the message to the list of messages
        msg = JSON.parse(msg);
        formatted = msg.timestamp + ` <span class='${msg.id}'>` + msg.user + "</span>: " + msg.msg;

        //add custom css colours
        let newListItem = $("<li>");
        newListItem.html(formatted);
        if(msg.id === uid){
            newListItem.css({"font-weight":"Bold"});
            $('#messages').append(newListItem);
            $(`.${msg.id}`).css({"color":`#${msg.colour}`});
        }else{
            $('#messages').append(newListItem);
            $(`.${msg.id}`).css({"color":`#${msg.colour}`});
        }
        updateScroll("messages");
        
    });

    //get updated list of online users
    socket.on("online users", function(users){
        $('#online-users').empty();
        for(let i = 0; i < users.length; i++){
            $('#online-users').append($('<li>').text(users[i]));
        }
        updateScroll("online-users");
    });

    //get the last 200 logged messages
    socket.on("message logs", function(message_queue, userID){

        //only display if the messages were meant for us
        if(userID === uid){

            //loop through the messages and add them to the list
            for(let i = 0; i < message_queue.length; i++){
                msg = message_queue[i];
                formatted = msg.timestamp + ` <span class='${msg.id}'>` + msg.user + "</span>: " + msg.msg;
                let newListItem = $("<li>");

                if(msg.type === "message"){
                    newListItem.html(formatted);
                }else{
                    newListItem.html(msg.msg);
                }
        
                if(msg.id === uid){
                    newListItem.css({"font-weight":"Bold"});
                    $('#messages').append(newListItem);
                    $(`.${msg.id}`).css({"color":`#${msg.colour}`});
                }else{
                    $('#messages').append(newListItem);
                    $(`.${msg.id}`).css({"color":`#${msg.colour}`});
                }
            }
        }
        let list_item = $("<li>");
        list_item.css({"color":"black", "font-weight":"Bold"});
        list_item.text("Type /help to see all commands.");
        $('#messages').append(list_item);

        updateScroll("messages");
    });

    //update a users nickname
    socket.on("username update", function(msg, userID){
        $('#messages').append($("<li>").text(msg));
        if(msg.split(" ")[0] == username){
            username = msg.split(" ")[6];
        }
        if(userID === uid){
            $('#current-username').html(`You are ${username}`);
        }
        updateScroll("messages");
        
    });

    //update a users colour
    socket.on("colour update", function(msg, userID, colour){
        $('#messages').append($("<li>").text(msg));
        $(`.${userID}`).css({"color":`#${colour}`});
        updateScroll("messages");
    });

    //when a user first joins the chat they are given a username
    socket.on("username message", function(msg){
        $('#current-username').html(`You are ${msg}`);
        username = msg;
        updateScroll("messages");
    });

    //display an error to the client
    socket.on("error", function(error_text, user){
        if(user === uid){
            let html = "<li style='color:red'>" + error_text + "</li>";
            $("#messages").append(html);
            updateScroll("messages");
        }
    });
});


//returns the value of a cookie
function getCookie(cookie_name){
    let name = cookie_name + "=";
    let cookies = document.cookie;
    let split_cookies = cookies.split(";");

    for(let i = 0; i <split_cookies.length; i++) {
        var c = split_cookies[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
}


//ensures that scroll is at the bottom
function updateScroll(id){
    var element = document.getElementById(id);
    element.scrollTop = element.scrollHeight;
}