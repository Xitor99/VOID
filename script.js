
const joinScreen = document.getElementById('join-screen');
const roomScreen = document.getElementById('room-screen');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCode = document.getElementById('roomCode');
const roomIdDisplay = document.getElementById('roomIdDisplay');
const copyRoomId = document.getElementById('copyRoomId');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');
const videoGrid = document.getElementById('videoGrid');
const toggleMicBtn = document.getElementById('toggleMic');
const toggleCameraBtn = document.getElementById('toggleCamera');
const toggleScreenBtn = document.getElementById('toggleScreen');

let localStream = null;
let screenStream = null;
let isMicOn = true;
let isCameraOn = true;
let currentRoom = null;


async function initLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        const container = document.createElement('div');
        container.id = 'container-me';
        container.className = 'video-container';
        
        const video = document.createElement('video');
        video.id = 'video-me';
        video.srcObject = localStream;
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        
        const label = document.createElement('div');
        label.className = 'video-label';
        label.textContent = 'Вы';
        
        container.appendChild(video);
        container.appendChild(label);
        videoGrid.appendChild(container);
        
        return localStream;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Нет доступа к камере/микрофону');
    }
}

createRoomBtn.addEventListener('click', () => {
    currentRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    roomIdDisplay.textContent = currentRoom;
    joinScreen.classList.remove('active');
    roomScreen.classList.add('active');
    initLocalStream();
});


joinRoomBtn.addEventListener('click', () => {
    const roomId = roomCode.value.trim().toUpperCase();
    if (roomId) {
        currentRoom = roomId;
        roomIdDisplay.textContent = roomId;
        joinScreen.classList.remove('active');
        roomScreen.classList.add('active');
        initLocalStream();
    } else {
        alert('Введите код комнаты');
    }
});

copyRoomId.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoom);
    alert('Код скопирован!');
});


leaveRoomBtn.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }
    videoGrid.innerHTML = '';
    roomScreen.classList.remove('active');
    joinScreen.classList.add('active');
    currentRoom = null;
});


toggleMicBtn.addEventListener('click', () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            isMicOn = !isMicOn;
            audioTrack.enabled = isMicOn;
            toggleMicBtn.classList.toggle('active');
            toggleMicBtn.textContent = isMicOn ? '🎤' : '🔇';
        }
    }
});


toggleCameraBtn.addEventListener('click', () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            isCameraOn = !isCameraOn;
            videoTrack.enabled = isCameraOn;
            toggleCameraBtn.classList.toggle('active');
            toggleCameraBtn.textContent = isCameraOn ? '📹' : '🚫';
        }
    }
});


toggleScreenBtn.addEventListener('click', async () => {
    try {
        if (!screenStream) {
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            
            const video = document.querySelector('#container-me video');
            if (video) {
                video.srcObject = screenStream;
            }
            
            toggleScreenBtn.classList.add('active');
            
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenSharing();
            };
        } else {
            stopScreenSharing();
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
});

function stopScreenSharing() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
        
        const video = document.querySelector('#container-me video');
        if (video && localStream) {
            video.srcObject = localStream;
        }
        
        toggleScreenBtn.classList.remove('active');
    }

}
