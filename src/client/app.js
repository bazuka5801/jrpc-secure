// создать подключение
var socket = new WebSocket('ws://localhost:8081');

function send(targetId, content) {
  socket.send(
    JSON.stringify({
      targetId,
      content,
    })
  );
}

// отправить сообщение из формы publish
document.forms.publish.onsubmit = function () {
  var targetId = this.targetId.value;
  var outgoingMessage = this.message.value;

  send(targetId, outgoingMessage);
  return false;
};

// показать сообщение в div#subscribe
function showMessage(message) {
  var messageElem = document.createElement('div');
  messageElem.appendChild(document.createTextNode(message));
  document.getElementById('subscribe').appendChild(messageElem);
}

// обработчик входящих сообщений
socket.onmessage = function (event) {
  const { from, content, target } = JSON.parse(event.data);
  showMessage(`[${from}] -> [${target}]: ${content}`);
};
