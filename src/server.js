/* eslint-disable no-restricted-syntax */
const WebSocketServer = new require('ws');
const { v4: uuidv4 } = require('uuid');

// Подключенные клиенты { id: {name, net } }
var clients = {};

var webSocketServer = new WebSocketServer.Server({
  port: 8081,
});

function sendMessage(target, from, content, broadcast = false) {
  if (clients[target])
    clients[target].net.send(
      JSON.stringify({
        target: broadcast ? 'All' : target,
        from,
        content,
      })
    );
}

webSocketServer.on('connection', (ws) => {
  var id = uuidv4();
  clients[id] = {
    net: ws,
  };
  console.log(`New connection ${id}`);
  sendMessage(id, 'SERVER', `Your id is ${id}`);

  ws.on('message', (message) => {
    const { targetId, content } = JSON.parse(message);
    console.log(`received message from ${id}`);
    if (targetId === '-1') {
      for (const key of Object.keys(clients))
        sendMessage(key, id, content, true);
    } else {
      sendMessage(targetId, id, content);
    }
  });

  ws.on('close', () => {
    console.log(`Disconnected ${id}`);
    delete clients[id];
  });
});
