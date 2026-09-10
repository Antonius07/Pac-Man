import MovingDirection from "./MovingDirection.js";

export default class Enemy{
    constructor(x, y, tilesize, velocity, tilemap){
        this.x = x;
        this.y = y;
        this.tilesize = tilesize;
        this.velocity = velocity;
        this.tilemap = tilemap;


        this.movingDirection = Math.floor(Math.random() * Object.keys(MovingDirection).length); // random waarde van 0 tot 4 (0,1,2,3)

        this.directionTimerDefault = this.#random(4,20); // random waarde voor de timer
        this.directionTimer = this.directionTimerDefault;

        this.scaredAboutToExpireTimerDefault = 10;
        this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
        
        this.#loadEnemyImages();
    }



    draw(ctx, pause, pacman){
        if (!pause){
            this.#move();
            this.#changeDirection();
        }
        this.#setImage(ctx,pacman)
    }


    collideWith(pacman){
        // colliden niet enkel als ze perfect op elkaar passen, maar als ze half op elkaar zijn, zie MDN Web Docs
        const size = this.tilesize / 2; // half op elkaar

        if( // de overlap checken voor x en y
            this.x < pacman.x + size &&
            this.x + size > pacman.x &&
            this.y < pacman.y + size &&
            this.y + size > pacman.y
        ) {
            return true;
        } else {
            return false;
        }
    }

    #setImage(ctx,pacman){
        if(pacman.powerDotActive){
            this.#setImageWhenPowerDotIsActive(pacman);
        } else {
            this.currentImage = this.normalGhost;
        }
        ctx.drawImage(this.currentImage, this.x, this.y, this.tilesize, this.tilesize);
    }


    #setImageWhenPowerDotIsActive(pacman){
        if(pacman.powerDotAboutToExpire){ // actief én flikkeren
            this.scaredAboutToExpireTimer--;
            if(this.scaredAboutToExpireTimer == 0){
                this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
                if(this.currentImage == this.scaredGhost){
                    this.currentImage = this.scaredGhost2;
                } else {
                    this.currentImage = this.scaredGhost;
                }
            }
        } else { // actief maar niet flikkeren
            this.currentImage = this.scaredGhost;
        }
    }


    #move(){
        if(!this.tilemap.didCollideWithEnvironment(this.x, this.y, this.movingDirection)){
            switch(this.movingDirection){
                case MovingDirection.up:
                    this.y -= this.velocity;
                    break;
                case MovingDirection.down: 
                    this.y += this.velocity;
                    break;
                case MovingDirection.left: 
                    this.x -= this.velocity;
                    break;
                case MovingDirection.right: 
                    this.x += this.velocity;
                    break;
            }
        }
    }

    #changeDirection(){
        this.directionTimer--;
        let newMoveDirection = null;

        if(this.directionTimer == 0){
            this.directionTimer = this.directionTimerDefault;
            newMoveDirection = Math.floor(Math.random() * Object.keys(MovingDirection).length); // random beweegrichting
        }

        // voorkomt dat een enemy in een muur gaat en de volgende keer nog eens indiezelfde muur wil
        if (newMoveDirection != null && newMoveDirection != this.movingDirection){
            if(Number.isInteger(this.x / this.tilesize) && Number.isInteger(this.y / this.tilesize)){
                if(!this.tilemap.didCollideWithEnvironment(this.x, this.y, this.newMoveDirection)){
                    this.movingDirection = newMoveDirection;
                }
            }
        }
    }


    #random(min,max){
        return Math.floor(Math.random() * (max-min + 1)) + min; // Math.random() geeft random decimaal getal tussen 0 en 1
    }

    #loadEnemyImages(){
        this.normalGhost = new Image();
        this.normalGhost.src = 'images/ghost.png';

        this.scaredGhost = new Image();
        this.scaredGhost.src = 'images/scaredGhost.png';

        this.scaredGhost2 = new Image();
        this.scaredGhost2.src = 'images/scaredGhost2.png';

        this.currentImage = this.normalGhost; // de huidige afbeelding
    }

}