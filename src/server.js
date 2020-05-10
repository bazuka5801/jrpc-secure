/* eslint-disable no-restricted-syntax */
const WebSocketServer = new require('ws');
const { v4: uuidv4 } = require('uuid');

// Подключенные клиенты { id: {name, net } }
var clients = {};

var webSocketServer = new WebSocketServer.Server({
  port: 8081,
});

function sendRpc(target, from, method, ...args) {
  if (clients[target])
    clients[target].net.send(
      JSON.stringify({
        target,
        from,
        rpcData: {
          method,
          args,
        },
      })
    );
}

function sendRpcBroadcast(target, from, method, ...args) {
  if (clients[target])
    clients[target].net.send(
      JSON.stringify({
        target: -1,
        from,
        rpcData: {
          method,
          args,
        },
      })
    );
}

webSocketServer.on('connection', (ws) => {
  var id = uuidv4();
  clients[id] = {
    net: ws,
  };
  console.log(`New connection ${id}`);
  sendRpc(id, 'SERVER', 'server_hello', id);

  ws.on('message', (message) => {
    const { target, rpcData } = JSON.parse(message);
    console.log(`received message from ${id}`);
    if (target === '-1') {
      for (const key of Object.keys(clients))
        sendRpcBroadcast(key, id, rpcData.method, rpcData.args);
    } else {
      sendRpc(target, id, rpcData.method, rpcData.args);
    }
  });

  ws.on('close', () => {
    console.log(`Disconnected ${id}`);
    delete clients[id];
  });
});
