require('./gamestates/GameState');
const datahandler = require('../data/DataHandler');

class Game {

    /**
     * @type {WaitingState}
     */
    gamestate = new WaitingState();

    /**
     *
     * @param {int} room Room id
     */
    constructor(room) {
        this.settings = [

        ];

    }

}

/**
 *
 * @param {int} room Room id
 * @returns {Game}
 */
function setup(room) {
    return new Game(room);
}
