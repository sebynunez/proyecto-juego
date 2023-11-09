//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns *2; // 32 * 16
let boardHeight = tileSize * rows ; // 32 * 16
let context;

//ship
let shipWidth = tileSize*4;
let shipHeight = tileSize*4;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*3.5;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize; //velocidad del personaje 

//gaviotas
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize *1.5;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 1;
let alienColumns = 4;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //velocidad de movimiento de las gaviotas 

//balas
let bulletArray = [];
let bulletVelocityY = -5; //velocidad de balas 

let score = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    //carga de imagenes
    shipImg = new Image();
    shipImg.src = "./img/modelo.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./img/gaviota.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //gaviotas 
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //si los aliens chocan con los bordes
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*1.5;

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //balas
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="blue";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        //choque de balas con las gaviotas
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 50;
            }
        }
    }

    //limpiar balas
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //siguiente nivel
    if (alienCount == 0) {
        //al terminar incrementa el numero de gaviotas en la fila y columna
        score += alienColumns * alienRows * 50; //bonus por terminar el nivel 
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); //cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows -4);  //cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.4; //incrementa el movimiento de los aliens hacia la derecha
        }
        else {
            alienVelocityX -= 0.4; //incrementa el movimiento hacia la izuquierda
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //puntuacion 
    context.fillStyle="black";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth*1,
                y : alienY + r*alienHeight*1,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        //tiro
        let bullet = {
            x : ship.x + shipWidth*15/27,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/4,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
        a.x + a.width > b.x &&  
        a.y < b.y + b.height &&  
        a.y + a.height > b.y;    
}