/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * Keyboard class constructor
 *
 * @class Controls.Keyboard
 * @constructor
 */
var Controls = Controls || {};

Controls.Keyboard = function() {
    this.KEYS = {
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40
    };

    this.keyState = {};
    var _this = this;

    //Private methods called by the event listener
    this._onKeyDown = function (event) {
        event.preventDefault();
        return _this.processKeyDown(event);
    };
    this._onKeyUp = function (event) {
        return _this.processKeyUp(event);
    };

    //Creates the event listeners
    window.addEventListener('keydown', this._onKeyDown, false);
    window.addEventListener('keyup', this._onKeyUp, true);
};

Controls.Keyboard.prototype = {
    /**
     * Keep track when the key is down
     * @method Controls.Keyboard#processKeyDown
     * @param {object} event
     */
    processKeyDown: function(event) {
        this.keyState[event.keyCode] = true;
    },
    /**
     * Keep track when the key is up
     * @method Controls.Keyboard#processKeyUp
     * @param {object} event
     */
    processKeyUp: function(event) {
        this.keyState[event.keyCode] = false;
    },
    /**
     * Returns true if the key is down
     * @method Controls.Keyboard#isDown
     * @param {number} keycode
     * @return {boolean}
     */
    isDown: function (keyCode) {
        return this.keyState[keyCode] === true;
    }
};

Controls.Keyboard.prototype.constructor = Controls.Keyboard;
