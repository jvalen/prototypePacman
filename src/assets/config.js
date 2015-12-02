/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * PrototypePacman configuration
 *
 * Setup the board maze, player, ghosts and text features
 */
var PrototypePacman = PrototypePacman || {};

PrototypePacman.config = {
    boardOptions: {
        colors: {
            wall: ['red', 'yellow', 'blue', 'orange'],
            walkable: 'black',
            ghostStart: 'green',
            boundary: 'slategray',
            walked: 'white'
        },
        tileAmount: {
            row: 25,
            column: 25
        },
        tileSize: { //Pixels
            width: 30,
            height: 30
        },
        tileOffset: { //Offset from the origin, in pixels
            x: 30,
            y: 30
        },
        layout: {
            random: false,
            static: PrototypePacman.staticBoard
        },
        tunnels: false
    },
    playerOptions: {
        size: { width: 30, height: 30 },
        color: '#B3B3B3',
        innerColor: '#757575',
        speed: 3
    },
    ghostOptions: [
        {
            size: { width: 30, height: 30 },
            center: { x: 2 * 30, y: 2 * 30},
            color: 'pink',
            speed: 2
        },
        {
            size: { width: 30, height: 30 },
            center: { x: 24 * 30, y: 2 * 30},
            color: 'cyan',
            speed: 2
        },
        {
            size: { width: 30, height: 30 },
            center: { x: 2 * 30, y: 12 * 30},
            color: 'darksalmon',
            speed: 2
        },
        {
            size: { width: 30, height: 30 },
            center: { x: 24 * 30, y: 12 * 30},
            color: 'lawngreen',
            speed: 2
        }
    ],
    text: {
        en: {
            win: {
                title: 'PROTO-PAC WINS!',
                description: 'Congratulations!'
            },
            lose: {
                title: 'GHOSTS WIN!',
                description: 'ProtoPac has been eaten by a grue :S'
            }
        }
    },
    socket: {
        active: false,
        machineLearning: false,
        multiplayer: false,
        maxPlayers: 5,
        playersData: [
            {color: '#B3B3B3', role: 'player'},
            {color: 'pink', role: 'ghost'},
            {color: 'cyan', role: 'ghost'},
            {color: 'darksalmon', role: 'ghost'},
            {color: 'lawngreen', role: 'ghost'}
        ],
        multiplayerData: null,
        address: 'ws://127.0.0.1:9000'
    }
};
