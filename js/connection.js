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
         hendleError(error);
        });
        this.mqttClient.on('close', ()=>{
            this.hendleDisconnect();
        });
        this.mqttClient.on('message', (topic, message)=>{
            MessageHandler.handle(message.toString())
        });
    },

    hendleConnect: function (){
        this.sendMessage(MESSAGE.existing());
        if(this.connecting){
            this.hendleFirstConnect();
        }
        this.connected = true;
        this.connecting = false;
        this.makeTabConnected();
        this.startBoradcastingExistance()
    },
    startBoradcastingExistance: function(){
        this.existingIntervalId = setInterval(()=>{
           this.sendMessage(MESSAGE.existing());
        },2000);
    },
    sendMessage: function(object){
        this.broadcast(JSON.stringify(object));
    },
    hendleDisconnect: function(){
        connected = false;
        document.getElementById('video-title-id').classList.remove('connected-title')
        if(this.leaving){
            this.leaveing = false;
            clearInterval(this.existingIntervalId);
            this.makeTabNoConnect();
        }
    },
    makeTabNoConnect: function(){
        this.connectiontab.classList.remove('connected');
        this.connectiontab.classList.remove('connecting');
        this.connectiontab.classList.add('no-connect');
    },
    makeTabConnected: function(){
        this.connectiontab.classList.remove('no-connect');
        this.connectiontab.classList.remove('connecting');
        this.connectiontab.classList.add('connected');
    },
    makeTabConnecting:function(){
        this.connectiontab.classList.remove('no-connect');
        this.connectiontab.classList.remove('connected');
        this.connectiontab.classList.add('connecting');
    },

    hendleFirstConnect: function(){
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