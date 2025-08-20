const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta canvas para ocupar 100% da tela
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener('resize', ajustarCanvas);

// Analógico virtual para celular
let joystick = {
  x: 0,
  y: 0,
  radius: 50,
  stickX: 0,
  stickY: 0,
  active: false
};

// Limite vertical para ativar joystick
const limiteInferior = canvas.height * 0.5; // metade inferior da tela
const distanciaBordaInferior = 100; // sobe um pouco do fim da tela

let toque = null; // posição atual do dedo

canvas.addEventListener('touchstart', e => {
  const touch = e.touches[0];

  // só ativa se estiver na metade inferior
  if (touch.clientY > limiteInferior) {
    joystick.active = true;
    joystick.x = touch.clientX;
    joystick.y = canvas.height - distanciaBordaInferior; // sobe do fim
    joystick.stickX = joystick.x;
    joystick.stickY = joystick.y;
  }
});

canvas.addEventListener('touchmove', e => {
  if (!joystick.active) return;
  const touch = e.touches[0];
  let dx = touch.clientX - joystick.x;
  let dy = touch.clientY - joystick.y;
  const dist = Math.min(Math.sqrt(dx*dx + dy*dy), joystick.radius);
  const angle = Math.atan2(dy, dx);

  joystick.stickX = joystick.x + Math.cos(angle) * dist;
  joystick.stickY = joystick.y + Math.sin(angle) * dist;

  // Movimento proporcional
  cubo.x += Math.cos(angle) * dist * 0.1;
  cubo.y += Math.sin(angle) * dist * 0.1;

  // Limites do canvas
  cubo.x = Math.max(0, Math.min(cubo.x, canvas.width - cubo.width));
  cubo.y = Math.max(0, Math.min(cubo.y, canvas.height - cubo.height));
});

canvas.addEventListener('touchend', e => {
  joystick.active = false;
  joystick.stickX = joystick.x;
  joystick.stickY = joystick.y;
});

// Cubo do jogador
const cubo = { x:100, y:100, width:40, height:40, color:'lime', speed:5 };

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

  // Movimento touch
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

  // Desenhar cubo
  ctx.fillStyle = cubo.color;
  ctx.fillRect(cubo.x, cubo.y, cubo.width, cubo.height);

  // Desenhar joystick
  desenharJoystick();

  requestAnimationFrame(gameLoop);
}

gameLoop();