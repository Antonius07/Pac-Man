import TileMap from './TileMap.js' // gebruik een '.' want dezelfde directory


const velocity = 2;
const tilesize = 32; // want elk vierkantje is 32 pixels

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tilemap = new TileMap(tilesize); // met 'new' maak je een nieuw object aan op basis van de klasse
let pacman = tilemap.getPacman(velocity);
let enemies = tilemap.getEnemies(velocity); // returnt een lijst


let gameOver = false;
let gameWin = false;
const gameOverSound = new Audio('sounds/gameOver.wav');
const gameWinSound = new Audio('sounds/gameWin.wav');


function gameLoop(){
    tilemap.draw(ctx); // dit is de methode-functie van de klasse
    drawGameEnd(); // plaatsing hier zodat pacman en enemies op de tekst worden getekend

    pacman.draw(ctx, pause(), enemies);

    // 'for each': overloop alle elementen in de lijst 'enemies'; lambda functie: voor elke 'enemy' in 'enemies', voer draw(ctx) uit
    // pause()-functie zorgt ervoor dat de monsters wachten met bewegen voordat jij en key indrukt (als kan je al sterven voordat je start met bewegen)
    // geef referentie naar pacman ==> referentie naar powerDotActive en powerDotAboutToExpire
    enemies.forEach((enemy) => enemy.draw(ctx,pause(), pacman)); 

    checkGameOver();
    checkGameWin();

}


function checkGameOver(){
    if (!gameOver){ // zorgt ervoor dat we het maar 1 keer checken
        gameOver = isGameOVer(); // collided with enemy?
        if (gameOver){
            gameOverSound.play();
        }
    }
}

function checkGameWin(){
    if (!gameWin){
        gameWin = tilemap.didWin();
        if (gameWin){
            gameWinSound.play();
        }
    }
}

function isGameOVer(){
    // 'some' betekent 'heeft één van jullie minstens met pacman gebotst?'
    // voorwaarden: geen power dot actief én botst met minstens één enemy botst met pacman
    return enemies.some(enemy => !pacman.powerDotActive && enemy.collideWith(pacman));
}


function pause(){
     return !pacman.madeFirstMove || gameOver || gameWin; // stop voordat je start OF bij gameOver OF bij gameWin
}

function drawGameEnd(){
    if(gameOver || gameWin){
        let text = '          You Win!';
        if(gameOver){
            text = "        Game Over" 
        }

        ctx.fillStyle = "black";
        ctx.fillRect(0, canvas.height/2.5, canvas.width, 80);

        ctx.font = "80px comic sans";
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop('0','magenta');
        gradient.addColorStop('0.5','blue');
        gradient.addColorStop('1.0','red');

        ctx.fillStyle = gradient;
        ctx.fillText(text, 10, canvas.height / 2);
    }
}


document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (gameOver || gameWin)) {
        restartGame();
    }
});

function restartGame(){
    tilemap = new TileMap(tilesize);
    pacman = tilemap.getPacman(velocity);
    enemies = tilemap.getEnemies(velocity);

    gameOver = false;
    gameWin = false; 
}


// stel de size correct in van het canvas naargelang je map met de methode 'setCanvasSize'
tilemap.setCanvasSize(canvas);

setInterval(gameLoop,1000/75); // gameLoop refresht 75 keer per 1000ms (= 1s)