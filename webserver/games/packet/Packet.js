/**
 * @property {[string]} dataNames
 */
class Packet {

    constructor() {
        this.dataNames = [];
    }

    addData(name, value) {
        if(name === 'dataNames') {
            throw new Error('Illegal attribute name dataNames')
        }
        this.dataNames.push(name);
        this[name] = value;
    }

}


/**
 * @class SystemPacket
 * @extends Packet
 * @property {string} uid
 * @property {string} type
 * @property {Data} [data]
 */
class SystemPacket extends Packet {

    constructor(uid, type, data) {
        super();
        this.addData('uid', uid);
        this.addData('type', type);
        this.addData('data', data);
    }

}

/**
 * @class InPacket
 * @extends SystemPacket
 * @property {string} path
 */
class InPacket extends SystemPacket {

    /**
     * @param {string} uid
     * @param {string} type
     * @param {string} path
     * @param {Data} data
     */
    constructor(uid, type, path, data) {
        super(uid, type, data);
        this.addData('path', path);
    }

}

/**
 * @class OutPacket
 * @extends Packet
 * @property {string} type
 * @property {Data|null} data
 */
class OutPacket extends Packet {

    /**
     * @param {string} type
     * @param {Data} [data]
     */
    constructor(type, data) {
        super();
        this.addData('type', type);
        this.addData('data', data);
    }

    construct() {
        let data = {};
        for(let name of this.dataNames) {
            let value = this[name];
            if(value === null || value === undefined) {
                continue;
            }
            data[name] = this[name];
        }
        return JSON.stringify(data);
    }

}

class SyncPlayersPacket extends OutPacket {

    constructor(players) {
        super('sync', players.map(player => {
            let data = {};
            for (let x in player) {
                if(x === 'uid') {
                    continue;
                }
                data[x] = player[x];
            }
            return data;
        }));
    }

}

class JoinPacket extends OutPacket {

    constructor(room) {
        super('join', {room: room});
    }

}

/**
 * @class CookiePacket
 * @extends OutPacket
 * @property {Object.<string, string>} cookies
 */
class CookiePacket extends OutPacket {

    /**
     *
     * @param {Object.<string, string>} cookies
     */
    constructor(cookies) {
        super('cookies', {cookies: cookies});
    }

}

module.exports = {
    Packet,
    InPacket,
    SystemPacket,
    OutPacket,
    CookiePacket,
    JoinPacket,
    SyncPlayersPacket,
}
