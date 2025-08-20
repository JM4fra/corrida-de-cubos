const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Analógico virtual para celular
let joystick = {
  x: 80,  // posição inicial horizontal
  y: 0,   // posição inicial vertical, vai ajustar no ajustarCanvas
  radius: 50,
  stickX: 80,
  stickY: 0, // idem
  active: false
};

let toque = null; // posição atual do dedo

// Ajustar canvas para ocupar toda a tela e posicionar joystick
function ajustarCanvas() {
  // Limitar altura ao tamanho da janela disponível
  canvas.width = window.innerWidth;
  canvas.height = Math.min(window.innerHeight, 600); // 600 é altura máxima no PC

  // Joystick proporcional à tela
  joystick.radius = Math.min(canvas.width, canvas.height) * 0.08; // 8% do menor lado
  joystick.x = joystick.radius + 20; // 20px da borda esquerda
  joystick.y = canvas.height - joystick.radius - 20; // 20px da borda inferior
  joystick.stickX = joystick.x;
  joystick.stickY = joystick.y;
}

// Inicializa canvas e joystick
ajustarCanvas();
window.addEventListener('resize', ajustarCanvas);

// Cubo do jogador
const cubo = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  color: 'lime',
  speed: 5
};

// Obstáculos
const obstaculos = [];

// Criar obstáculos aleatórios
function criarObstaculo() {
  const largura = Math.random() * 50 + 20;
  const x = Math.random() * (canvas.width - largura);
  obstaculos.push({ x, y: -20, width: largura, height: 20, color: 'red' });
}

// Atualizar posição dos obstáculos
function atualizarObstaculos() {
  for (let i = 0; i < obstaculos.length; i++) {
    obstaculos[i].y += 3;
    if (obstaculos[i].y > canvas.height) {
      obstaculos.splice(i, 1);
      i--;
    }
  }
}

// Desenhar cubo, obstáculos e joystick
function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cubo do jogador
  ctx.fillStyle = cubo.color;
  ctx.fillRect(cubo.x, cubo.y, cubo.width, cubo.height);

  // Obstáculos
  for (const obs of obstaculos) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  // Desenhar joystick se ativo
  if (joystick.active) {
    ctx.beginPath();
    ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI*2);
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, 20, 0, Math.PI*2);
    ctx.fillStyle = 'gray';
    ctx.fill();
  }
}

// Objeto para controle de teclas
const teclas = {
  esquerda: false,
  direita: false,
  cima: false,
  baixo: false
};

// Detecta teclas pressionadas
document.addEventListener('keydown', e => {
  if (e.key === 'a' || e.key === 'ArrowLeft') teclas.esquerda = true;
  if (e.key === 'd' || e.key === 'ArrowRight') teclas.direita = true;
  if (e.key === 'w' || e.key === 'ArrowUp') teclas.cima = true;
  if (e.key === 's' || e.key === 'ArrowDown') teclas.baixo = true;
});

// Detecta teclas soltas
document.addEventListener('keyup', e => {
  if (e.key === 'a' || e.key === 'ArrowLeft') teclas.esquerda = false;
  if (e.key === 'd' || e.key === 'ArrowRight') teclas.direita = false;
  if (e.key === 'w' || e.key === 'ArrowUp') teclas.cima = false;
  if (e.key === 's' || e.key === 'ArrowDown') teclas.baixo = false;
});

// Eventos touch para joystick
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const touch = e.touches[0];
  const dx = touch.clientX - joystick.x;
  const dy = touch.clientY - joystick.y;
  if (Math.sqrt(dx*dx + dy*dy) <= joystick.radius) {
    joystick.active = true;
  }
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const touch = e.touches[0];
  toque = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (!joystick.active) return;
  const touch = e.touches[0];
  let dx = touch.clientX - joystick.x;
  let dy = touch.clientY - joystick.y;
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), joystick.radius);
  const angle = Math.atan2(dy, dx);

  joystick.stickX = joystick.x + Math.cos(angle) * dist;
  joystick.stickY = joystick.y + Math.sin(angle) * dist;

  // Movimentação proporcional
  cubo.x += Math.cos(angle) * dist * 0.1;
  cubo.y += Math.sin(angle) * dist * 0.1;

  // Limites do canvas
  cubo.x = Math.max(0, Math.min(cubo.x, canvas.width - cubo.width));
  cubo.y = Math.max(0, Math.min(cubo.y, canvas.height - cubo.height));

  toque = { x: touch.clientX, y: touch.clientY };
});

canvas.addEventListener('touchend', e => {
  e.preventDefault();
  joystick.active = false;
  joystick.stickX = joystick.x;
  joystick.stickY = joystick.y;
  toque = null;
});

// Loop do jogo
function gameLoop() {
  // Movimento fluido do PC
  if (teclas.esquerda && cubo.x > 0) cubo.x -= cubo.speed;
  if (teclas.direita && cubo.x + cubo.width < canvas.width) cubo.x += cubo.speed;
  if (teclas.cima && cubo.y > 0) cubo.y -= cubo.speed;
  if (teclas.baixo && cubo.y + cubo.height < canvas.height) cubo.y += cubo.speed;

  // Movimento por toque
  if (toque) {
    const dx = toque.x - (cubo.x + cubo.width / 2);
    const dy = toque.y - (cubo.y + cubo.height / 2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = Math.min(5, dist); // velocidade máxima
    if (dist > 1) {
      cubo.x += dx / dist * speed;
      cubo.y += dy / dist * speed;
    }
  }

  if (Math.random() < 0.02) criarObstaculo();
  atualizarObstaculos();
  desenhar();
  requestAnimationFrame(gameLoop);
}

// Iniciar jogo
gameLoop();