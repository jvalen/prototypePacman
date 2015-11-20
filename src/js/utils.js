/**
 * @author       Javier Valencia Romero <javiervalenciaromero@gmail.com>
 * @copyright    Javier Valencia Romero
 * @license      {@link https://github.com/jvalen/prototypePacman/blob/master/license.txt|MIT License}
 */

/**
 * Utils library
 *
 * Includes several useful functions
 */
;(function() {
    var Utils = {
        /**
         * Get a random number within a range
         * @param {number} min
         * @param {number} max
         * @return {number}
         */
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        /**
         * Returns true if both bodies are colliding
         * @param {object} b1
         * @param {object} b2
         * @return {boolean}
         */
        colliding: function(b1, b2) {
            return !(
                b1 === b2 ||
                b1.center.x + b1.size.width / 2 <= b2.center.x - b2.size.width / 2 ||
                b1.center.y + b1.size.height / 2 <= b2.center.y - b2.size.height / 2 ||
                b1.center.x - b1.size.width / 2 >= b2.center.x + b2.size.width / 2 ||
                b1.center.y - b1.size.height / 2 >= b2.center.y + b2.size.height / 2
            );
        },
        /**
         * Draw a colored rectangle
         * @param {object} screen Canvas ctx
         * @param {object} body Object that contains "size" and "center" properties
         * @param {string} color
         * @param {string=} innerColor This parameter is optional
         */
        drawRect: function(screen, body, color, innerColor){
            if (!!color) {
                screen.fillStyle = color;
            } else {
                screen.fillStyle = "black";
            }

            var halfSizeWidth = body.size.width / 2,
                halfSizeHeight = body.size.height / 2;

            screen.fillRect(
                body.center.x - halfSizeWidth,
                body.center.y - halfSizeHeight,
                body.size.width,
                body.size.height
            );

            if (!!innerColor) {
                screen.fillStyle = innerColor;
                screen.fillRect(
                    body.center.x - (halfSizeWidth) / 2,
                    body.center.y - (halfSizeHeight) / 2,
                    body.size.width / 2,
                    body.size.height / 2
                );
            }
        },
        /**
         * Draw a ghost like shape
         * @param {object} screen Canvas ctx
         * @param {object} body Object that contains "size" and "center" properties
         * @param {string} color
         */
        drawGhost: function(screen, body, color){
            screen.fillStyle = color;

            var halfSizeWidth = body.size.width / 2,
                halfSizeHeight = body.size.height / 2,
                fifthHeight = body.size.width / 5;

            //Paint ghost's upper part
            screen.fillRect(
                body.center.x - halfSizeWidth,
                body.center.y - halfSizeHeight,
                body.size.width,
                body.size.height - halfSizeHeight / 2
            );

            //Pain ghost's lower part
            for (var i = 0; i <= 4; i += 2) {
                screen.fillRect(
                    body.center.x - halfSizeWidth + (fifthHeight * i),
                    body.center.y ,
                    fifthHeight,
                    body.size.height - halfSizeHeight
                );
            }
        },
        /**
         * Change url hashtag
         * @param {string} tag
         */
        changeHashTag: function(tag, reload) {
            window.location.href = "#" + tag;
            if (reload) { window.location.reload(); }
        },
        /**
         * Remove url hashtag and reload page
         * @param {string} tag
         */
        removeHashTag: function(reload) {
            history.pushState('', document.title, window.location.pathname);
            if (reload) { window.location.reload(); }
        },
        /**
        * Returns the shortest path between two points: A* algorithm
        * (modified version of Christer's tutorial (http://buildnewgames.com/astar/) algorithm)
        *
        * NOTES:
        *   - this A-star implementation expects the world array to be square
        *
        * @param {array} world 2D array, e.g: w = [[0,1,1,0], [0, 1, 1, 0], [0,1,0,0], [0,0,0,1]]
        * @param {array} pathStart X and Y coordinates, e.g: [0, 3]
        * @param {array} pathEnd X and Y coordinates, e.g: [3, 0]
        * @param {function} isWalkable Function that check if the position is walkable
        * @return {array} shortest path array
        */
        findPath: function(world, pathStart, pathEnd, isWalkable) {
            var abs = Math.abs,
                worldWidth = world.length,
                worldHeight = world[0].length,
                worldSize = worldWidth * worldHeight,
                distanceFunction = ManhattanDistance, //no diagonals (Manhattan)
                findNeighbours = function () {};

            /**
             * Returns Manhattan distance heuristic between two points
             * @param {object} Point
             * @param {object} Goal
             * @returns {number}
             */
            function ManhattanDistance(Point, Goal)
            {	//Linear movement - no diagonals - just cardinal directions (NSEW)
                return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
            }

            /**
             * Neighbours functions, used by "findNeighbours" function to locate
             * adjacent available cells that aren't blocked
             * @param {number} x
             * @param {number} y
             * @returns {array} Returns every available North, South, East or West cell that is empty
             */
            function Neighbours(x, y)
            {
                var	N = y - 1,
                    S = y + 1,
                    E = x + 1,
                    W = x - 1,
                    myN = N > -1 && canWalkHere(x, N),
                    myS = S < worldHeight && canWalkHere(x, S),
                    myE = E < worldWidth && canWalkHere(E, y),
                    myW = W > -1 && canWalkHere(W, y),
                    result = [];
                if(myN)
                    result.push({x:x, y:N});
                if(myE)
                    result.push({x:E, y:y});
                if(myS)
                    result.push({x:x, y:S});
                if(myW)
                    result.push({x:W, y:y});
                findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
                return result;
            }

            /**
             * Returs true if the cell is walkable
             * @param {number} x
             * @param {number} y
             * @returns {boolean}
             */
            function canWalkHere(x, y)
            {
                return isWalkable(world[x][y]);
            };

            /**
             * Returns a new object with Node properties, used in the "calculatePath" function to store route costs
             * @param {object} Parent
             * @param {object} Point
             * @returns {object}
             */
            function Node(Parent, Point)
            {
                var newNode = {
                    Parent: Parent, //pointer to another Node object
                    value: Point.x + (Point.y * worldWidth), //array index of this Node in the world linear array
                    x: Point.x, //x coordinates of this Node
                    y: Point.y, //y coordinates of this Node
                    f: 0, //the distanceFunction cost to get this Node from the START
                    g: 0 //the distanceFunction cost to get from this Node to the GOAL
                };

                return newNode;
            }

            //
            /**
             * Path function, executes AStar algorithm operations
             * @returns {array} Shortest path from pathStart to pathEnd
             */
            function calculatePath()
            {
                var	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]}), //create Node from the Start
                    mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]}), //create Node from the End
                    AStar = new Array(worldSize), //create an array that will contain all world cells
                    Open = [mypathStart], //list of currently open Nodes
                    Closed = [], //list of closed Nodes
                    result = [], //list of the final output array
                    myNeighbours, //reference to a Node (that is nearby)
                    myNode, //reference to a Node (that we are considering now)
                    myPath, //reference to a Node (that starts a path in question)
                    length, max, min, i, j; // temp integer variables used in the calculations

                //Iterate through the open list until none are left
                while(length = Open.length)
                {
                    max = worldSize;
                    min = -1;
                    for(i = 0; i < length; i++)
                    {
                        if(Open[i].f < max)
                        {
                            max = Open[i].f;
                            min = i;
                        }
                    }

                    myNode = Open.splice(min, 1)[0]; //grab the next node and remove it from Open array

                    //is it the destination node?
                    if(myNode.value === mypathEnd.value)
                    {
                        myPath = Closed[Closed.push(myNode) - 1];
                        do
                        {
                            result.push([myPath.x, myPath.y]);
                        }
                        while (myPath = myPath.Parent);

                        AStar = Closed = Open = []; //clear the working arrays
                        result.reverse(); //we want to return start to finish
                    }
                    else //not the destination
                    {
                        myNeighbours = Neighbours(myNode.x, myNode.y); //find which nearby nodes are walkable

                        // test each one that hasn't been tried already
                        for(i = 0, j = myNeighbours.length; i < j; i++)
                        {
                            myPath = Node(myNode, myNeighbours[i]);
                            if (!AStar[myPath.value])
                            {
                                //estimated cost of this particular route so far
                                myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
                                // estimated cost of entire guessed route to the destination
                                myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
                                // remember this new path for testing above
                                Open.push(myPath);
                                // mark this node in the world graph as visited
                                AStar[myPath.value] = true;
                            }
                        }
                        Closed.push(myNode); //remember this route as having no more untested options
                    }
                } // keep iterating until the Open list is empty
                return result;
            }
            return calculatePath();
        }

    };

    window['Utils'] = window['Utils'] || {};
    window['Utils'] = Utils;
}());
