document.addEventListener('DOMContentLoaded', () => {
  const currentPlan = document.body.dataset.plan; // 'basico' or 'premium'
  
  initSidebarToggle();
  initNavigation(currentPlan);
  initLessonCompletion(currentPlan);
  
  if (currentPlan === 'premium') {
    initPremiumChecklist();
  }
});

/* ==================== 1. SIDEBAR MOBILE TOGGLE ==================== */
function initSidebarToggle() {
  const toggleBtn = document.querySelector('.menu-toggle-btn');
  const sidebar = document.querySelector('.members-sidebar');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    // Fechar ao clicar fora no mobile
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
  }
}

/* ==================== 2. NAVEGAÇÃO DE CONTEÚDO (MÓDULOS) ==================== */
function initNavigation(plan) {
  const navItems = document.querySelectorAll('.nav-menu .nav-item:not(.locked)');
  const contentSections = document.querySelectorAll('.dynamic-section');
  const pathTitle = document.querySelector('.topbar-title-path');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Se for link externo para portal, deixa seguir
      if (item.classList.contains('portal-link')) return;

      e.preventDefault();
      const targetId = item.dataset.target;
      if (!targetId) return;

      // Atualizar classe ativa no menu
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Alternar seções de conteúdo
      contentSections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('fade-in');
      });

      const activeSection = document.getElementById(targetId);
      if (activeSection) {
        activeSection.style.display = 'block';
        activeSection.classList.add('fade-in');
        
        // Rolar para o topo da área principal
        document.querySelector('.members-main').scrollTop = 0;
      }

      // Atualizar o breadcrumb no topo
      if (pathTitle) {
        const sectionName = item.querySelector('span').textContent;
        const mainCategory = item.closest('.nav-menu').previousElementSibling.textContent;
        pathTitle.innerHTML = `<span>${mainCategory}</span> &raquo; <strong>${sectionName}</strong>`;
      }

      // Fechar menu mobile se estiver aberto
      const sidebar = document.querySelector('.members-sidebar');
      if (sidebar) sidebar.classList.remove('active');
    });
  });
}

/* ==================== 3. LÓGICA DE CONCLUSÃO DE AULAS & PROGRESSO ==================== */
function initLessonCompletion(plan) {
  const completeButtons = document.querySelectorAll('.lesson-completed-badge-btn');
  const storageKey = `lei_suposicao_completed_${plan}`;
  
  // Carregar aulas concluídas salvas
  let completedLessons = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Aplicar estado inicial
  completeButtons.forEach(btn => {
    const lessonId = btn.dataset.lessonId;
    if (completedLessons.includes(lessonId)) {
      btn.classList.add('checked');
      btn.querySelector('span').textContent = 'Concluído';
    }
    
    btn.addEventListener('click', () => {
      btn.classList.toggle('checked');
      const isChecked = btn.classList.contains('checked');
      
      if (isChecked) {
        btn.querySelector('span').textContent = 'Concluído';
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
        }
        triggerDownloadConfetti();
      } else {
        btn.querySelector('span').textContent = 'Marcar como Concluído';
        completedLessons = completedLessons.filter(id => id !== lessonId);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(completedLessons));
      updateProgressBar(plan, completedLessons.length);
    });
  });

  // Atualizar barra de progresso inicialmente
  updateProgressBar(plan, completedLessons.length);
}

// Atualizar a Barra de Progresso Dourada
function updateProgressBar(plan, completedCount) {
  const totalLessons = plan === 'basico' ? 5 : 11; // 5 módulos básicos vs 11 premium
  const percentage = Math.min(Math.round((completedCount / totalLessons) * 100), 100);
  
  const fill = document.querySelector('.progress-bar-fill');
  const percentText = document.querySelector('.progress-percent');
  const fractionText = document.querySelector('.progress-fraction');
  
  if (fill) fill.style.width = `${percentage}%`;
  if (percentText) percentText.textContent = `${percentage}%`;
  if (fractionText) fractionText.textContent = `${completedCount}/${totalLessons} Concluídos`;
}

/* ==================== 4. CHECKLIST INTERATIVO PREMIUM ==================== */
function initPremiumChecklist() {
  const checklistItems = document.querySelectorAll('.checklist-task-item');
  const storageKey = 'lei_suposicao_premium_checklist';
  
  // Carregar status salvo do checklist
  let checklistState = JSON.parse(localStorage.getItem(storageKey)) || {};

  // Aplicar status salvo
  checklistItems.forEach(item => {
    const taskId = item.dataset.taskId;
    
    if (checklistState[taskId]) {
      item.classList.add('completed');
    }
    
    item.addEventListener('click', () => {
      item.classList.toggle('completed');
      const isCompleted = item.classList.contains('completed');
      
      checklistState[taskId] = isCompleted;
      localStorage.setItem(storageKey, JSON.stringify(checklistState));
      
      if (isCompleted) {
        triggerDownloadConfetti();
      }
    });
  });
}

/* ==================== EFEITO MICRO-CONFETTI DE SUCESSO ==================== */
function triggerDownloadConfetti() {
  // Criar pequenas estrelinhas ou faíscas douradas saindo da tela para celebrar
  const body = document.body;
  const colors = ['#D4AF37', '#F6E6C2', '#AA7C11', '#FFF'];
  
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = `${Math.random() * 8 + 4}px`;
    confetti.style.height = confetti.style.width;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.left = '50%';
    confetti.style.top = '50%';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 8 + 4;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 3; // Lançar um pouco para cima
    
    body.appendChild(confetti);
    
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let opacity = 1;
    
    const interval = setInterval(() => {
      x += vx;
      y += vy;
      opacity -= 0.03;
      
      confetti.style.left = `${x}px`;
      confetti.style.top = `${y}px`;
      confetti.style.opacity = opacity;
      
      if (opacity <= 0) {
        clearInterval(interval);
        confetti.remove();
      }
    }, 16);
  }
}

// Expor para download simulado
window.simulateDownload = function(fileName) {
  triggerDownloadConfetti();
  alert(`📥 Manifestando Sucesso... \n\nO download de "${fileName}" foi simulado com sucesso em alta qualidade!`);
};
