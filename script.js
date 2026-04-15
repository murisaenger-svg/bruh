const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let gameState = "menu";

// player
let player = {
  x: 100,
  y: 100,
  size: 20,
  speed: 3,
  hasGun: false
};

// arma
let gun = {
  x: 400,
  y: 300,
  size: 15,
  picked: false
};

// inimigo
let enemy = {
  x: 600,
  y: 400,
  size: 20,
  speed: 1.5,
  alive: true
};

let bullets = [];
let keys = {};

function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameState = "playing";
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.addEventListener("click", () => {
  if (!player.hasGun) return;

  bullets.push({
    x: player.x,
    y: player.y,
    dx: (enemy.x - player.x) / 20,
    dy: (enemy.y - player.y) / 20
  });
});

function update() {
  if (gameState !== "playing") return;

  // movimento
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

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
    b.x += b.dx;
    b.y += b.dy;

    if (enemy.alive &&
        b.x < enemy.x + enemy.size &&
        b.x > enemy.x &&
        b.y < enemy.y + enemy.size &&
        b.y > enemy.y) {
      enemy.alive = false;
      gameState = "win";
    }
  });

  // perdeu
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

  // tiros
  ctx.fillStyle = "orange";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 5));

  // lanterna
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  // telas finais
  if (gameState === "win") {
    ctx.fillStyle = "white";
    ctx.fillText("Você venceu!", 330, 50);
  }

  if (gameState === "lose") {
    ctx.fillStyle = "red";
    ctx.fillText("Você morreu", 330, 50);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
