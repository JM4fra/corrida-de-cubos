const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta canvas para ocupar 100% da tela
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener('resize', ajustarCanvas);

// Cubo do jogador
const cubo = { x:100, y:100, width:40, height:40, color:'lime', speed:5 };

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
    obstaculos[i].y += 3; // velocidade do obstáculo
    if (obstaculos[i].y > canvas.height) {
      obstaculos.splice(i, 1);
      i--;
    }
  }
}

// Desenhar obstáculos
function desenharObstaculos() {
  for (const obs of obstaculos) {
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }
}

// Objeto para controle de teclas
const teclas = { esquerda:false, direita:false, cima:false, baixo:false };
document.addEventListener('keydown', e => {
  if (e.key==='a'||e.key==='ArrowLeft') teclas.esquerda=true;
  if (e.key==='d'||e.key==='ArrowRight') teclas.direita=true;
  if (e.key==='w'||e.key==='ArrowUp') teclas.cima=true;
  if (e.key==='s'||e.key==='ArrowDown') teclas.baixo=true;
});
document.addEventListener('keyup', e => {
  if (e.key==='a'||e.key==='ArrowLeft') teclas.esquerda=false;
  if (e.key==='d'||e.key==='ArrowRight') teclas.direita=false;
  if (e.key==='w'||e.key==='ArrowUp') teclas.cima=false;
  if (e.key==='s'||e.key==='ArrowDown') teclas.baixo=false;
});

// Analógico virtual opcional (mantido se quiser)
let joystick = { x:0, y:0, radius:50, stickX:0, stickY:0, active:false };

// Touch direto (cubos seguem o dedo)
let toque = null;

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const touch = e.touches[0];
  toque = { x: touch.clientX, y: touch.clientY };
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  toque = { x: touch.clientX, y: touch.clientY };
});
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  toque = null;
});

// Desenhar joystick (opcional)
function desenharJoystick() {
  if (!joystick.active) return;

  ctx.beginPath();
  ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI*2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(joystick.stickX, joystick.stickY, 20, 0, Math.PI*2);
  ctx.fillStyle = 'gray';
  ctx.fill();
}

// Loop do jogo
function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Movimento PC
  if (teclas.esquerda && cubo.x>0) cubo.x -= cubo.speed;
  if (teclas.direita && cubo.x+cubo.width<canvas.width) cubo.x += cubo.speed;
  if (teclas.cima && cubo.y>0) cubo.y -= cubo.speed;
  if (teclas.baixo && cubo.y+cubo.height<canvas.height) cubo.y += cubo.speed;

  // Movimento touch direto
  if (toque) {
    const dx = toque.x - (cubo.x+cubo.width/2);
    const dy = toque.y - (cubo.y+cubo.height/2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = Math.min(10, dist);
    if (dist > 1) {
      cubo.x += dx/dist * speed;
      cubo.y += dy/dist * speed;
    }
  }

  // Criar e atualizar obstáculos
  if (Math.random() < 0.02) criarObstaculo();
  atualizarObstaculos();

  // Desenhar obstáculos
  desenharObstaculos();

  // Desenhar cubo
  ctx.fillStyle = cubo.color;
  ctx.fillRect(cubo.x, cubo.y, cubo.width, cubo.height);

  // Desenhar joystick (opcional)
  desenharJoystick();

  requestAnimationFrame(gameLoop);
}

// Iniciar jogo
gameLoop();
