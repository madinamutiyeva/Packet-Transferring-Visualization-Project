const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const { saveGraphData, getGraphData } = require('./database/graphData');
const dijkstra = require('./server/utils');

const PORT = 4000;

app.use(cors());

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
