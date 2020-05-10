// создать подключение
var socket = new WebSocket('ws://localhost:8081');

function sendRpc(target, method, ...args) {
  socket.send(
    JSON.stringify({
      target,
      rpcData: {
        method,
        args,
      },
    })
  );
}

// отправить сообщение из формы publish
document.forms.publish.onsubmit = function () {
  var targetId = this.targetId.value;
  var outgoingMessage = this.message.value;

  sendRpc(targetId, 'message', outgoingMessage);
  return false;
};

// показать сообщение в div#subscribe
function showMessage(message) {
  var messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}

function RPC_message(ctx, content) {
  showMessage(`[${ctx.from}] -> [${ctx.target}]: ${content}`);
}

function RPC_serverHello(ctx, id) {
  showMessage(`Server say hello, your id ${id}`);
}

function callRpc(ctx, method, args) {
  switch (method) {
    case 'server_hello':
      RPC_serverHello(ctx, ...args);
      break;
    case 'message':
      RPC_message(ctx, ...args);
      break;
    default:
      break;
  }
}

// обработчик входящих сообщений
socket.onmessage = function (event) {
  const { target, from, rpcData } = JSON.parse(event.data);
  callRpc(
    {
      target,
      from,
    },
    rpcData.method,
    rpcData.args
  );
};
