TIME = {
    now: function(){
        return new Date();
    },

    format12h: function(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        if (hours > 12) {
          hours -= 12;
        } else if (hours === 0) {
          hours = 12;
        }
        return hours + ':' + minutes;
      }
}
const notificationSoundInput = document.getElementById('notification-volume-input');
notificationSoundInput.addEventListener('change', ()=>{
  document.getElementById('notification-sound').volume = notificationSoundInput.value;
  ROOM.ringNotification();
})

window.onload = async function() {
  const username = localStorage.getItem('username');
  const roomId = localStorage.getItem('roomId');
  const autoJoin = localStorage.getItem('autoJoin');
  if(username && roomId && autoJoin == 'true'){
    document.getElementById('username-input').value = username;
    document.getElementById('roomid-input').value = roomId;
    ROOM.join(username, roomId, autoJoin);
  }
};

