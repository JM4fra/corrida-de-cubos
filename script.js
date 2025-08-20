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
  x: 80,  // posição inicial horizontal
  y: 0,   // posição inicial vertical, vai ajustar no ajustarCanvas
  radius: 50,
  stickX: 80,
  stickY: 0, // idem
  active: false
};

let toque = null; // posição atual do dedo

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

  requestAnimationFrame(gameLoop);
}

gameLoop();