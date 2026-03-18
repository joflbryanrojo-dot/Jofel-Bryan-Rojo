// ── CUSTOM CURSOR ──
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

document.addEventListener('mousemove', (e) => {
  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';
  ring.style.left = e.clientX + 'px';
  ring.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button, [data-tilt], .calc-btn').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
});


// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 90);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObs.observe(el));


// ── ACTIVE NAV + SCROLL SHRINK ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navbar   = document.querySelector('#navbar');

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => sectionObs.observe(s));

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});


// ── SMOOTH SCROLL ──
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ── TYPED HERO ROLE ──
const roles = [
  'Full Stack Developer',
  'UI/UX Enthusiast',
  'Problem Solver',
  'Open Source Contributor'
];
const typedEl = document.querySelector('.typed-text');

if (typedEl) {
  let rIdx = 0, cIdx = 0, deleting = false, cur = '';

  function type() {
    const full = roles[rIdx];
    cur = deleting ? full.slice(0, --cIdx) : full.slice(0, ++cIdx);
    typedEl.textContent = cur;

    let speed = deleting ? 38 : 75;
    if (!deleting && cur === full)    { speed = 2000; deleting = true; }
    else if (deleting && cur === '') { deleting = false; cIdx = 0; rIdx = (rIdx + 1) % roles.length; speed = 350; }
    setTimeout(type, speed);
  }
  setTimeout(type, 1100);
}


// ── 3D TILT ON CARDS ──
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
  });
});


// ── PYTHON CALCULATOR ──
let calcExpr    = '';
let calcResult  = '';
let justEvaled  = false;
let activeOp    = null;

const exprEl    = document.getElementById('calc-expr');
const resultEl  = document.getElementById('calc-result');
const outputEl  = document.getElementById('output-text');
const codeExpr  = document.getElementById('code-expr');
const codeRes   = document.getElementById('code-result');

function safeEval(expr) {
  // Replace display symbols with JS operators
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[^0-9+\-*/.() ]/g, '');

  try {
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (!isFinite(result)) throw new Error('Division by zero');
    // Round to avoid floating point noise
    return parseFloat(result.toPrecision(12)).toString();
  } catch (err) {
    if (err.message.includes('zero')) return 'ZeroDivisionError';
    return 'SyntaxError';
  }
}

function updateDisplay() {
  const display = calcExpr === '' ? '0' : calcExpr;
  exprEl.textContent = display;

  // Live preview
  if (calcExpr.length > 1) {
    const preview = safeEval(calcExpr);
    if (!preview.includes('Error')) {
      resultEl.textContent = '= ' + preview;
    } else {
      resultEl.textContent = '';
    }
  } else {
    resultEl.textContent = '';
  }

  // Update code panel
  const exprForCode = calcExpr || '""';
  codeExpr.textContent = `"${exprForCode}"`;
  codeRes.textContent  = `f"Result: {calculate(expression)}"`;
}

function renderOutput(result) {
  if (result === 'ZeroDivisionError') {
    outputEl.textContent = '>>> ZeroDivisionError: division by zero';
    outputEl.className   = 'output-text error';
  } else if (result === 'SyntaxError') {
    outputEl.textContent = '>>> SyntaxError: invalid expression';
    outputEl.className   = 'output-text error';
  } else {
    outputEl.textContent = `>>> Result: ${result}`;
    outputEl.className   = 'output-text result-shown';
    codeRes.textContent  = `f"Result: {${result}}"`;
  }
}

function clearActiveOp() {
  document.querySelectorAll('.btn-op').forEach(b => b.classList.remove('active-op'));
  activeOp = null;
}

document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const val    = btn.dataset.val;

    switch (action) {
      case 'num':
        if (justEvaled) { calcExpr = ''; justEvaled = false; clearActiveOp(); }
        calcExpr += val;
        updateDisplay();
        break;

      case 'op':
        justEvaled = false;
        // Avoid double operators
        if (['+', '-', '*', '/'].includes(calcExpr.slice(-1))) {
          calcExpr = calcExpr.slice(0, -1);
        }
        if (calcExpr !== '') {
          calcExpr += val;
          updateDisplay();
          // Highlight active op
          clearActiveOp();
          btn.classList.add('active-op');
          activeOp = btn;
        }
        break;

      case 'decimal':
        if (justEvaled) { calcExpr = '0'; justEvaled = false; }
        // Only add decimal if last number doesn't have one
        const parts = calcExpr.split(/[\+\-\*\/]/);
        if (!parts[parts.length - 1].includes('.')) {
          if (calcExpr === '') calcExpr = '0';
          calcExpr += '.';
          updateDisplay();
        }
        break;

      case 'clear':
        calcExpr   = '';
        calcResult = '';
        justEvaled = false;
        clearActiveOp();
        exprEl.textContent  = '0';
        resultEl.textContent = '';
        outputEl.textContent = 'Ready to calculate...';
        outputEl.className   = 'output-text';
        codeExpr.textContent = '""';
        codeRes.textContent  = 'f"Result: {result}"';
        break;

      case 'sign':
        if (calcExpr === '') break;
        if (calcExpr.startsWith('-')) {
          calcExpr = calcExpr.slice(1);
        } else {
          calcExpr = '-' + calcExpr;
        }
        updateDisplay();
        break;

      case 'percent':
        if (calcExpr === '') break;
        try {
          const n = parseFloat(safeEval(calcExpr));
          calcExpr = (n / 100).toString();
          updateDisplay();
        } catch(e) {}
        break;

      case 'equals':
        if (calcExpr === '') break;
        const res = safeEval(calcExpr);
        renderOutput(res);
        if (!res.includes('Error')) {
          calcExpr   = res;
          calcResult = res;
          exprEl.textContent   = res;
          resultEl.textContent = '';
          justEvaled = true;
        }
        clearActiveOp();
        // Animate equals button
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 120);
        break;
    }
  });
});

// ── KEYBOARD SUPPORT FOR CALCULATOR ──
document.addEventListener('keydown', (e) => {
  const k = e.key;
  if ('0123456789'.includes(k)) {
    document.querySelector(`[data-val="${k}"]`)?.click();
  } else if (['+', '-', '*', '/'].includes(k)) {
    document.querySelector(`[data-val="${k}"]`)?.click();
  } else if (k === 'Enter' || k === '=') {
    document.querySelector('[data-action="equals"]')?.click();
  } else if (k === 'Backspace') {
    if (calcExpr.length > 0) {
      calcExpr = calcExpr.slice(0, -1);
      justEvaled = false;
      updateDisplay();
    }
  } else if (k === 'Escape') {
    document.querySelector('[data-action="clear"]')?.click();
  } else if (k === '.') {
    document.querySelector('[data-action="decimal"]')?.click();
  }
});