/**
 * @callback ListenerCallback
 * @param {Data} data Data of the packet
 */

/**
 * @class Listener
 * @property {ListenerCallback} callback
 * @property {string} type
 */
export class Listener {

    /**
     * @param {string} type
     * @param {function(data: Data): void} callback
     */
    constructor(type, callback) {
        this.type = type;
        this.callback = callback;
    }


}
