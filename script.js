const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

let gameState = "menu";

// MAPA
const map = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,0,1],
  [1,0,0,1,0,0,1,0,0,1],
  [1,0,0,1,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

const tileSize = 60;

// PLAYER
let player = {
  x: 100,
  y: 100,
  size: 20,
  speed: 3,
  hasGun: false
};

// ARMA
let gun = {
  x: 500,
  y: 300,
  size: 15,
  picked: false
};

// INIMIGO
let enemy = {
  x: 700,
  y: 400,
  size: 20,
  speed: 1.2,
  alive: true
};

let bullets = [];
let keys = {};
let mouse = { x: 0, y: 0 };

// START
function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameState = "playing";
}

// INPUT
document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousemove", e => {
  let rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  if (!player.hasGun) return;

  let cx = player.x + player.size/2;
  let cy = player.y + player.size/2;

  let dx = mouse.x - cx;
  let dy = mouse.y - cy;
  let dist = Math.sqrt(dx*dx + dy*dy);

  bullets.push({
    x: cx,
    y: cy,
    vx: (dx / dist) * 8,
    vy: (dy / dist) * 8
  });
});

// COLISÃO CORRIGIDA (4 pontos)
function isWall(x, y) {
  let col = Math.floor(x / tileSize);
  let row = Math.floor(y / tileSize);
  return map[row] && map[row][col] === 1;
}

function canMove(x, y, size) {
  return !(
    isWall(x, y) ||
    isWall(x + size, y) ||
    isWall(x, y + size) ||
    isWall(x + size, y + size)
  );
}

function update() {
  if (gameState !== "playing") return;

  // movimento corrigido
  let nx = player.x;
  let ny = player.y;

  if (keys["w"]) ny -= player.speed;
  if (keys["s"]) ny += player.speed;
  if (keys["a"]) nx -= player.speed;
  if (keys["d"]) nx += player.speed;

  if (canMove(nx, player.y, player.size)) player.x = nx;
  if (canMove(player.x, ny, player.size)) player.y = ny;

  // pegar arma
  if (!gun.picked &&
      player.x < gun.x + gun.size &&
      player.x + player.size > gun.x &&
      player.y < gun.y + gun.size &&
      player.y + player.size > gun.y) {
    gun.picked = true;
    player.hasGun = true;
  }

  // inimigo segue
  if (enemy.alive) {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;
  }

  // tiros
  bullets.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;

    if (enemy.alive &&
        b.x < enemy.x + enemy.size &&
        b.x > enemy.x &&
        b.y < enemy.y + enemy.size &&
        b.y > enemy.y) {
      enemy.alive = false;
      gameState = "win";
    }
  });

  bullets = bullets.filter(b =>
    b.x > 0 && b.x < canvas.width &&
    b.y > 0 && b.y < canvas.height
  );

  // morte
  if (enemy.alive &&
      player.x < enemy.x + enemy.size &&
      player.x + player.size > enemy.x &&
      player.y < enemy.y + enemy.size &&
      player.y + player.size > enemy.y) {
    gameState = "lose";
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "menu") return;

  // mapa
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] === 1) {
        ctx.fillStyle = "#555";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }
  }

  // player
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // arma
  if (!gun.picked) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(gun.x, gun.y, gun.size, gun.size);
  }

  // inimigo
  if (enemy.alive) {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  }

  // balas
  ctx.fillStyle = "orange";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // LANTERNA SEM ROXO
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";

  let cx = player.x + player.size/2;
  let cy = player.y + player.size/2;

  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "26px Arial";
  ctx.fillText("WASD mover | clique atirar", 20, 40);

  if (gameState === "win") {
    ctx.font = "48px Arial";
    ctx.fillText("VOCÊ VENCEU", 250, 300);
  }

  if (gameState === "lose") {
    ctx.font = "48px Arial";
    ctx.fillText("VOCÊ MORREU", 250, 300);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
