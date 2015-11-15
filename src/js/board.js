/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * Board class constructor
 *
 * @class PrototypePacman.Board
 * @constructor
 * @param {object} screen Canvas ctx
 * @param {object} options
 */
var PrototypePacman = PrototypePacman || {};

PrototypePacman.Board = function(screen, options) {
    this.options = options;
    this.board = [];
    this.piecesBoard;
    this.walkableTileCount = 0;

    this.generateBoard(screen, options);
};

PrototypePacman.Board.prototype = {
    /**
     * Generates a board maze
     * @method PrototypePacman.Board#generateBoard
     * @param {object} screen Canvas ctx
     * @param {object} options
     */
    generateBoard: function(screen, options) {
        /** Board construction
         *
         * 1.- It first builds random color pieces
         * 2.- Give a walkable tile around every color piece to avoid dead-ends
         * 3.- Join the contiguous tiles with the same colors to create the maze blocks
         * 4.- Mirror horizontally creating the right part of the board
         */
        var colors = options.colors,
            rowTilesCountPieces = calculatePiecesRowTileCount(this.options.tileAmount.row),
            columnTilesCountPieces= calculatePiecesColumnTileCount(this.options.tileAmount.column);

        this.piecesBoard = new Array(rowTilesCountPieces);

        // 1.- Create pieces array [rowTilesCountPieces x columnTilesCountPieces]
        for (var i = 0; i < rowTilesCountPieces; i++) {
            this.piecesBoard[i] = new Array(columnTilesCountPieces);
        }

        for (var i = 0; i < this.piecesBoard.length; i++) {
            for (var j = 0; j < this.piecesBoard[i].length; j++) {
                this.piecesBoard[i][j] = this.createTile(
                    this.options.tileSize,
                    i, j,
                    {
                        x: this.options.tileSize.width * this.options.tileAmount.row + (this.options.tileOffset.x * 2),
                        y: this.options.tileOffset.y * 2 },
                    colors.wall[
                        options.layout.random ?
                            Utils.getRandomInt(0, colors.wall.length - 1) :
                            options.layout.static[i][j].color
                        ]
                );
            }
        }

        // 2.- Every tile of the pieces are separated, creating a walkable tile
        var resultCurrentColumn = 0;

        //It starts with a boundary wall column
        this.addNewColumn(this.board, 'boundary', resultCurrentColumn, this.options.tileAmount.column, this.options);
        resultCurrentColumn++;

        for (var i = 0; i < this.piecesBoard.length; i++) {
            //Add a new walkable column
            this.addNewColumn(this.board, 'walkable', resultCurrentColumn, this.options.tileAmount.column, this.options);
            resultCurrentColumn++;

            var rowCounter = 0;
            this.board.push([]); //Create new column

            //First tile in the column is a boundary tile
            this.addTile(
                this.board,
                resultCurrentColumn,
                this.createTile(
                    this.options.tileSize,
                    resultCurrentColumn, rowCounter,
                    this.options.tileOffset,
                    colors.boundary
                )
            );
            rowCounter++;

            for (var j = 0; j < this.piecesBoard[i].length; j++) {
                var currentTile = this.piecesBoard[i][j];
                //Adds a walkable tile and the current piece color right below
                this.addTile(
                    this.board,
                    resultCurrentColumn,
                    this.createTile(
                        this.options.tileSize,
                        resultCurrentColumn, rowCounter,
                        this.options.tileOffset,
                        colors.walkable
                    )
                );
                rowCounter++;

                this.addTile(
                    this.board,
                    resultCurrentColumn,
                    this.createTile(
                        this.options.tileSize,
                        resultCurrentColumn, rowCounter,
                        this.options.tileOffset,
                        currentTile.color
                    )
                );
                rowCounter++;
            }
            //At the end of the column adds a walkable and a boundary tile
            this.addTile(
                this.board,
                resultCurrentColumn,
                this.createTile(
                    this.options.tileSize,
                    resultCurrentColumn, rowCounter,
                    this.options.tileOffset,
                    colors.walkable
                )
            );
            rowCounter++;

            //Bottom boundary
            this.addTile(
                this.board,
                resultCurrentColumn,
                this.createTile(
                    this.options.tileSize,
                    resultCurrentColumn, rowCounter,
                    this.options.tileOffset,
                    colors.boundary
                )
            );

            resultCurrentColumn++;
        }

        // 3.- Join the contiguous tiles with the same colors to create the maze blocks

        //Join same color walls
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                var currentTile = this.board[i][j];
                if (this.isWalkableTile(currentTile)) {
                    if (
                        ((i !== 0) && (i <= this.board.length - 1)) && //Center column inclusive
                        ((j !== 0) && (j < this.board[i].length - 1))
                    ) {
                        var colorRow, colorColumn;
                        colorColumn = this.sameTypeTiles(this.board[i][j - 1], this.board[i][j + 1]);

                        if (i < this.board.length - 1) {
                            //Only check row contiguous tiles if it is not the center column
                            colorRow = this.sameTypeTiles(this.board[i - 1][j], this.board[i + 1][j]);
                        }

                        if ((!!colorRow) && (colorRow !== colors.walkable)) {
                            this.board[i][j].color = colorRow;
                        }

                        if ((!!colorColumn) && (colorColumn !== colors.walkable)) {
                            this.board[i][j].color = colorColumn;
                        }
                    }

                }
            }
        }

        // 4.- Mirror horizontally the current board
        var boardArrayLength = this.board.length;

        for (var i = boardArrayLength - 2; i >= 0; i--) { // (length - 2): because central column is not mirrored
            var auxArray = [];
            for (var j = 0; j < this.board[i].length; j++) {
                var newTitle = this.createTile(
                    this.options.tileSize,
                    i, j,
                    this.options.tileOffset,
                    this.board[i][j].color
                );
                auxArray.push(newTitle);
            }
            this.board.push(auxArray);
        }

        //Set X coord of every tile to place the mirrored part to the right side of the board
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                this.board[i][j].center.x = this.options.tileOffset.x + i * this.options.tileSize.width;
                if (
                    (this.isWalkableTile(this.board[i][j])) &&
                    (!this.isIsolatedTile(i, j))
                ) {
                    this.walkableTileCount++;
                }
            }

        }

        this.setBoardTunnels();

        // Private methods
        function calculatePiecesRowTileCount(rowTilesCount) {
            return Math.floor(Math.floor(rowTilesCount / 2) / 2 );
        }
        function calculatePiecesColumnTileCount(columnTilesCount) {
            return Math.floor(columnTilesCount / 2) - 1;
        }
    },
    /**
     * Draw the maze board and the pieces board to show the maze pattern
     * @method PrototypePacman.Board#draw
     * @param {object} screen Canvas ctx
     */
    draw: function (screen) {
        //Paint completeBoard
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                Utils.drawRect(screen, this.board[i][j], this.board[i][j].color);
            }
        }

        //Paint pieces board pattern and description
        screen.fillStyle = "black";
        screen.font = "16px arial";
        screen.fillText(
            "MAZE PATTERN",
            this.piecesBoard[0][0].center.x + (this.options.tileOffset.x / 2),
            this.options.tileOffset.y);


        for (var i = 0; i < this.piecesBoard.length; i++) {
            for (var j = 0; j < this.piecesBoard[i].length; j++) {
                Utils.drawRect(screen, this.piecesBoard[i][j], this.piecesBoard[i][j].color);
            }
        }
    },
    /**
     * Returns true if the board tile is walkable
     * @method PrototypePacman.Board#isWalkableTile
     * @param {object} tile Object that contains "color" property
     * @return {boolean}
     */
    isWalkableTile: function(tile) {
        return (tile.color === this.options.colors.walkable);
    },
    /**
     * Returns true if all the surrounded board tiles are walls
     * @method PrototypePacman.Board#isIsolatedTile
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    isIsolatedTile: function(x, y) {
        if (
            (x <= 1 || x >= this.options.tileAmount.row - 2) ||
            (y <= 1 || y >= this.options.tileAmount.row - 2)
        )
        {
            //It is the board boundary or the first column/row (always not isolated)
            return false;
        } else {
            //If it is surrounded by a walkable tile it is not isolated
            return (
                !this.isWalkableTile(this.board[x - 1][y]) &&
                !this.isWalkableTile(this.board[x + 1][y]) &&
                !this.isWalkableTile(this.board[x][y - 1]) &&
                !this.isWalkableTile(this.board[x][y + 1])
            );
        }
    },
    /**
     * Returns true if both tiles have the same type
     * @method PrototypePacman.Board#sameTypeTiles
     * @param {object} tileA Object that contains "color" property
     * @param {object} tileB Object that contains "color" property
     * @return {boolean}
     */
    sameTypeTiles: function(tileA, tileB) {
        return (tileA.color === tileB.color) ? tileA.color : false;
    },
    /**
     * Returns a board tile
     * @method PrototypePacman.Board#createTile
     * @param {object} tileSize
     * @param {number} row
     * @param {number} column
     * @param {object} offset
     * @param {string} color
     * @return {object}
     */
    createTile: function (tileSize, row, column, offset, color) {
        return {
            size: { width: tileSize.width, height: tileSize.height },
            center: {
                x: offset.x + row * tileSize.width,
                y: offset.y + column * tileSize.height
            },
            color: color
        }
    },
    /**
     * Add a new walkable column to the board
     * @method PrototypePacman.Board#addNewColumn
     * @param {array} data Board array
     * @param {string} type
     * @param {number} currentColumn
     * @param {number} rowCount
     * @param {object} options
     */
    addNewColumn: function (data, type, currentColumn, rowCount, options) {
        data.push([]);
        this.addTile(
            data,
            currentColumn,
            this.createTile(
                options.tileSize,
                currentColumn, 0,
                options.tileOffset,
                'slategray'
            )
        );
        for (var j = 1; j < rowCount; j++) {
            this.addTile(
                data,
                data.length - 1,
                this.createTile(
                    options.tileSize,
                    currentColumn, j,
                    options.tileOffset,
                    (type === 'walkable') && (j !== rowCount  - 1) ? options.colors.walkable : options.colors.boundary
                )
            );
        }
    },
    /**
     * Add a new tile to the board "column"
     * @method PrototypePacman.Board#addTile
     * @param {array} board Board array
     * @param {number} column
     * @param {object} item
     */
    addTile: function (board, column, item) {
        board[column].push(item);
    },
    /**
     * Check if a board tile is a valid position (walkable)
     * @method PrototypePacman.Board#isWalkablePosition
     * @param body Object with "size" and "center" properties
     * @param x increment/decrement to the "body" position in the X coord
     * @param y increment/decrement to the "body" position in the Y coord
     * @returns {boolean} true if is valid
     */
    isWalkablePosition: function(body, x, y) {
        //x, y are the center of a body
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                var currentTile = this.board[i][j];
                if (
                    (
                        (currentTile.color !== this.options.colors.walkable) &&
                        (currentTile.color !== this.options.colors.walked)
                    ) &&
                    (Utils.colliding(
                        currentTile,
                        {
                            size: { width: body.size.width, height: body.size.height },
                            center: { x: body.center.x + x, y: body.center.y + y }
                        }
                    ))
                ) {
                    return false;
                }
            }
        }
        return true;
    },
    /**
     * Returns the tile coordinates from a board position
     * @method PrototypePacman.Board#getTileCoordinates
     * @param {number} worldX
     * @param {number} worldY
     * @return {object}
     */
    getTileCoordinates: function(worldX, worldY) {
        for (var i = 0; i < this.board.length; i++) {
            for (var j = 0; j < this.board[i].length; j++) {
                var currentTile = this.board[i][j],
                    currentX = currentTile.center.x - this.options.tileOffset.x,
                    currentY = currentTile.center.y - this.options.tileOffset.y;
                if (
                    (worldX >= currentX && worldX <= currentX + currentTile.size.width) &&
                    (worldY >= currentY && worldY <= currentY + currentTile.size.height)
                ) {
                    return { x: i, y: j};
                }
            }

        }
    },
    /**
     * Returns the player initial position
     * @method PrototypePacman.Board#getPlayerInitialPosition
     * @return {object}
     */
    getPlayerInitialPosition: function () {
        var middlePosition = Math.floor(this.board.length / 2);
        var lastPosition = this.board[0].length - 2 ;

        return ({
            x: this.board[middlePosition][lastPosition].center.x,
            y: this.board[middlePosition][lastPosition].center.y
        });
    },
    /**
     * Set tunnel in vertical boundaries
     * @method PrototypePacman.Board#setBoardTunnels
     * @return {object}
     */
    setBoardTunnels: function() {
        var tileAmount = this.options.tileAmount.column,
            positionLeftBoundary = Utils.getRandomInt(1, tileAmount - 2),
            positionRightBoundary =Utils.getRandomInt(1, tileAmount - 2),
            tileLeftBoundary =
                this.board[0][positionLeftBoundary],
            tileRightBoundary =
                this.board[tileAmount - 1][positionRightBoundary];

        tileLeftBoundary.color = this.options.colors['walkable'];
        tileRightBoundary.color = this.options.colors['walkable'];

        this.board.leftTunnelTile = { x: 0, y: positionLeftBoundary};
        this.board.rightTunnelTile = { x: tileAmount - 1, y: positionRightBoundary};

        this.walkableTileCount += 2;
    },
    /**
     * Returns the position of a given tunnel side
     * @method PrototypePacman.Board#tunnelPosition
     * @return {object}
     */
    tunnelPosition: function(side) {
        var position;
        switch (side) {
            case 'left':
                position = {
                    x: this.board
                        [this.board.leftTunnelTile.x]
                        [this.board.leftTunnelTile.y].center.x,
                    y: this.board[
                        this.board.leftTunnelTile.x]
                        [this.board.leftTunnelTile.y].center.y
                };
                break;
            case 'right':
                position = {
                    x: this.board
                        [this.board.rightTunnelTile.x]
                        [this.board.rightTunnelTile.y].center.x,
                    y: this.board
                        [this.board.rightTunnelTile.x]
                        [this.board.rightTunnelTile.y].center.y
                };
                break;
        }
        return position;
    },
    /**
     * Change a tile color
     * @method PrototypePacman.Board#changeTileColor
     * @param {number} worldX
     * @param {number} worldY
     * @param {string} colorType
     */
    changeTileColor: function(worldX, worldY, colorType) {
        var tileCoordinates = this.getTileCoordinates(worldX, worldY),
            tile = this.board[tileCoordinates.x][tileCoordinates.y],
            color = this.options.colors[colorType],
            sameCenter =
                ((worldX + (this.options.tileSize.width / 2)) === tile.center.x) &&
                ((worldY + (this.options.tileSize.height / 2)) === tile.center.y);
        if (
            (tile.color !== color) &&
            (colorType === 'walked') &&
            sameCenter //To avoid walked color is shown before the player move
        ) {
            tile.color = color;
            this.walkableTileCount--;
        }
    },
    /**
     * Return boundaries coordinates
     * @method PrototypePacman.Board#boundariesCoord
     * @return {object}
     */
    boundariesCoord: function() {
        return {
            horizontal: {
                min: 0 + this.options.tileOffset.x,
                max: this.board[this.board.length - 1][0].center.x
            },
            vertical: {
                min: 0 + this.options.tileOffset.y,
                max: this.board[0][this.board.length - 1].center.y
            }
        };
    }
};

PrototypePacman.Board.prototype.constructor = PrototypePacman.Board;
