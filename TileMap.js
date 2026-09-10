import Pacman from './Pacman.js';
import Enemy from './Enemy.js';
import MovingDirection from './MovingDirection.js';


// hier het belang van 'module', we exporteren een klasse 'TileMap' naar de 'Game.js'
export default class TileMap{
    // constructor van de klasse = egenschappen van de klasse (hier tileSize)
    constructor(tileSize){
        this.tileSize = tileSize;

        this.yellowDot = new Image();
        this.yellowDot.src = "../images/yellowDot.png";

        this.pinkDot = new Image();
        this.pinkDot.src = "../images/pinkDot.png";

        this.wall = new Image();
        this.wall.src = "../images/wall.png";

        this.powerDot = this.pinkDot; // met timer switchen tussen beide, start met pink en wissel daarna met yellow
        this.powerDotAnimationTimerDefault = 30;
        this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;

    }
 
    // wall = 1; yellow dot = 0, pacman = 4; empty space = 5; enemy = 6; power dot = 7

    map = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,4,0,0,0,0,0,0,0,1,6,0,0,0,0,0,0,0,1,7,1],
        [1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,0,0,0,1,0,1],
        [1,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,6,0,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
        [1,7,1,6,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,0,0,1,6,0,0,1,0,0,0,1],
        [1,0,1,0,1,1,1,0,1,7,1,0,1,0,1,0,1,0,6,0,1],
        [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,1,0,1],
        [1,1,1,1,1,0,0,1,1,0,1,1,1,0,1,0,1,0,1,0,1],
        [1,0,0,0,1,6,0,0,1,0,1,0,0,0,1,0,1,7,1,0,1],
        [1,0,1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,1,1,0,1],
        [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,6,0,0,1,0,0,0,0,7,0,0,1,0,0,0,0,6,7,0,1],
        [1,1,1,0,0,0,0,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
        [1,7,0,0,0,0,1,0,0,6,1,0,0,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    /* 

    map = [ 
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 7, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 6, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 7, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
        [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    */


    // methode van de klasse = functie binnen de klasse
    draw(ctx){
        for(let row=0; row < this.map.length; row++){
            for(let column=0; column < this.map[row].length; column++){
                let tile = this.map[row][column];

                if(tile == 1){
                    this.#drawWall(ctx,column,row,this.tileSize); // dit is met de '#' een private methode (= kan enkel intern gebruikt worden binnen TileMap.js)
                } else if(tile == 0){
                    this.#drawDot(ctx,column,row,this.tileSize);
                } else if(tile == 7){
                    this.#drawPowerDot(ctx,column,row,this.tileSize);
                }

                else { // dus een empty space voor iets anders (zoals 5)
                    this.#drawBlank(ctx,column,row,this.tileSize);
                }

                // teken omlijning voor betere zichtbaarheid
                /*ctx.strokeStyle = "yellow";
                ctx.strokeRect(
                    column * this.tileSize,
                    row * this.tileSize,
                    this.tileSize,
                    this.tileSize
                ); */
            }
        }
    }

    #drawWall(ctx,column,row,size){
        ctx.drawImage(
            this.wall,
            column * this.tileSize, // x-positie
            row * this.tileSize, // y-positie
            size, // width
            size // heigth
        );
    }
    #drawDot(ctx,column,row,size){
        ctx.drawImage(
            this.yellowDot,
            column * this.tileSize,
            row * this.tileSize,
            size,
            size
        );
    }

    #drawBlank(ctx,column,row,size){
        ctx.fillStyle = 'black';
        ctx.fillRect(column * this.tileSize, row * this.tileSize, size, size);
    }

    #drawPowerDot(ctx,column,row,size){
        this.powerDotAnimationTimer--;
        if(this.powerDotAnimationTimer == 0){ // reset naar default waarde
            this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;
            if(this.powerDot == this.pinkDot){
                this.powerDot = this.yellowDot;
            }else{
                this.powerDot = this.pinkDot;
            }
        }
        ctx.drawImage(this.powerDot, column * this.tileSize, row * this.tileSize, size, size);
    }


    getPacman(velocity){
        for(let row=0; row < this.map.length; row++){
            for(let column=0; column < this.map[row].length; column++){
                let tile = this.map[row][column];
                if(tile == 4){
                    // we vervangen pacman door een dot
                    this.map[row][column] = 0;
                    return new Pacman(
                        column * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        velocity,
                        this // referentie naar tilemap (voor latere collison detection)
                    );
                }
            }
        }
    }

    getEnemies(velocity){
        const enemies = [];

        for(let row=0;row < this.map.length; row++){
            for(let column=0; column < this.map[row].length; column++){
                const tile = this.map[row][column];
                if(tile == 6){

                    this.map[row][column] = 0; // vervang enemy door een dot
                    enemies.push(new Enemy( // voeg een nieuwe Enemy toe aan de lijst met enemies ('push')
                        column * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        velocity,
                        this // referentie naar tilemap (voor latere collison detection)
                    ));
                }
            }
        }
        return enemies;
    }


    setCanvasSize(canvas){
        canvas.width = this.map[0].length * this.tileSize; // aantal rijen
        canvas.height = this.map.length * this.tileSize; // antal kolommen
    }

    didCollideWithEnvironment(x,y,direction){ // 'x' = this.x = column * this.tileSize
        if (direction == null){
            return;
        }

        if (Number.isInteger(x/this.tileSize) && Number.isInteger(y/this.tileSize)){ // dit moet er wel bij, want bij de tweede oproep ervan in Pacman controleer je dit niet vooraf (moet kloppen anders probleem bij const op het einde hier)
            let column = 0;
            let row = 0;
            let nextColumn = 0;
            let nextRow = 0;

            switch(direction){
                case MovingDirection.right: // 1 kolom verder
                    nextColumn = x + this.tileSize;
                    column = nextColumn / this.tileSize;
                    row = y / this.tileSize;
                    break;

                case MovingDirection.left:
                    nextColumn = x - this.tileSize;
                    column = nextColumn / this.tileSize;
                    row = y / this.tileSize;
                    break;

                case MovingDirection.up:
                    nextRow = y - this.tileSize;
                    row = nextRow / this.tileSize;
                    column = x / this.tileSize;
                    break;

                case MovingDirection.down:
                    nextRow = y + this.tileSize;
                    row = nextRow / this.tileSize;
                    column = x / this.tileSize;
                    break;
            }

            const nextTile = this.map[row][column];
            if (nextTile == 1){
                return true;
            }
        }
        return false;
    }

    eatDot(x, y){
        const row = y / this.tileSize;
        const column = x / this.tileSize;
        if(Number.isInteger(row) && Number.isInteger(column)){  // pacman eet dot op als hij perfect erboven staat
            if(this.map[row][column] == 0){
                this.map[row][column] = 5;
                return true;
            }
        }
        return false;
    }

    eatPowerDot(x, y){
        const row = y / this.tileSize;
        const column = x / this.tileSize;
        if(Number.isInteger(row) && Number.isInteger(column)){ 
            if(this.map[row][column] == 7){
                this.map[row][column] = 5;
                return true;
            }
        } 
        return false;      
    }

    didWin(){ // gewonnen als geen dots meer over, dus de lijst heeft lengte 0
        return this.#dotsLeft() == 0;
    }

    #dotsLeft(){
        // flat verandert een lijst van lijsten in 1 lijst en verwijdert geen dubbele elementen
        // filter laat enkele in de flat-lijst de elementen staan met een yellow dot
        return this.map.flat().filter((tile) => tile == 0).length;
    }


}