import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8080
});

wss.on('connection', function connection(ws: WebSocket) {
  ws.send("Connected to ws on port 8080");
  ws.on('message', function message(data) {
    console.log("received data: ", data);
  })
});
