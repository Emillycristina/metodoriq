document.addEventListener('DOMContentLoaded', () => {
  // Verificar parâmetros da URL primeiro (links diretos de plataformas de pagamento)
  const urlParams = new URLSearchParams(window.location.search);
  const acessoParam = urlParams.get('acesso') || urlParams.get('plano');

  if (acessoParam) {
    const planMap = {
      'basico': 'basico',
      'essencial': 'basico',
      'premium': 'premium',
      'completo': 'premium',
      'vip': 'premium'
    };
    const plan = planMap[acessoParam.toLowerCase()];
    if (plan) {
      hideLinkGate();
      localStorage.setItem('lei_suposicao_plan', plan);
      showLoadingAndRedirect(plan);
      return;
    }
  }

  // Verificar se já tem acesso salvo
  const savedPlan = localStorage.getItem('lei_suposicao_plan');
  if (savedPlan === 'basico' || savedPlan === 'premium') {
    hideLinkGate();
    showLoadingAndRedirect(savedPlan);
    return;
  }

  // Mostrar o gate de login
  showLoginGate();
  createGoldSparks();
});

function hideLinkGate() {
  const loginCard = document.getElementById('portal-login-gate');
  if (loginCard) loginCard.style.display = 'none';
  const header = document.querySelector('.portal-header');
  if (header) header.style.display = 'none';
}


/* ==================== GATE DE ACESSO ==================== */
function showLoginGate() {
  const cardsGrid = document.querySelector('.portal-cards-grid');
  if (cardsGrid) cardsGrid.style.display = 'none';

  const loginCard = document.getElementById('portal-login-gate');
  if (loginCard) {
    loginCard.style.display = 'block';
    loginCard.classList.add('fade-in');
  }

  const form = document.getElementById('portal-access-form');
  if (form) {
    form.addEventListener('submit', handleAccessSubmit);
  }
}

/* ==================== VALIDAÇÃO DE CÓDIGO ==================== */
const VALID_CODES = {
  // Plano Básico
  'LEI-ESSENCIAL': 'basico',
  'BASICO123': 'basico',
  'ESSENCIAL': 'basico',
  // Plano Premium
  'LEI-VIP': 'premium',
  'PREMIUM999': 'premium',
  'COMPLETO': 'premium',
  'VIP': 'premium'
};

function handleAccessSubmit(e) {
  e.preventDefault();

  const input = document.getElementById('portal-code-input');
  const alert = document.getElementById('portal-access-alert');
  const code = input.value.trim().toUpperCase();

  // Limpar estado anterior
  input.classList.remove('shake');
  alert.className = 'portal-alert';
  alert.textContent = '';

  if (!code) {
    showInputError(input, alert, 'Por favor, insira o seu código de acesso.');
    return;
  }

  const plan = VALID_CODES[code];

  if (plan) {
    // Código válido!
    alert.className = 'portal-alert success';
    alert.innerHTML = '✅ Acesso validado! Abrindo seu portal...';

    localStorage.setItem('lei_suposicao_plan', plan);

    setTimeout(() => {
      showLoadingAndRedirect(plan);
    }, 800);
  } else {
    showInputError(input, alert, '🔒 Código inválido. Verifique seu e-mail de compra e tente novamente.');
  }
}

function showInputError(input, alert, message) {
  // Forçar reflow para reiniciar a animação
  void input.offsetWidth;
  input.classList.add('shake');
  alert.className = 'portal-alert error';
  alert.textContent = message;
  input.focus();
}

/* ==================== LOADING E REDIRECIONAMENTO ==================== */
function showLoadingAndRedirect(plan) {
  const overlay = document.getElementById('portal-loading-overlay');
  const loadingTitle = document.getElementById('loading-title');
  const loadingMsg = document.getElementById('loading-msg');

  if (!overlay) {
    window.location.href = plan === 'premium' ? 'premium.html' : 'basico.html';
    return;
  }

  if (plan === 'premium') {
    loadingTitle.textContent = 'Portal VIP Premium';
    loadingMsg.textContent = 'Abrindo sua área exclusiva com acesso completo...';
  } else {
    loadingTitle.textContent = 'Área Essencial';
    loadingMsg.textContent = 'Abrindo sua área de membros personalizada...';
  }

  overlay.classList.add('active');

  setTimeout(() => {
    window.location.href = plan === 'premium' ? 'premium.html' : 'basico.html';
  }, 1500);
}

/* ==================== PARTÍCULAS DOURADAS ==================== */
function createGoldSparks() {
  const canvas = document.createElement('canvas');
  canvas.id = 'portal-canvas-particles';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  
  const container = document.querySelector('.portal-container');
  if (container) {
    container.appendChild(canvas);
  } else {
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = container.offsetWidth;
  let height = canvas.height = container.offsetHeight;

  const particles = [];
  const particleCount = 45;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 100;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.8 + 0.3);
      this.speedX = Math.random() * 0.6 - 0.3;
      this.opacity = Math.random() * 0.7 + 0.1;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity -= this.fadeSpeed;

      if (this.y < -10 || this.opacity <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = '#D4AF37';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.y = Math.random() * height;
    particles.push(p);
  }

  window.addEventListener('resize', () => {
    width = canvas.width = container.offsetWidth;
    height = canvas.height = container.offsetHeight;
  });

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowBlur = 0;
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    requestAnimationFrame(animate);
  }

  animate();
}

/* ==================== ANIMAÇÃO DOS CARDS (legado) ==================== */
function animateCards() {
  const cards = document.querySelectorAll('.plan-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 200 + index * 150);
  });
}
