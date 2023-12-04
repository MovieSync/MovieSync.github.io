const ROOM = {
    mqttClient: null,
    username: null,
    roomId: null,
    inSync: true,
    connected: false,
    leaving: false,
    connecting: false,
    topic: 'MovieSync',
    connectiontab: document.getElementById('connection-tab'),
    existingIntervalId: null,

    join: function(user, roomid){
        this.connecting = true;
        this.makeTabConnecting();
        this.mqttClient = mqtt.connect('wss://test.mosquitto.org:8081');
        this.topic = `${this.topic}/${roomid}`
        this.mqttClient.subscribe(this.topic);
        this.mqttClient.on('connect', ()=>{
            this.username = user;
            this.roomId = roomid;
            this.hendleConnect();
        });
        this.mqttClient.on('error', (error) => {
         this.hendleError(error);
        });
        this.mqttClient.on('close', ()=>{
            this.hendleDisconnect();
        });
        this.mqttClient.on('message', (topic, message)=>{
            MessageHandler.handle(message.toString())
        });
    },
    hendleError: function(err){
        console.log(err);
    },

    hendleConnect: function (){
        this.connected = true;
        if(this.connecting){
            this.hendleFirstConnect();
        }
        this.connecting = false;
        this.makeTabConnected();
        this.startBoradcastingExistance()
    },
    startBoradcastingExistance: function(){
        this.broadcastExisTance();
        this.existingIntervalId = setInterval(()=>{
           this.broadcastExisTance();
        },10000);
    },
    sendMessage: function(object){
        if(object.type === 'media' && VIDEO.ignoreMediaEvent){
            return;
        }
        this.broadcast(JSON.stringify(object));
    },
    broadcastExisTance: function(){
        this.sendMessage(MESSAGE.existing());
    },
    hendleDisconnect: function(){
        connected = false;
        document.getElementById('video-title-id').classList.remove('connected-title')
        if(this.leaving){
            this.handleLeave();
            return;
        }
        this.makeTabDisconnected();
        
    },
    handleLeave: function(){
        this.leaveing = false;
        clearInterval(this.existingIntervalId);
        this.makeTabNoConnect();
    },

    makeTabDisconnected: function(){
        this.connectiontab.classList.remove('no-connect');
        this.connectiontab.classList.remove('connecting');
        this.connectiontab.classList.add('connected');
        this.connectiontab.classList.add('disconnected');
    },
    makeTabNoConnect: function(){
        this.connectiontab.classList.remove('connected');
        this.connectiontab.classList.remove('connecting');
        this.connectiontab.classList.remove('disconnected');
        this.connectiontab.classList.add('no-connect');
    },
    makeTabConnected: function(){
        this.connectiontab.classList.remove('no-connect');
        this.connectiontab.classList.remove('connecting');
        this.connectiontab.classList.remove('disconnected');
        this.connectiontab.classList.add('connected');
    },
    makeTabConnecting:function(){
        this.connectiontab.classList.remove('no-connect');
        this.connectiontab.classList.remove('connected');
        this.connectiontab.classList.remove('disconnected');
        this.connectiontab.classList.add('connecting');
    },

    hendleFirstConnect: function(){
        this.sendMessage(MESSAGE.join())
        document.getElementById('video-title-id').classList.add('connected-title')
        document.getElementById('username-label-tab').textContent = this.username;
        document.getElementById('roomid-label-tab').textContent = this.roomId;
    },

    leave: function(){
        if(!this.connected){
            return;
        }
        this.leaving = true;
        this.mqttClient.end();
    },

    broadcast: function(message){
        if(!this.connected){
            return;
        }
        this.mqttClient.publish(this.topic, message);
    }

}

document.getElementById('roomid-input').addEventListener('keypress', (event)=>{
    if (event.key === 'Enter') {
      joinRoom()
    }
  });

  document.getElementById('chat-input-field').addEventListener('keypress', (event)=>{
    if (event.key === 'Enter') {
      sendTextMessage()
    }
  });

function  joinRoom(){
    const username = document.getElementById('username-input').value;
    const roomId = document.getElementById('roomid-input').value;
    console.log(username, roomId)
    ROOM.join(username, roomId);
}
function sendTextMessage(){
    if(!ROOM.connected) return;
    const input = document.getElementById('chat-input-field');
    ROOM.sendMessage(MESSAGE.text(input.value));
    input.value = '';
}

document.querySelector('emoji-picker')
  .addEventListener('emoji-click', (event) =>{
    document.getElementById('chat-input-field').value += event.detail.unicode;
  });