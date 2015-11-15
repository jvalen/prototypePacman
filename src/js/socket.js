/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * Socket class constructor
 *
 * @class Network.Socket
 * @constructor
 */
var Network = Network || {};

Network.Socket = function(address) {
    this.socket = new WebSocket(address);
    this.socket.binaryType = "arraybuffer";

    this.socket.onopen = function() {
        this.isopen = true;
        console.log("Connected!");
    }

    this.socket.onmessage = function(e) {
        if (typeof e.data == "string") {
            console.log("Text message received: " + e.data);
        }
    }

    this.socket.onclose = function(e) {
        console.log("Connection closed.");
        this.socket = null;
        this.isopen = false;
    }
};

Network.Socket.prototype = {
    send: function(data, type) {
        if (this.socket.isopen) {
            switch(type) {
                case 'json':
                    this.socket.send(JSON.stringify(data));
                    break;
                case 'string':
                    this.socket.send(data);
                    break;
            }
        } else {
            console.log("Connection not opened.")
        }
    }
};

Network.Socket.prototype.constructor = Network.Socket;
