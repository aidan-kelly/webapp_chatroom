$(function () {
    //create a client-side socket
    var socket = io();
    let username = "";

    //grab all cookies
    let cookies = document.cookie;

    //check to see if we have a uid cookie
    let uid = getCookie("uid");
    if(uid == ""){
        console.log("No uid cookie");
        document.cookie = `uid=${(Math.random() * 100000000000000000).toString()}`;
        uid = getCookie("uid");
    }else{
        console.log(`UID Cookie found: ${uid}.`);
    }

    //once we have created our uid, tell server.
    socket.emit("connection made", uid);

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
        formatted = msg.timestamp + ` <span class='${msg.id}'>` + msg.user + "</span>: " + msg.msg;

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

    socket.on("online users", function(users){
        $('#online-users').empty();
        for(let i = 0; i < users.length; i++){
            $('#online-users').append($('<li>').text(users[i]));
        }
        updateScroll("online-users");
    });

    socket.on("message logs", function(message_queue, userID){
        console.log(`${userID} ${uid}`);
        if(userID === uid){
            for(let i = 0; i < message_queue.length; i++){
                console.log(message_queue[i]);
                msg = message_queue[i];
                formatted = msg.timestamp + ` <span class='${msg.id}'>` + msg.user + "</span>: " + msg.msg;
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
            }
        }
        updateScroll("messages");
    });

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

    socket.on("colour update", function(msg, userID, colour){
        $('#messages').append($("<li>").text(msg));
        $(`.${userID}`).css({"color":`#${colour}`});
        updateScroll("messages");
    })

    //when a user first joins the chat
    //they are given a username
    socket.on("username message", function(msg){
        $('#current-username').html(`You are ${msg}`);
        username = msg;
        updateScroll("messages");
    });

    socket.on("error", function(error_text, user){
        if(user === uid){
            alert(error_text);
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


function updateScroll(id){
    var element = document.getElementById(id);
    element.scrollTop = element.scrollHeight;
}