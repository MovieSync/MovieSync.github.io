const MESSAGE = {
    existing: function(){
        return {
            type: 'existing',
            username: ROOM.username,
            video: VIDEO.videoAdded,
            subtitle: VIDEO.subtitleAdded,
            inSync: ROOM.inSync,
            fullScreen: VIDEO.isFullScreen()
        }
    },
    text: function(text){
        return {
            type: 'text',
            username: ROOM.username,
            time: TIME.now(),
            text: text
        }
    },

    media: function(mediaType){
        return {
            type: 'media',
            username: ROOM.username,
            mediaType: mediaType,
            time: VIDEO.video.currentTime
        }
    },

    join: function(){
       return { 
        type: 'join',
        username: ROOM.username
       }
    },

};

const messageHandeler = new Map();
messageHandeler.set('existing', handleExistMessage);
messageHandeler.set('text', handleTextMessage);
messageHandeler.set('media', handleMediaMessage);
messageHandeler.set('join', handleJoinMessage);

// messageHandeler.set('leave', handleLeaveMessage);
// messageHandeler.set('poke', handlePokeMessage);
// messageHandeler.set('reconnect', handleReconnectMessage);
// messageHandeler.set('conflict', handleConflictMessage);
// messageHandeler.set('mediaReguest', hadleMediaReguestMessage);
// messageHandeler.set('mediaResponse', handleMediaResponseMessage);
// messageHandeler.set('syncRequest', handleSyncRequest);
// messageHandeler.set('syncResponse', handleSyncResponse);
// messageHandeler.set('change', handleChangeMessage);

const MessageHandler = {
    handle: function(json){
        const message = JSON.parse(json);
        messageHandeler.get(message.type)(message);
    }
}

const connectedPeopleLsit = document.getElementById('connected-people-list');
const connectedPeopleLsitMap = new Map();
const connectedPleopleKeyPair = {
    video: 'people-video',
    subtitle: 'people-caption',
    inSync: 'people-sync',
    fullScreen: 'people-fullscreen'
}
function handleExistMessage(message){
    // console.log(message)
    let div;
    if(!connectedPeopleLsitMap.has(message.username)){
        div = document.createElement('div');
        div.classList.add('one-people');
        div.setAttribute('id', `people-${message.username}`);
        div.innerHTML = `
                        <img height="30" width="30" src="./elements/img/avaters/avater-1.png" alt="">
                        <p style="flex-grow: 1;">${message.username}</p>
                        <div>
                            <i class="people-video-yes fa-solid fa-video"></i>
                            <i class="people-video-no fa-solid fa-video-slash"></i>
                        </div>
                        <div>
                            <i class="people-caption-yes fa-solid fa-closed-captioning"></i>
                            <i class="people-caption-no fa-regular fa-closed-captioning"></i>
                        </div>
                    
                        <div>
                            <i class="people-fullscreen-yes fa-solid fa-expand"></i>
                            <i class="people-fullscreen-no fa-solid fa-compress"></i>
                        </div>
                        <div>
                            <i class="people-sync-yes fa-solid fa-rotate fa-spin"></i>
                            <i class="people-sync-no fa-solid fa-rotate"></i>
                        </div>
                        <div>
                            <i class="fa-solid fa-circle-chevron-down"></i>
                            <!-- <i class="fa-solid fa-circle-chevron-up"></i> -->
                        </div>`;

        connectedPeopleLsit.appendChild(div);
        connectedPeopleLsitMap.set(message.username, document.getElementById(`people-${message.username}`));

    }
    else{
        div = connectedPeopleLsitMap.get(message.username)
    }
    for(i in connectedPleopleKeyPair){
        if(message[i]){
            div.classList.add(connectedPleopleKeyPair[i]);
        }
        else{
            div.classList.remove(connectedPleopleKeyPair[i]);
        }
    }
}
function handleTextMessage(message){
    appendTextToTextBox(message);
}

const chatBox = document.getElementById('chat-box-container');
function appendTextToTextBox(message){
    const container = document.createElement('div');
    container.classList.add('message-container');
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');

    if(message.username === ROOM.username){
        messageDiv.classList.add('you');
    }
    
    const img = document.createElement('img');
    img.setAttribute('height', '30');
    img.setAttribute('width', '30');
    img.setAttribute('src', './elements/img/avaters/avater-1.png');
    messageDiv.appendChild(img);
    
    const text = document.createElement('p');
    text.classList.add('text');
    text.textContent = message.text;
    messageDiv.appendChild(text);
    
    const time = document.createElement('p');
    time.classList.add('time');
    time.textContent = TIME.format12h(new Date(message.time));
    messageDiv.appendChild(time);
    
    container.appendChild(messageDiv);

    const sender = document.createElement('p');
    sender.classList.add('sender');
    sender.textContent = message.username;
    container.appendChild(sender);

    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
}
const mediaHandlers = {
    play: function(time){
        VIDEO.play(time);
    },
    pause: function(time){
        VIDEO.pause(time);
    },
    seeked: function(time){
        VIDEO.seek(time);
    }
}
function handleMediaMessage(message){
    console.log(message)
    if(message.username === ROOM.username){
        return;
    }
    VIDEO.ignoreMediaEvent = true;
    mediaHandlers[message.mediaType](message.time);   
    setTimeout(()=>{
        VIDEO.ignoreMediaEvent = false;
    },1500)
}
function handleJoinMessage(message){
    ROOM.broadcastExisTance();
}