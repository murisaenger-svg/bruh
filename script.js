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
let mouse = { x: 0, y: 0 };

function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  gameState = "playing";
}

// teclado
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// posição do mouse
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// tiro
canvas.addEventListener("click", () => {
  if (!player.hasGun) return;

  let dx = mouse.x - player.x;
  let dy = mouse.y - player.y;
  let dist = Math.sqrt(dx*dx + dy*dy);

  bullets.push({
    x: player.x,
    y: player.y,
    dx: (dx / dist) * 6,
    dy: (dy / dist) * 6
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

  // inimigo persegue
  if (enemy.alive) {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;
  }

  // atualizar tiros
  bullets.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;

    // colisão com inimigo
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

  // desenha tudo primeiro
  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  if (!gun.picked) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(gun.x, gun.y, gun.size, gun.size);
  }

  if (enemy.alive) {
    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
  }

  ctx.fillStyle = "orange";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 5, 5));

  // LANTERNA CORRIGIDA (escurece ao redor, não apaga objetos)
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-out";
  let gradient = ctx.createRadialGradient(
    player.x, player.y, 20,
    player.x, player.y, 120
  );
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("WASD = mover | clique = atirar", 20, 30);

  if (gameState === "win") {
    ctx.font = "40px Arial";
    ctx.fillText("VOCÊ VENCEU", 250, 300);
  }

  if (gameState === "lose") {
    ctx.font = "40px Arial";
    ctx.fillText("VOCÊ MORREU", 250, 300);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
