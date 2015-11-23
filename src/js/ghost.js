/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * Ghost class constructor
 *
 * @class PrototypePacman.Ghost
 * @constructor
 * @param {object} game
 * @param {object} options
 */
var PrototypePacman = PrototypePacman || {};

PrototypePacman.Ghost = function(game, options) {
    this.game = game;
    this.size = options.size;
    this.center = options.center;
    this.color = options.color;
    this.speed = options.speed;
    this.moveDirection = {
        current: 'left',
        waiting: 'left'
    };
};

PrototypePacman.Ghost.prototype = {
    /**
     * Update the ghost state
     * @method PrototypePacman.Ghost#update
     */
    update: function() {
        if (this.game.returnGameMode() === 'multiplayer') {
            //Update waiting ghost direction on multiplayer
            var self = this,
                currentGhostData = !!this.game.socket ?
                    this.game.socket.dataReceived.filter(
                        function(item){
                            return ('color' in item && (item.color === self.color))
                        }
                    ) : [];
            this.moveDirection.waiting = currentGhostData[0].direction;
            this.moveGhost(this, this.moveDirection.waiting, true);
        } else {
            //Move ghost on single or machine learning mode
            this.moveGhost(this, this.moveDirection.current, false);
        }
    },
    /**
     * Draw the ghost
     * @method PrototypePacman.Ghost#draw
     * @param {object} screen Canvas ctx
     */
    draw: function(screen) {
        //Utils.drawRect(screen, this, this.color);
        Utils.drawGhost(screen, this, this.color);
    },
    /**
     * Returns next direction
     * @method PrototypePacman.Ghost#nextDirection
     * @param {array} nextStep, e.g: [3, 5]
     * @param {object} currentPosition
     * @return {string}
     */
    nextDirection: function (nextStep, currentPosition) {
        var result = '';
        if (nextStep[0] < currentPosition.x) {
            result = 'left';
        } else if (nextStep[0] > currentPosition.x) {
            result = 'right';
        } else if (nextStep[1] < currentPosition.y) {
            result = 'up';
        } else if (nextStep[1] > currentPosition.y) {
            result = 'down';
        }
        return result;
    },
    /**
     * Returns the array coordinates after new direction is applied
     * @method PrototypePacman.Ghost#stepCoords
     * @param {string} direction
     * @param {number} speed
     * @return {object}
     */
    stepCoords: function (direction, speed) {
        var result = { x: 0, y: 0 };
        switch (direction) {
            case 'left':
                result = { x: -1 * speed, y: 0 };
                break;
            case 'right':
                result = { x: 1 * speed, y: 0 };
                break;
            case 'up':
                result = { x: 0, y:  -1 * speed };
                break;
            case 'down':
                result = { x: 0, y: 1  * speed };
                break;
        }
        return result;
    },
    /**
     * Move ghost
     * @method PrototypePacman.Ghost#moveGhost
     * @param {string} ghost
     * @param {string} direction
     * @param {boolean} isWaiting
     */
    moveGhost: function(ghost, direction, isWaiting) {
        var currentTileGhost = ghost.game.getTileReference(
                this.center.x - (this.size.width / 2),
                this.center.y - (this.size.height / 2)
            ),
            currentTilePlayer = ghost.game.getTileReference(
                ghost.game.player.center.x - (ghost.game.player.size.width / 2),
                ghost.game.player.center.y - (ghost.game.player.size.height / 2)
            ),
            currentPath = [];

        var currentMoveCoords = this.stepCoords(direction, this.speed),
            walkableConditionFunction = function(data) {
              if (!!data.color) {
                  return (
                    (data.color === ghost.game.board.options.colors.walkable) ||
                    (data.color === ghost.game.board.options.colors.walked)
                  );
              } else {
                  return false;
              }
            };

        switch (direction) {
            case 'left':
            case 'right':
                if (this.game.returnGameMode() === 'multiplayer') {
                    //Multiplayer mode
                    if (ghost.game.isValidLocation(
                            ghost,
                            currentMoveCoords.x,
                            currentMoveCoords.y
                        )
                    )
                    {
                        //Check if the next position is valid (no collision)
                        ghost.center.x += currentMoveCoords.x;
                        ghost.moveDirection.current = direction;

                    } else if (isWaiting) {
                        this.moveGhost(ghost, ghost.moveDirection.current, false);
                    }
                } else {
                    //Single or machine learning mode
                    if (isWaiting) {
                        ghost.center.x += currentMoveCoords.x;
                    } else {
                        if (
                            (ghost.game.isValidLocation(ghost, currentMoveCoords.x, currentMoveCoords.y)) &&
                            (!(
                                (ghost.game.isValidLocation(ghost, 0, -1 * this.speed)) ||
                                (ghost.game.isValidLocation(ghost, 0, 1 * this.speed))
                            ))
                        )
                        {
                            //Check if the next position is valid (no collision) and
                            //cannot change direction (get intersection)
                            ghost.center.x += currentMoveCoords.x;
                            ghost.moveDirection.current = direction;

                        } else {
                            //Needs to calculate new path
                            currentPath = Utils.findPath(
                                ghost.game.getMazeArray(),
                                [currentTileGhost.x, currentTileGhost.y],
                                [currentTilePlayer.x, currentTilePlayer.y],
                                walkableConditionFunction
                            );

                            if (currentPath.length > 1) {
                                var nextDirection = ghost.nextDirection(currentPath[1], currentTileGhost);
                            }
                            ghost.moveDirection.current = nextDirection;

                            //Force to move to the first tile on the path to the player
                            this.moveGhost(ghost, nextDirection, true);
                        }
                    }
                }
                break;
            case 'up':
            case 'down':
                if (this.game.returnGameMode() === 'multiplayer') {
                    if (ghost.game.isValidLocation(
                            ghost,
                            currentMoveCoords.x,
                            currentMoveCoords.y
                        )
                    )
                    {
                        //Check if the next position is valid (no collision)
                        ghost.center.y += currentMoveCoords.y;
                        ghost.moveDirection.current = direction;

                    } else if (isWaiting) {
                        this.moveGhost(ghost, ghost.moveDirection.current, false);
                    }
                } else {
                    if (isWaiting) {
                        ghost.center.y += currentMoveCoords.y;
                    } else {
                        if (
                            (ghost.game.isValidLocation(ghost, currentMoveCoords.x, currentMoveCoords.y)) &&
                            (!(
                                (ghost.game.isValidLocation(ghost, -1 * this.speed, 0)) ||
                                (ghost.game.isValidLocation(ghost, 1 * this.speed, 0))
                            ))
                        )
                        {
                            //Check if the next position is valid (no collision) and
                            //cannot change direction (get intersection)
                            ghost.center.y += currentMoveCoords.y;
                            ghost.moveDirection.current = direction;

                        } else {
                            //Needs to calculate new path
                            currentPath = Utils.findPath(
                                ghost.game.getMazeArray(),
                                [currentTileGhost.x, currentTileGhost.y],
                                [currentTilePlayer.x, currentTilePlayer.y],
                                walkableConditionFunction
                            );

                            if (currentPath.length > 1) {
                                var nextDirection = ghost.nextDirection(currentPath[1], currentTileGhost);
                            }
                            ghost.moveDirection.current = nextDirection;

                            //Force to move to the first tile on the path to the player
                            this.moveGhost(ghost, nextDirection, true);
                        }
                    }
                }
                break;
        }
    }
};

PrototypePacman.Ghost.prototype.constructor = PrototypePacman.Ghost;
