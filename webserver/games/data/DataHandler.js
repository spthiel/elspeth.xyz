/**
 * @typedef {string} PlayerUID
 */

/**
 * @typedef Room
 * @property {Array.<Player>} players Players of the room
 */

/**
 * A player object
 * @typedef Player
 * @property {PlayerUID} uid Uid of the player
 * @property {int} [room] Room of the player
 * @property {string} [name] Display name of the player
 * @property {int} fid Frontend ID
 * @property {boolean} [admin] Whether the player is admin of the room
 * @property {inactive} [inactive] Whether the player is inactive
 */

const BUILDENV = require("../../AppConstants").build
const mysql = require("mysql");

const SQLAUTH = require("./auth.json");

if (!BUILDENV) {
    SQLAUTH.password = SQLAUTH.passworddev || SQLAUTH.password;
}

const connection = mysql.createPool(SQLAUTH);

connection.query("CREATE TABLE IF NOT EXISTS users (fid int auto_increment not null, uid varchar(20), name varchar(20), primary key(fid))");

/**
 * @type {Object.<int, Room>}
 */
let rooms = {};

/**
 * @type {Object.<string, Player>}
 */
let players = {};

/**
 * @returns {number} Random 5 digit number
 */
function generateRoomNumber() {
    return (Math.random() * 90000 + 10000) | 0;
}

function getUser(uid) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT fid, uid, name FROM users WHERE uid = " + mysql.escape(uid), (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

function createUser(uid) {
    return new Promise((resolve, reject) => {
        connection.query("INSERT INTO users (uid) VALUES (" + mysql.escape(uid) + ")", (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}


function updateName(uid, name) {
    return new Promise((resolve, reject) => {
        connection.query("UPDATE users SET name = " + mysql.escape(name) + " WHERE uid = " + mysql.escape(uid), (err, res) => {
            console.log(err, res);
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

/**
 *
 * @param {int} room
 * @param {boolean} reassignAdmin
 */
function checkDisabled(room, reassignAdmin) {
    let theRoom = rooms[room];
    for (let player of theRoom.players) {
        if (!player.inactive) {
            if (reassignAdmin) {
                player.admin = true;
            }
            return;
        }
    }
    for (let player of theRoom.players) {
        delete players[player.uid];
    }
    delete rooms[room];
}

module.exports = {

    createRoom() {

        let room;

        do {
            room = generateRoomNumber();
        } while (rooms[room])

        rooms[room] = {'players': []};

        return room;
    },

    /**
     *
     * @param {PlayerUID} uid
     * @param {string|int} room
     * @returns {Promise<boolean | []>}
     */
    joinRoom(uid, room) {

        return this.updatePlayer(uid)
            .then(
                player => {
                    if (typeof room === "string") {
                        try {
                            room = parseInt(room);
                        } catch (e) {
                            return false;
                        }
                    }

                    if (!rooms[room]) {
                        return false;
                    }

                    if (player.room !== room) {

                        if (player.room) {
                            this.leaveRoom(player.uid);
                        }

                        let roomObj = rooms[room];
                        if (roomObj.players.length === 0) {
                            player.admin = true;
                        } else {
                            player.admin = false;
                        }
                        rooms[room].players.push(player);
                        player.room = room;
                    }

                    let out = [];

                    for (let player of rooms[room].players) {
                        out.push(player);
                    }

                    return out;
                }
            )
    },

    /**
     *
     * @param {PlayerUID} uid
     */
    leaveRoom(uid) {

        const player = players[uid];

        const room = player.room;
        if (!room) {
            return;
        }

        let roomObj = rooms[room];
        let reassignAdmin = false;

        if (player.admin) {
            reassignAdmin = true;
        }

        let index = roomObj.players.indexOf(player);
        roomObj.players.splice(index, 1);

        checkDisabled(player.room, reassignAdmin);
    },

    close(uid) {
        let player = players[uid];
        player.inactive = true;
        if (player.admin) {
            player.admin = false;
            checkDisabled(player.room, true);
        } else {
            checkDisabled(player.room, false);
        }
    },

    /**
     *
     * @param uid
     * @returns {Promise<Player>}
     */
    updatePlayer(uid) {
        if (players[uid]) {
            return Promise.resolve(players[uid]);
        }
        return getUser(uid)
            .then(result => result.length === 0 ? createUser(uid) : result)
            .then(
                result => {
                    players[uid] = {};
                    players[uid].uid = uid;
                    players[uid].fid = result.insertId || (result[0] && result[0].fid);
                    players[uid].name = (result[0] && result[0].name) || "----";
                    console.log(result);
                    return players[uid];
                }
            )
            .catch(console.err);
    },

    setName(uid, name) {
        return this.updatePlayer(uid)
            .then(player => [player, updateName(uid, name)])
            .then(([player, response]) => {
                player.name = name;
                return player;
            });
    },

    getPlayersIn(room) {
        if (rooms[room]) {
            return rooms[room].players;
        }
        return [];
    },

    getRoomOf(uid) {
        return players[uid] && players[uid].room;
    },

    getRoom(room) {
        return rooms[room];
    }

};
