document.addEventListener('DOMContentLoaded', function() {
  const socket = io()
  const messageContainer = document.getElementById('message-container')
  const nameInput = document.getElementById('name-input')
  const messageForm = document.getElementById('message-form')
  const messageInput = document.getElementById('message-input')
  const messageTone = new Audio('/message-tone.mp3')
  const sender = document.getElementById('sender')
  const receiver = document.getElementById('receiver')
  let dataToSend = {}
  let data = {};
  
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage_toDb()
    sendMessage()
  })
  
  function sendMessage() {
    if (messageInput.value === '') return
    // console.log(messageInput.value)
    const data = {
      name: nameInput.value,
      message: messageInput.value,
      dateTime: new Date(),
    }
    socket.emit('message', data)
    addMessageToUI(true, data)
    messageInput.value = ''
  }
  function sendMessage_toDb() {
    const senderId = document.getElementById('sender').value;
    const receiverId = document.getElementById('receiver').value;
    const messageText = document.getElementById('message-input').value.trim(); // Используем trim() для удаления лишних пробелов
  
    if (messageText === '') return;
  
    if (!dataToSend[senderId]) {
      dataToSend[senderId] = {};
    }
  if (!dataToSend[senderId][receiverId]) {
      dataToSend[senderId][receiverId] = []; 
    }
  
    dataToSend[senderId][receiverId].push(messageText);
  
    fetch('http://localhost:4000/save-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => {
      if (response.ok) {
        console.log('Message sent successfully.');
       // console.log(dataToSend);
      } else {
        console.error('Failed to send message.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  async function getMessage(newSenderId, newReceiverId) {
    try {
      const response = await fetch(`http://localhost:4000/get-messages?sender=${newSenderId}&receiver=${newReceiverId}`);
      if (response.ok) {
        const messages = await response.json();
        //console.log(newSenderId, newReceiverId);
       console.log(messages);
          messages.forEach((message, index) => {
          const IdSender = Object.keys(message)[0];
          const IdReceiver = Object.keys(message[IdSender])[0];
          const messageText = message[IdSender][IdReceiver];
          if (!data[IdSender]) {
            data[IdSender] = {};
          }
          if (!data[IdSender][IdReceiver]) {
            data[IdSender][IdReceiver] = [];
          }
  
          data[IdSender][IdReceiver].push(messageText);
        });
  
        //console.log(data[newSenderId][newReceiverId]);
        return data[newSenderId][newReceiverId];
      } else {
        console.error('Failed to get messages');
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
  
  socket.on('chat-message', (data) => {
    messageTone.play()
    addMessageToUI(false, data)
  })
  
  function addMessageToUI(isOwnMessage, data) {
    clearFeedback()
    const element = `
        <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
            <p class="message">
              ${data.message}
              <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
            </p>
        </li>
          `
  
    messageContainer.innerHTML += element
    scrollToBottom()
  }
  
  function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
  }
  
  messageInput.addEventListener('focus', (e) => {
    socket.emit('feedback', {
      feedback: `✍️ ${nameInput.value} is typing a message`,
    })
  })
  
  messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
      feedback: `✍️ ${nameInput.value} is typing a message`,
    })
  })
  messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
      feedback: '',
    })
  })
  
  sender.addEventListener('change', async () => {
    nameInput.value = sender.value;
    await updateMessages(sender.value, receiver.value);
  });
  
  receiver.addEventListener('change', async () => {
    await updateMessages(sender.value, receiver.value);
  });
  
  async function updateMessages(senderId, receiverId) {
    try {
      const messages = await getMessage(senderId, receiverId);
      console.log(messages);
      messageContainer.innerHTML = '';
      clearData(); // Очистка объекта data перед добавлением новых данных
      await refreshMessages(senderId, receiverId, messages);
    } catch (error) {
      console.error('Error updating messages:', error);
    }
  }
  
  function clearData() {
    data = {};
  }
  
  
  async function refreshMessages(senderId, receiverId, messages) {
    try {
      if (!messages || messages.length === 0) {
        console.log('No messages found for the specified sender and receiver.');
        return;
      }
  
      messages.forEach((messageText, index) => {
        const isOwnMessage = true;
        const messageData = {
          message: messageText,
          name: '',
          dateTime: new Date(),
        };
        addMessageToUI(isOwnMessage, messageData);
      });
  
      scrollToBottom();
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  }
  
  
  socket.on('feedback', (data) => {
    clearFeedback()
    const element = `
          <li class="message-feedback">
            <p class="feedback" id="feedback">${data.feedback}</p>
          </li>
    `
    messageContainer.innerHTML += element
  })
  
  function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
      element.parentNode.removeChild(element)
    })
  }
  })
  
  