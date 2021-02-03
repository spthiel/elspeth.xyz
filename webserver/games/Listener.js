/**
 * @callback ListenerCallback
 * @param {Data} data Data of the packet
 * @param {string} [uid] Uid of request user
 * @param {string} [path] Request path
 */

/**
 * @class Listener
 * @property {ListenerCallback} callback
 * @property {int} room
 * @property {string} type
 */
class Listener {

    /**
     * @param {string} type
     * @param {int} room
     * @param {function(data: Data, uid?: string, path?: string): void} callback
     */
    constructor(type, room, callback) {
        this.type = type;
        this.room = room;
        this.callback = callback;
    }


}

module.exports = Listener;
