const ROOM = {
    mqttClient: null,
    username: null,
    roomId: null,
    connected: false,
    topic: 'MovieSync',
    connectioTab: document.getElementById('connection-tab'),

    join: function(user, roomid){
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
        this.mqttClient.on('close', function(){
            hendleDisconnect();
        });
        this.mqttClient.on('message', function (topic, message){
            hendleMessage(message.toString());
        });
    },

    hendleConnect: function (){
        if(!this.connected){
            this.hendleFirstConnect();
        }
        this.connected = true;
        this.makeTabConnected();
    },
    
    makeTabConnected: function(){
        this.connectioTab.classList.remove('no-connect');
        this.connectioTab.classList.remove('connecting');
        this.connectioTab.classList.add('connected');
    },
    makeTabConnecting:function(){
        this.connectioTab.classList.remove('no-connect');
        this.connectioTab.classList.remove('connected');
        this.connectioTab.classList.add('connecting');
    },

    hendleFirstConnect: function(){
        document.getElementById('video-title-id').classList.add('connected-title')
        document.getElementById('username-label-tab').textContent = this.username;
        document.getElementById('roomid-label-tab').textContent = this.roomId;
    },

    leave: function(){
        this.mqttClient.end();
    }

}
const joinRoomBtn = document.getElementById('join-room-btn');
joinRoomBtn.addEventListener('click', ()=>{
    joinRoom()
})

function  joinRoom(){
    const username = document.getElementById('username-input').value;
    const roomId = document.getElementById('roomid-input').value;
    console.log(username, roomId)
    ROOM.join(username, roomId);
}