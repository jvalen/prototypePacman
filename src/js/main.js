/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * PrototypePacman is a basic maze game like based in Pacman
 *
 * @class PrototypePacman.Game
 * @constructor
 * @param {object} canvasId
 */
;(function() {
    var Game = function() {
        //Show the main menu
        Utils.changeHashTag('main-menu', false);
    };
    Game.prototype = {
        /**
         * start the app
         * @method PrototypePacman.Game#start
         */
        start: function(canvasId, type) {
            Utils.changeHashTag('', false);
            this.hideMenu('main-menu');
            this.canvasId = canvasId;

            //Options
            switch(type) {
                case 'single':
                    this.initGame(canvasId);
                    break;
                case 'lan':
                    PrototypePacman.config.socket.active = true;
                    PrototypePacman.config.socket.playerMovesFromServer = false;
                    PrototypePacman.config.socket.multiplayer = true;
                    this.socket = new Network.Socket(PrototypePacman.config.socket.address);
                    this.waitingForPlayers();
                    break;
                case 'learning':
                    PrototypePacman.config.socket.active = true;
                    PrototypePacman.config.socket.playerMovesFromServer = true;
                    this.socket = new Network.Socket(PrototypePacman.config.socket.address);
                    this.initGame(canvasId);
                    break;
            }
        },
        /**
         * Init the game
         * @method PrototypePacman.Game#initGame
         * @param {string} canvasId
         */
        initGame: function(canvasId) {
            var canvas = document.getElementById(canvasId),
                screen = canvas.getContext('2d'),
                gameSize = { width: canvas.width, height: canvas.height },
                boardOptions = PrototypePacman.config.boardOptions;

            //Default locale
            this.lang = 'en';

            //Create board maze
            boardOptions.gameSize = gameSize;
            this.board = new PrototypePacman.Board(screen, boardOptions);

            //Create player
            var playerOptions = PrototypePacman.config.playerOptions;
            playerOptions.center = this.board.getPlayerInitialPosition();
            this.player = new PrototypePacman.Player(this, playerOptions);

            //Create ghosts
            var ghostOptions = PrototypePacman.config.ghostOptions;
            this.ghosts = this.createGhosts(this, ghostOptions);

            //Game state
            this.gameScreenshot = this.getGameScreenshot();
            this.gameState = 'playing';

            var self = this;

            var tick = function(){
                self.update();
                self.draw(screen, gameSize);
                requestAnimationFrame(tick);
            };

            tick();
        },
        /**
         * Wait for players in multiplayer mode
         * @method PrototypePacman.Game#waitingForPlayers
         */
        waitingForPlayers: function() {
            var self = this;

            Utils.changeHashTag('waiting-players', false);

            this.pollingPlayers = setInterval(function() {
                var data = self.socket.dataReceived,
                    action = {
                        action: 'waiting',
                        playersSetup: {
                            'attributes': PrototypePacman.config.socket.playersData,
                            'maxPlayers': PrototypePacman.config.socket.maxPlayers
                        }

                    },
                    maxPlayers = PrototypePacman.config.socket.maxPlayers;

                if (!!data) {
                    if (data.length >= 0) {
                        //Show players
                        self.showIncomingPlayers(data, maxPlayers);
                    }
                    if (data.length == maxPlayers) {
                        //Remove interval and show button to start to play
                        PrototypePacman.config.socket.multiplayerData = {
                            playersCount: maxPlayers
                        };
                        Utils.removeClass(document.getElementById('button-ready-multiplayer'), 'hide');
                    } else {
                        Utils.addClass(document.getElementById('button-ready-multiplayer'), 'hide');
                    }
                }

                self.socket.send(action, 'json');
            }, 300);
        },
        /**
         * Move forward after the player have been selected
         * @method PrototypePacman.Game#update
         */
        playersReady: function(canvasId) {
            clearInterval(this.pollingPlayers);
            Utils.changeHashTag('',false);
            this.initGame(this.canvasId);
        },
        /**
         * Show ready players in the menu
         * @method PrototypePacman.Game#update
         */
        showIncomingPlayers: function(playersData, maxPlayers) {
            var ul = document.getElementById('ul-waiting-players'),
                ulBoard = document.getElementById('ul-players'),
                availableSpots = maxPlayers - playersData.length,
                spotsBlock = document.getElementById('spots-available');

            spotsBlock.innerHTML = availableSpots + ' available spots'

            ul.innerHTML = '';
            ulBoard.innerHTML = '';
            playersData.forEach(function(item) {
               var li = document.createElement('li'),
                   liBoard = document.createElement('li'),
                   name = document.createElement('b'),
                   nameBoard = document.createElement('b'),
                   role = document.createElement('span'),
                   roleBoard = document.createElement('span');

                li.style.backgroundColor = item.color;
                liBoard.style.backgroundColor = item.color;

                name.innerHTML = item.name;
                role.innerHTML = (item.role).toUpperCase();
                role.style.float = 'right';

                nameBoard.innerHTML = item.name;
                roleBoard.innerHTML = (item.role).toUpperCase();
                roleBoard.style.float = 'right';

                li.appendChild(name);
                li.appendChild(role);

                liBoard.appendChild(nameBoard);
                liBoard.appendChild(roleBoard);

                ul.appendChild(li);
                ulBoard.appendChild(liBoard);
            });
        },

        /**
         * Update game logic
         * @method PrototypePacman.Game#update
         */
        hideMenu: function(menuName){
            Utils.addClass(document.getElementById(menuName), 'hide');
        },
        /**
         * Update game logic
         * @method PrototypePacman.Game#update
         */
        update: function(){
            this.player.update();

            for (var i= 0; i < this.ghosts.length; i++) {
                this.ghosts[i].update();
            }

            for (var i = 0; i < this.ghosts.length; i++) {
                if (Utils.colliding(this.ghosts[i], this.player)) {
                    this.gameState = 'lose';
                    this.gameOver({
                        title: PrototypePacman.config.text[this.lang].lose.title,
                        description: PrototypePacman.config.text[this.lang].lose.description
                    });
                }
            }

            if (this.board.walkableTileCount === 0) {
                this.gameState = 'win';
                this.gameOver({
                    title: PrototypePacman.config.text[this.lang].win.title,
                    description: PrototypePacman.config.text[this.lang].win.description
                });
            }

            if (PrototypePacman.config.socket.active) {
                if (!!PrototypePacman.config.socket.multiplayerData) {
                    this.socket.send({
                        action: 'waiting'
                    }, 'json');
                } else {
                    this.sendGameState();
                }
            }
        },
        /**
         * Draw game bodies
         * @method PrototypePacman.Game#draw
         * @param {object} screen Canvas ctx
         * @param {object} gameSize
         */
        draw: function(screen, gameSize){
            screen.clearRect(0, 0, gameSize.width, gameSize.height);

            this.board.draw(screen);
            this.player.draw(screen);

            for (var i= 0; i < this.ghosts.length; i++) {
                this.ghosts[i].draw(screen);
            }
        },
        /**
         * Send a game screenshot through a socket connection
         */
        sendGameState: function() {
            this.gameScreenshot = this.getGameScreenshot();
            this.socket.send(this.gameScreenshot, 'json');
        },
        /**
         * Create ghosts
         * @method PrototypePacman.Game#createGhosts
         * @param {object} game
         * @param {object} options
         */
        createGhosts: function(game, options) {
            var ghosts = [],
                ghostsAmount;

            //Set the number of ghosts allowed
            if (PrototypePacman.config.socket.multiplayer === true) {
                ghostsAmount = PrototypePacman.config.socket.maxPlayers - 1;
            } else {
                ghostsAmount = options.length;
            }

            for (var i = 0; i < ghostsAmount; i++) {
                ghosts.push(new PrototypePacman.Ghost(game, options[i]));
            }
            return ghosts;
        },
        /**
         * Get tile array coordinates from a board maze position
         *
         * @method PrototypePacman.Game#getTileReference
         * @param {number} worldX
         * @param {number} worldY
         * @return {boject}
         */
        getTileReference: function(worldX, worldY) {
            return this.board.getTileCoordinates(worldX, worldY);
        },
        /**
         * Return if the position is walkable or not
         *
         * @method PrototypePacman.Game#isValidLocation
         * @param {object} body
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         */
        isValidLocation: function (body, x, y) {
            return this.board.isWalkablePosition(body, x, y);
        },
        /**
         * Returns true if the passed coordinates are out of bounds
         *
         * @method PrototypePacman.Game#outOfBoundaries
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         */
        outOfBoundaries: function (x, y) {
            var boundaries = this.board.boundariesCoord();
            if (
                (x < boundaries.horizontal.min || x > boundaries.horizontal.max) ||
                ((y < boundaries.vertical.min || y > boundaries.vertical.max))
            ) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * Returns the tunnel position of a given side
         *
         * @method PrototypePacman.Game#giveMeTunnelPosition
         * @param {string} position
         * @return {boolean}
         */
        giveMeTunnelPosition: function(side) {
            return (this.board.tunnelPosition(side));
        },
        /**
         * Mark board maze passed tile as walked
         *
         * @method PrototypePacman.Game#markTileAsWalked
         * @param {object} worldX
         * @param {number} worldY
         */
        markTileAsWalked: function(worldX, worldY) {
            this.board.changeTileColor(worldX, worldY, 'walked');
        },
        /**
         * Return board
         *
         * @method PrototypePacman.Game#getMazeArray
         * @return {array}
         */
        getMazeArray: function() {
            return this.board.board;
        },
        /**
         * Launch gameOver logic
         *
         * @method PrototypePacman.Game#gameOver
         * @param {object} message
         */
        gameOver: function (message) {
            document.querySelector('#openModal h2').textContent = message.title;
            document.querySelector('#openModal p').textContent = message.description;
            window.location.href = "#openModal"; // Show modal

            this.ghosts = []; //Reset ghosts
        },
        /**
         * Return the current state of the game
         *
         * @method PrototypePacman.Game#getGameScreenshot
         */
        getGameScreenshot: function() {
            var playerPos = this.board.getTileCoordinates(
                this.player.center.x,
                this.player.center.y
                ),
                self = this;

            return {
                action: 'game-state',
                board: this.board.getReference(),
                player: {
                    x: playerPos.x,
                    y: playerPos.y,
                    move: this.player.moveDirection
                },
                ghosts: this.ghosts.map(function(g){
                    return self.board.getTileCoordinates(
                        g.center.x,
                        g.center.y
                    );
                }),
                state: this.gameState //win, lose, playing
            }
        },
        /**
         * Return game mode
         *
         * @method PrototypePacman.Game#returnGameMode
         */
        returnGameMode: function() {
            if (
                PrototypePacman.config.socket.active &&
                PrototypePacman.config.socket.playerMovesFromServer
            ) {
                return 'machine-learning'
            } else if (
                PrototypePacman.config.socket.active &&
                !!PrototypePacman.config.socket.multiplayerData
            ) {
                return 'multiplayer'
            } else {
                return 'single'
            }

        }
    };

    window.onload = function() {
        new Game('world');
    }

    window['PrototypePacman'] = window['PrototypePacman'] || {};
    window['PrototypePacman'].Game = Game;
})();
