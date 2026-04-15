const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 600;

let gameState = "menu";

// PLAYER
let player = {
  x: 100,
  y: 100,
  size: 20,
  speed: 3.5,
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
  speed: 1.4,
  alive: true
};

let bullets = [];
let keys = {};
let mouse = { x: 0, y: 0 };

// INICIAR
function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameState = "playing";
}

// TECLADO
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// MOUSE POS
canvas.addEventListener("mousemove", e => {
  let rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// TIRO
canvas.addEventListener("click", () => {
  if (!player.hasGun) return;

  let dx = mouse.x - player.x;
  let dy = mouse.y - player.y;
  let dist = Math.sqrt(dx*dx + dy*dy);

  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / dist) * 8,
    vy: (dy / dist) * 8
  });
});

function update() {
  if (gameState !== "playing") return;

  // MOVIMENTO
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // PEGAR ARMA
  if (!gun.picked &&
      player.x < gun.x + gun.size &&
      player.x + player.size > gun.x &&
      player.y < gun.y + gun.size &&
      player.y + player.size > gun.y) {
    gun.picked = true;
    player.hasGun = true;
  }

  // INIMIGO SEGUE
  if (enemy.alive) {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;
  }

  // TIROS
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

  // MORTE
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

  // FUNDO
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // PLAYER
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // ARMA
  if (!gun.picked) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(gun.x, gun.y, gun.size, gun.size);
  }

  // INIMIGO
  if (enemy.alive) {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  }

  // TIROS
  ctx.fillStyle = "orange";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 6, 6));

  // ===== LANTERNA =====
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";

  let cx = player.x + player.size / 2;
  let cy = player.y + player.size / 2;

  let grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 150);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 150, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  // ====================

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
