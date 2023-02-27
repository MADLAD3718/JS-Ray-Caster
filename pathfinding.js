import { map } from '/map.js';
import { system } from '/system.js';

class Pathfinding {
	cols = map.walls.length;
	rows = map.walls[0].length;
	grid = new Array(this.cols);
	mapArray = this.getMapArray();
	mapCopy = this.getMapArray();
  //cells that need to be visited
  //algorithm is finished when there is either no more cells in the open set (no solution), or the enemy has reached the goal cell 
	openSet = [];
  //stores list of all of the cells that have been visited
	closedSet = [];
	start;
	end;
	path = [];
	nosolution = false;

  //create a copy of the map array using stringify
	getMapArray() {
    return JSON.parse(JSON.stringify(map.walls));
	}

	//used the remove the current cell from the open set and move it to either closed, or to the path array
	removeFromArray(arr, elt) {
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i] == elt) {
				arr.splice(i, 1);
			}
		}
	}

	setup(startX, startY, goalX, goalY) {
    this.mapCopy = this.getMapArray(); 
    
		// Make the grid into a 2D array
		for (var i = 0; i < this.cols; i++) {
			this.grid[i] = new Array(this.rows);
		}

		//each element in the 2D array becomes a Spot object
		for (var i = 0; i < this.cols; i++) {
			for (var j = 0; j < this.rows; j++) {
				this.grid[i][j] = new Spot(i, j, this.grid, this.mapArray, this.cols, this.rows);
			}
		}

    //instead of putting this loop inside of the spot loop, do it separately because each spot doesn't have all of its neighbors yet while they are still being assigned
		//get the neighbors of every spot on the grid
		for (var i = 0; i < this.cols; i++) {
			for (var j = 0; j < this.rows; j++) {
				this.grid[i][j].addNeighbors(this.grid);
			}
		}

		//set the starting and ending points for pathfinding
		this.start = this.grid[startY][startX];
		this.end = this.grid[goalY][goalX];
    //the start and end positions are not walls
		this.start.wall = false;
		this.end.wall = false;

    //push the starting cell into the openset
		this.openSet.push(this.start);
	}

  //function to find the shortest path between the starting point and the goal point
  //f score: a sum of the g and h score
  //g score: distance that the enemy has walked so far (how many cells they have passed)
  //h score: the diagonal distance between where the enemy is now, and the end goal
  //calculate the f scores of the neighborus of this current cell
  //compare the f scores and move in the path with the lwoest f score
	findPath(startX, startY, goalX, goalY) {
    //set up the grid of the game
		this.setup(startX, startY, goalX, goalY);
    //continue looping until a solution is found
		while (true) {

      //check if there are still sets to be looked through
			if (this.openSet.length > 0) {
        //at first, assume that the cell with the lowest f score is the first element of the array
				var winner = 0;
				//go through the openSet and check if this cell has the highest f score
				for (var i = 0; i < this.openSet.length; i++) {
          //see which spot from the open set has the lowest f score by looping through every cell in the set
					if (this.openSet[i].f < this.openSet[winner].f) {
            //if it does have a lower score, reassign the winner index
						winner = i;
					}
				}

        //store the current lowest f score in the current variable 
				var current = this.openSet[winner];

        //if the current cell is the ending cell, 
				if (current === this.end) {
					//continue to put the previous cells into the path array
					this.path = [];
					var temp = current;
          //push the end into the list 
					this.path.push(temp);
          //as long as there is a previous to the cell, push that into the list
					while (temp.previous) {
            //push the previous of the current into the list
						this.path.push(temp.previous);
            //reset the temp 
						temp = temp.previous
					}
					break;
				}
        //if it is not at the ending cell however, remove the current cell from the open set since it has been visited
				this.removeFromArray(this.openSet, current)
				//push this cell into the closed set because it has been visited
				this.closedSet.push(current);

        //store the neighbors of the current spot in the neighbors variable (each spot keeps track of its own neighbors)
				var neighbors = current.neighbors;

        //loop through the neighbors
				for (var i = 0; i < neighbors.length; i++) {
          //store the neighbor in the neighbor variable
					var neighbor = neighbors[i];

					var newPath = false;
          //as long as the closed set does not include the neighbor (aka as long as this neighbor hasn't been visited yet), increase the temp g value by 1, which will be used to compare to the original g value (since the g value is like how many steps it takes to get there)
					if (!this.closedSet.includes(neighbor) && !neighbor.wall) {
            //tentative g score to be used for comparing
						var tempG = current.g + 1;

            //this whole if statement reassigns the g value for this cell
            //check if the open set includes this neighbor (we haven't checked this before)
						if (this.openSet.includes(neighbor)) {
              //if this g is lower than the original g, set it to this g instead
							if (tempG < neighbor.g) {
								neighbor.g = tempG;
								newPath = true;
							}
						} 
            //if its not in the open list already
            else {
              //set it to this g
							neighbor.g = tempG;
							newPath = true;
              //push it into the openset to be evaluated
							this.openSet.push(neighbor);
						}

            //if there is a newpath or if there is a new g score, recalculate the f and the h score
						if (newPath) {
              //the heuristic is distance between the neighbor and the end
							neighbor.h = system.distance(neighbor.i, neighbor.j, this.end.i, this.end.j);
              //the f score is the sum of the heuristic and the g score
							neighbor.f = neighbor.g + neighbor.h;
              //the neighbor came from the current cell
							neighbor.previous = current;
						}
					}
				}
			}
      //if there are no more cells left in the open set and the goal hasnt been reached, return undefined (for enemy pathfinding purposes) and set nosolution to true
			else {
				console.log('no solution');
				this.nosolution = true;
				return undefined;
			}
		}
    
    //in the map copy, make the path -2s
    for (var i = 0; i < this.path.length; i++) {
			this.mapCopy[this.path[i].i][this.path[i].j] = -2;
		}
    //return the copy of the map
    return this.mapCopy;
	}

  //log the path in the console
	displayPath() {
		for (var i = 0; i < this.path.length; i++) {
			console.log(this.mapCopy)
		}
	}
}

//class for every spot on the grid
class Spot {
	constructor(i, j, grid, mapArray, cols, rows) {
		this.i = i;
		this.j = j;
		this.grid = grid;
		this.mapArray = mapArray;
		this.cols = cols;
		this.rows = rows;
		//based on the walls from the game, set the wall property of the spot to true or false
		if (mapArray[i][j] > 0) {
			this.wall = true;
		}
	}
	f = 0
	g = 0;
	h = 0;
	neighbors = [];
	previous = undefined;

	addNeighbors(grid) {
		var i = this.i;
		var j = this.j;

    //these if statements are used to make sure that these neighbors don't go off the grid
		if (i < this.cols - 1) {
      //neighbor to the right
			this.neighbors.push(grid[i + 1][j]);
		};
		if (i > 0) {
      //neighbor to the left
			this.neighbors.push(grid[i - 1][j]);
		}  ;
		if (j < this.rows - 1) {
      //neighbor down
			this.neighbors.push(grid[i][j + 1]);
		}

		if (j > 0) {
      //neighbor up
			this.neighbors.push(grid[i][j - 1]);
		}
	}
}

const pathfinding = new Pathfinding();
export { pathfinding };