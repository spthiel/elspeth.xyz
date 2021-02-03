/**
 * @typedef {Object.<string, any>} Data
 */

/**
 * @typedef ListenerCollection
 * @property {int} nextid id of the next listener
 * @property {Object.<int, Listener>} listeners dictionary of listener id to listener
 */

const {InPacket, SystemPacket, JoinPacket} = require("./packet/Packet")
const Listener = require("./Listener");
const DataHandler = require("./data/DataHandler");
const {SyncPlayersPacket, CookiePacket} = require("./packet/Packet");
const packetHandler = {};

/**
 * @type {Object.<string, ListenerCollection>}
 */
const listenerCollection = {};

/**
 * @param {SystemPacket|InPacket} packet
 */
function receive(packet) {

    let uid = packet.uid;
    let data = packet.data;
    let path = packet.path;
    let slot = packet.type;

    let room = DataHandler.getRoomOf(uid);

    if (!listenerCollection[slot]) {
        return;
    }

    let listeners = listenerCollection[slot].listeners;

    let caught = false;

    for (let id in listeners) {
        let listener = listeners[id];
        if(listener.room === -1 || listener.room === room) {
            listener.callback(data, uid, path);
            caught = true;
        }
    }

    if(!caught) {
        console.error("Uncaught packet: " + packet);
    }
}

/**
 * @param {Listener} listener
 */
function addEventListener(listener) {
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
function removeListener(type, id) {
    if(!listenerCollection[type]) {
        return false;
    }
    if(!listenerCollection[type]['listeners'][id]) {
        return false;
    }
    delete listenerCollection[type]['listeners'][id];
    return true;
}

// =========================================================================================
// System listeners
// =========================================================================================

function createRoom(uid) {
    let room = DataHandler.createRoom();
    join(uid, room);
    packetHandler.sendPacket(uid, new JoinPacket(room));
}

/**
 * @type {int}
 */
let lastId = 1;

addEventListener(new Listener('init', -1,(data, uid, path) => {
    if(path.match(/^\/werewolf\/?$/gi)) {
        createRoom(uid);
    } else {
        let room = path.match(/(?<=\/werewolf\/?)(\d+)/gi);
        if(room && room[0]) {
            join(uid, room[0]);
        } else {
            createRoom(uid);
        }
    }
}));

addEventListener(new Listener('setname', -1,(data, uid) => {
    console.log(data);
    if(!data.name) {
        return;
    }
    DataHandler.setName(uid, data.name)
        .then(
            player => {
                syncPlayersFor(uid);
            }
        )
        .catch(console.error);
}));

addEventListener(new Listener('start', -1,(data, uid) => {



}));


// TODO: Disconnect listener
// addEventListener(new Listener('disconnect', -1,(data, uid) => {
//     DataHandler.leaveRoom(uid);
//     syncPlayersFor(uid);
// }));

function syncPlayersFor(uid) {
    syncPlayersIn(DataHandler.getRoomOf(uid));
}

function syncPlayersIn(room) {

    let roomObj
    if(!room || !(roomObj = DataHandler.getRoom(room))) {
        return;
    }

    let players = roomObj.players;
    for (let player of players) {
        packetHandler.sendPacket(player.uid, new SyncPlayersPacket(players));
    }

}

function join(uid, room) {
    DataHandler.joinRoom(uid, room)
        .then(
            players => {
                if(!players){
                    createRoom(uid);
                } else {
                    for (let player of players) {
                        packetHandler.sendPacket(player.uid, new SyncPlayersPacket(players));
                    }
                }
            }
        );
}

// ==========================================================

let idIncrement = 0;
const maxIdIncrement = 0xfff;

/**
 * @returns {string}
 */
function generateID() {
    idIncrement++;
    if (idIncrement > maxIdIncrement) {
        idIncrement = 0;
    }
    return (BigInt(Date.now()) << 12n + BigInt(idIncrement++)).toString();
}

/**
 * @type {Object.<string, WebSocket>}
 */
const websocketMap = {};

packetHandler.sendPacketToAll = (room, packet) => {
    let roomObj
    if(!room || !(roomObj = DataHandler.getRoom(room))) {
        return;
    }

    let players = roomObj.players;
    for (let player of players) {
        packetHandler.sendPacket(player.uid, new SyncPlayersPacket(players));
    }
}

/**
 * @param {string} uid
 * @param {OutPacket} packet
 */
packetHandler.sendPacket = (uid, packet) => {
    if(websocketMap[uid]) {
        websocketMap[uid].send(packet.construct());
    }
}

/**
 *
 * @param {WebSocket} websocket
 * @param {{uid?: string, type?: string, path: string, data?: Data}} message
 */
packetHandler.receiveMessage = (websocket, message) => {

    if(!message.uid) {
        let uid = generateID();
        message.uid = uid;
        websocket.send(new CookiePacket({uid: uid}).construct());
    }

    websocketMap[message.uid] = websocket;

    if(!message.type) {
        websocket.send("{\"error\": \"Missing type in request\"}");
        return;
    }

    receive(new InPacket(message.uid, message.type, message.path, message.data));
}

/**
 *
 * @param {WebSocket} websocket
 */
packetHandler.receiveClose = (websocket) => {
    let uid;
    for (let pid in websocketMap) {
        if(websocketMap[pid] === websocket) {
            uid = pid;
        }
    }
    receive(new SystemPacket(uid,'disconnect', '/'))
}

module.exports = {
    removeListener,
    addEventListener,
    receive,

    packetHandler

}
