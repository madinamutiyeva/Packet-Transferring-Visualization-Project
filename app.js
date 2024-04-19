
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const { saveGraphData, getGraphData } = require('./database/graphData');
const dijkstra = require('./server/utils');

const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

let socketsConnected = new Set();

io.on('connection', onConnected);

function onConnected(socket) {
  console.log('Socket connected', socket.id);
  socketsConnected.add(socket.id);
  io.emit('clients-total', socketsConnected.size);

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
    socketsConnected.delete(socket.id);
    io.emit('clients-total', socketsConnected.size);
  });

  socket.on('message', (data) => {
    socket.broadcast.emit('chat-message', data);
  });

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data);
  });
}

app.post('/save-graph', async (req, res) => {
  try {
    const graphData = req.body;
    console.log(graphData);
    await saveGraphData(graphData);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving graph data:', error);
    res.sendStatus(500);
  }
});

app.get('/get-graph', async (req, res) => {
  try {
    const graphData = await getGraphData();
    res.json(graphData); 
  } catch (error) {
    console.error('Error retrieving graph data:', error);
    res.sendStatus(500);
  }
});

app.post('/shortest-path', async (req, res) => {
  try {
    const { graph, source, target } = req.body;
    const shortestPath = dijkstra(graph, source, target);
    res.json(shortestPath);
  } catch (error) {
    console.error('Error calculating shortest path:', error);
    res.sendStatus(500);
  }
});
const { saveChatMessage, getChatMessages } = require('./database/messages.js');

app.post('/save-message', async (req, res) => {
  try {
    const messageData = req.body;
    await saveChatMessage(messageData);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.sendStatus(500);
  }
});
// app.get('/get-messages', async (req, res) => {
//   try {
//     const chatMessages = await getChatMessages();
//     console.log(chatMessages, 'test');
//     const senderId = req.query.sender; // Получатель из запроса
//     const receiverId = req.query.receiver; // Отправитель из запроса

//     // Проверяем наличие сообщений для данного получателя и отправителя
//     if (chatMessages[receiverId] && chatMessages[receiverId][senderId]) {
//       // Если сообщения существуют, отправляем их в ответе
//       res.json(chatMessages[receiverId][senderId]);
//     } else {
//       // Если сообщений нет, отправляем пустой массив
//       res.json([]);
//     }
//   } catch (error) {
//     console.error('Error retrieving chat messages:', error);
//     res.sendStatus(500);
//   }
// });

app.get('/get-messages', async (req, res) => {
  try {
    const senderId = req.query.sender; // Получатель из запроса
    const receiverId = req.query.receiver; // Отправитель из запроса

    // Retrieve messages directly without checking
    const chatMessages = await getChatMessages();

    // If messages exist for the specified sender and receiver, send them in the response
    if (chatMessages[receiverId] && chatMessages[receiverId][senderId]) {
      res.json(chatMessages[receiverId][senderId]);
    } else {
      // If no messages found, send an empty array
      res.json([]);
    }
  } catch (error) {
    console.error('Error retrieving chat messages:', error);
    res.sendStatus(500); // Send internal server error status
  }
});

