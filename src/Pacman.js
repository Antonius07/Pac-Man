import MovingDirection from "./MovingDirection.js";

export default class Pacman{
    constructor(x, y, tilesize, velocity, tilemap){
        this.x  = x;
        this.y = y;
        this.tilesize = tilesize;
        this.velocity = velocity;
        this.tilemap = tilemap;

        this.currentMovingDirection = null;
        this.requestedMovingDirection = null;

        this.pacmanAnimationTimerDefault = 10;
        this.pacmanAnimationTimer = null;

        this.pacmanRotation = this.Rotation.right;

        this.wakaSound = new Audio('sounds/waka.wav');
        this.powerDotSound = new Audio('sounds/power_dot.wav');
        this.eatGhostSound = new Audio('sounds/eat_ghost.wav');

        this.powerDotActive = false; // ghost is blue
        this.powerDotAboutToExpire = false; // ghost flashes white and blue
        this.timers = []; // lijst van timers voor de powerdot

        this.madeFirstMove = false;

        document.addEventListener('keydown',this.#keydown);

        this.#loadPacmanImages();
    }

    Rotation ={
        right:0,
        down:1,
        left:2,
        up:3
    }

    draw(ctx, pause, enemies){
        if (!pause){
            this.#move();
            this.#animate();
        }
        this.#eatDot();
        this.#eatPowerDot();
        this.#eatGhost(enemies);

        // we willen Pacman laten roteren rond zijn middelpunt: vind middelpunt(= nieuw rotatiepunt) met translate, en roteer dan via rotate
        const size = this.tilesize/2;
        
        ctx.save(); // sla alles op van de canvas-context, met restore kan je alles weer ongedaan maken
        ctx.translate(this.x + size, this.y + size); // positie in het midden van pacman-vierkante afbeelding
        ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180); // rotatie 90°, met een hoek in radialen
        // pacman is nu (0,0) en niet linkerbovenhoek, dus, teken van (left,right) = (-size,-size) met hoogte en breedte van tile
        ctx.drawImage(this.pacmanImages[this.pacmanImageIndex], -size, -size, this.tilesize, this.tilesize);
        ctx.restore();


        /*ctx.drawImage(
            this.pacmanImages[this.pacmanImageIndex],
            this.x,
            this.y,
            this.tilesize,
            this.tilesize
        
        ); */
    }

    #loadPacmanImages(){ // volgorde in de lijst zorgt voor goede transitie voor de animatie
        const pacmanImage1 = new Image();
        pacmanImage1.src = 'images/pac0.png';

        const pacmanImage2 = new Image();
        pacmanImage2.src = 'images/pac1.png';
    
        const pacmanImage3 = new Image();
        pacmanImage3.src = 'images/pac2.png';

        const pacmanImage4 = new Image();
        pacmanImage4.src = 'images/pac1.png';

        this.pacmanImages = [
            pacmanImage1,
            pacmanImage2,
            pacmanImage3,
            pacmanImage4
        ];

        this.pacmanImageIndex = 0; // index 0 is dus pac0 (gesloten bekje)
    }


    // arrow function=()=> zorgt ervoor dat we steeds verwijzen naar de Pacman-constructors (= krijgt de 'this' van de Pacman-klasse)
    #keydown = (event) => {

        if(event.keyCode == 38){ // up
            // als we naar beneden bewegen, mogen we naar boven gaan
            if(this.currentMovingDirection == MovingDirection.down){ // dit wordt eerrste keer dat je toets indrukt niet uitegevoerd, want current is 'Null'
                this.currentMovingDirection = MovingDirection.up;
            }
            this.requestedMovingDirection = MovingDirection.up;
            this.madeFirstMove = true;
        }   

        if(event.keyCode == 40){ // down
            // als we naar boven bewegen, mogen we naar beneden gaan
            if(this.currentMovingDirection == MovingDirection.up){
                this.currentMovingDirection = MovingDirection.down;
            }
            this.requestedMovingDirection = MovingDirection.down;
            this.madeFirstMove = true;

        }

        if(event.keyCode == 37){ // left
            if(this.currentMovingDirection == MovingDirection.right){
                this.currentMovingDirection = MovingDirection.left;
            }
            this.requestedMovingDirection = MovingDirection.left;
            this.madeFirstMove = true;
        }

        if(event.keyCode == 39){ // right
            if(this.currentMovingDirection == MovingDirection.left){
                this.currentMovingDirection = MovingDirection.right;
            }
            this.requestedMovingDirection = MovingDirection.right;
            this.madeFirstMove = true;
        }
    }


    #move(){
        // als je het spel start door key in te drukken wordt 'requested' ingesteld, maar 'current' wordt nooit ignesteld (blijft null); ze zijn dus niet gelijk aan elkaar
        // je kan enkel van richting veranderen als je pacman perfect in het midden van een vakje staat (dus deelbaar door tilesize 32)
        // je gaat naar rechts (current) en wilt naar beneden (requested), dan kan dat alleen als er geen muur is

        if (this.currentMovingDirection != this.requestedMovingDirection){
            if (Number.isInteger(this.x/this.tilesize) && Number.isInteger(this.y/this.tilesize)){

                // we botsen met de gewilde richting niet tegen een muur, dan mag de current gelijkgesteld worden aan de requested en zal in de switch pacman bewegen
                if(!this.tilemap.didCollideWithEnvironment(this.x,this.y,this.requestedMovingDirection)){
                    this.currentMovingDirection = this.requestedMovingDirection;
                }
            }
        }


        // ook als current == requested (dus bvb je gaat rechtdoor en wilt rechtdoor blijven gaan), mag je niet door de muur
        // switch = alternatief voor lange 'if else if...'

        if (this.tilemap.didCollideWithEnvironment(this.x, this.y, this.currentMovingDirection)){
            this.pacmanAnimationTimer = null; // als hij tegen muur botst, stopt de animatie
            this.pacmanImageIndex = 1; // als hij tegen muur botst, stel dan in op index 1
            
            return;
        }


        // we bewegen effectief en de timer staat nog op null, stel dan de default waarde in
        else if(this.currentMovingDirection != null && this.pacmanAnimationTimer == null){
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault; 
        }

        
        switch(this.currentMovingDirection){
                // als current == .up, dan..
                case MovingDirection.up:
                    this.y -= this.velocity;
                    this.pacmanRotation = this.Rotation.up;
                    break;
                case MovingDirection.down:
                    this.y += this.velocity;
                    this.pacmanRotation = this.Rotation.down;
                    break;
                case MovingDirection.left:
                    this.x -= this.velocity;
                    this.pacmanRotation = this.Rotation.left;
                    break;
                case MovingDirection.right:
                    this.x += this.velocity;
                    this.pacmanRotation = this.Rotation.right;
                    break;
            }
    }


    #animate(){
        if(this.pacmanAnimationTimer == null){
            return;
        }
        this.pacmanAnimationTimer--; // verlaag het met 1

        if(this.pacmanAnimationTimer == 0){
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault; // reset opnieuw naar default-waarde 10
            this.pacmanImageIndex++; // ga naar de volgende afbeelding in de lijst
            
            if (this.pacmanImageIndex == this.pacmanImages.length){ 
                this.pacmanImageIndex = 0; // als we de 4 beelden hebben overlopen opnieuw naar startbeeld gaan
            }
        }
    }


    #eatDot(){
        // tweede voorwaarde elimineert het geluidje terwijl je nog niet een toets indrukt, maar wel al op de dot stond en die dus opat
        if(this.tilemap.eatDot(this.x,this.y) && this.madeFirstMove){
            this.wakaSound.play();
        }
    }

    #eatPowerDot(){
        if(this.tilemap.eatPowerDot(this.x, this.y)){
            this.powerDotSound.play();

            // 6 seconden lang dat ghost gegeten kunnen worden, na 3 seconden (v/d 6) beginnen ze te flikkeren
            this.powerDotActive = true;
            this.powerDotAboutToExpire = false;

            this.timers.forEach((timer) => clearTimeout(timer)); // clearTimeout stopt elke timer in de lijst van timers
            this.timers = []; // verwijder de timers door de lijst te legen

            // na 6 seconden zal de deze timer deze twee dingen instellen
            let TimerActive = setTimeout(() => {
                this.powerDotActive = false;
                this.powerDotAboutToExpire = false;
            }, 6000);

            this.timers.push(TimerActive); // voeg deze timer toe aan de lijst

            // na 3 seconden stelt hij het volgende in
            let TimerExpire = setTimeout(() => {
                this.powerDotAboutToExpire = true;
            }, 3000);

            this.timers.push(TimerExpire);
        }
    }

    #eatGhost(enemies){
        if(this.powerDotActive){
            // maakt uit lijst van enemies een nieuwe lijst aan collideEnemies
            // .filter() doet als for-lus en voegt elke ghost toe die met pacman ('this') collided
            const collideEnemies = enemies.filter((enemy) => enemy.collideWith(this));
            // we moeten al die enemies waar hij mee collided heeft tijdens powerDotActive verwijderen uit de game
            collideEnemies.forEach((enemy) => {
                // verwijder elke enemy uit de lijst enemies
                // enemies.indexOf(enemy) : zoek op welke positie enemy staat in enemies en verwijder 1 element
                enemies.splice(enemies.indexOf(enemy), 1);
                this.eatGhostSound.play();
            });
        }
    }


}