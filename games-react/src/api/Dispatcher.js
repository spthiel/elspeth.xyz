/**
 * @typedef ListenerCollection
 * @property {int} nextid id of the next listener
 * @property {Object.<int, Listener>} listeners dictionary of listener id to listener
 */

import {setCookie} from "./Cookie";
import {Listener} from "./Listener";
import {SetNamePacket} from "./Packets";

/**
 * @type {Object.<string, ListenerCollection>}
 */
const listenerCollection = {};

/**
 * @param {Listener} listener
 */
export function addEventListener(listener) {
    let type = listener["type"];
    if(!listenerCollection[type]) {
        listenerCollection[type] = {'nextid': 1, 'listeners': {}}
    }
    let id = listenerCollection[type]['nextid']++;
    listenerCollection[type]['listeners'][id] = listener;
    return id;
}

/**
 * @param {string} type
 * @param {int} id
 * @return {boolean}
 */
export function removeListener(type, id) {
    if(!listenerCollection[type]) {
        return false;
    }
    if(!listenerCollection[type]['listeners'][id]) {
        return false;
    }
    delete listenerCollection[type]['listeners'][id];
    return true;
}

/**
 * @param {InPacket} packet
 */
export function receive(packet) {
    let data = packet.data;
    let slot = packet.type;

    if (!listenerCollection[slot]) {
        return;
    }

    let listeners = listenerCollection[slot].listeners;

    let caught = false;

    for (let id in listeners) {
        let listener = listeners[id];
        listener.callback(data);
        caught = true;
    }

    if(!caught) {
        console.error("Uncaught packet: " + packet);
    }
}

// =========================================================================================
// System listeners
// =========================================================================================

addEventListener(new Listener('cookies', (data) => {
    receiveCookies(data.cookies);
}))

addEventListener(new Listener('join', (data) => {
    window.history.replaceState('games', 'Werewolf', '/games/' + data.room);
}));

// =========================================================================================

function receiveCookies(cookies) {
    for (let x in cookies) {
        setCookie(x, cookies[x], 365);
    }
}

let ws;

/**
 * @param {WebSocket} websocket
 */
export function setSocket(websocket) {
    ws = websocket;
}

export function setName(name) {
    sendData(new SetNamePacket(name))
}

/**
 * @param {OutPacket} packet
 */
export function sendData(packet) {
    ws.send(packet.construct());
}
