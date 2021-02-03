import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {receive, sendData, setSocket} from "./api/Dispatcher";
import {InitPacket, InPacket} from "./api/Packets";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

const ws = new WebSocket((window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host + window.location.pathname, ['json']);

setSocket(ws);

ws.addEventListener('open', () => {
    sendData(new InitPacket());
});

ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    console.log(message);
    if (message.error) {
        console.error(message.error);
        return;
    }
    if(!message.type) {
        console.error("Invalid request from server");
        ws.close();
        return;
    }
    receive(new InPacket(message.type, message.data));
});
