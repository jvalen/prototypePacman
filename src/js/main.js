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
    var Game = function(canvasId) {
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

        var self = this;

        var tick = function(){
            self.update();
            self.draw(screen, gameSize);
            requestAnimationFrame(tick);
        };

        tick();
    };
    Game.prototype = {
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
                    this.gameOver({
                        title: PrototypePacman.config.text[this.lang].lose.title,
                        description: PrototypePacman.config.text[this.lang].lose.description
                    });
                }
            }

            if (this.board.walkableTileCount === 0) {
                this.gameOver({
                    title: PrototypePacman.config.text[this.lang].win.title,
                    description: PrototypePacman.config.text[this.lang].win.description
                });
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
         * Create ghosts
         * @method PrototypePacman.Game#createGhosts
         * @param {object} game
         * @param {object} options
         */
        createGhosts: function(game, options) {
            var ghosts = [];
            for (var i = 0; i < options.length; i++) {
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
        }
    };

    window.onload = function() {
        new Game('world');
    }

    window['PrototypePacman'] = window['PrototypePacman'] || {};
    window['PrototypePacman'].Game = Game;
})();
