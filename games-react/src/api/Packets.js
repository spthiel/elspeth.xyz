/**
 * @typedef {Object.<string, any>} Data
 */

import {getCookie} from "./Cookie";

/**
 * @property {[string]} dataNames
 */
export class Packet {

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
 * @property {string} type
 * @property {Data} [data]
 */
export class SystemPacket extends Packet {

    /**
     * @param {string} type
     * @param {Data} data
     */
    constructor(type, data) {
        super();
        this.addData('type', type);
        this.addData('data', data);
    }

}

/**
 * @class InPacket
 * @extends SystemPacket
 * @property {string} path
 */
export class InPacket extends SystemPacket {

    /**
     * @param {string} type
     * @param {Data} data
     */
    constructor(type, data) {
        super(type, data);
    }

}

/**
 * @class OutPacket
 * @extends Packet
 * @property {string} type
 * @property {Data|null} data
 */
export class OutPacket extends Packet {

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
        data.uid = getCookie("uid");
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

/**
 * @class SetNamePacket
 * @extends OutPacket
 */
export class SetNamePacket extends OutPacket {

    constructor(name) {
        super('setname', {name: name});
    }

}

/**
 * @class SetNamePacket
 * @extends OutPacket
 */
export class InitPacket extends OutPacket {

    constructor() {
        super('init', {});
    }

}
