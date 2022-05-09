const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input[name="message"]');
const $messageFormSubmitInput = $messageForm.querySelector('input[type="submit"]');
const $sendLocationButton = document.querySelector('#send-location');
const $messagesContainer = document.querySelector('#messages-container');

const socket = io();

const urlParams = new URLSearchParams(location.search);
socket.emit('joinRoom', urlParams.get('username'), urlParams.get('room'), (error) => {
    alert(error);
    location.href = '/';
});

const notificationTemplate = 
    `<div class="chat__notification">
        <p>__MESSAGE__</p>
    </div>`;

socket.on('notification', (notification) => {
    const messageHTML = notificationTemplate.replace('__MESSAGE__', notification);

    $messagesContainer.innerHTML += messageHTML;
});

const messageTemplate = 
    `<div class="chat__message">
        <p><strong>__AUTHOR__</strong> <small>__DATE__</small></p>
        <p>__MESSAGE__</p>
    </div>`;

socket.on('message', (message) => {
    let messageHTML = messageTemplate.replace('__MESSAGE__', message.message);
    messageHTML = messageHTML.replace('__AUTHOR__', message.author);

    let formatedDate = new Date(message.date).toLocaleString();
    messageHTML = messageHTML.replace('__DATE__', formatedDate);

    $messagesContainer.innerHTML += messageHTML;
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = $messageFormInput.value;
    $messageFormInput.value = '';

    // Disable form
    $messageFormSubmitInput.setAttribute('disabled', 'disabled');

    socket.emit('sendMessage', message, () => {
        // Enable form
        $messageFormSubmitInput.removeAttribute('disabled');
    });
});

$sendLocationButton.addEventListener('click', function() {
    this.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser');
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const cordinates = position.coords;
        const lat = cordinates.latitude;
        const lng = cordinates.longitude;

        socket.emit('sendLocation', lat, lng, () => {
            this.removeAttribute('disabled');
        });
    });
});
