/* ═══════════════════════════════════════════════════════════
   VERBE — script.js
   Handles: sticky header, mobile nav, scroll animations,
            demo chatbot, copy-to-clipboard, API key preview
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────
     1. STICKY HEADER
  ────────────────────────────────────────────── */
  const header = document.getElementById('site-header');

  const handleScroll = () => {
    if (window.scrollY > 12) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load


  /* ──────────────────────────────────────────────
     2. MOBILE NAV TOGGLE
  ────────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close mobile nav when a link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });


  /* ──────────────────────────────────────────────
     3. SCROLL ANIMATIONS (IntersectionObserver)
  ────────────────────────────────────────────── */
  const animatedEls = document.querySelectorAll(
    '.animate-fade-up, .animate-slide-up'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -32px 0px'
  });

  animatedEls.forEach(el => observer.observe(el));


  /* ──────────────────────────────────────────────
     4. COPY-TO-CLIPBOARD
  ────────────────────────────────────────────── */
  const copyBtn    = document.getElementById('copy-btn');
  const copyIcon   = document.getElementById('copy-icon');
  const checkIcon  = document.getElementById('check-icon');
  const copyLabel  = document.getElementById('copy-label');
  const codeEl     = document.getElementById('code-snippet');

  copyBtn.addEventListener('click', async () => {
    const text = codeEl.innerText || codeEl.textContent;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    // Visual feedback
    copyIcon.classList.add('hidden');
    checkIcon.classList.remove('hidden');
    copyLabel.textContent = 'Copied!';
    copyBtn.style.background = 'rgba(74,222,128,.15)';

    setTimeout(() => {
      copyIcon.classList.remove('hidden');
      checkIcon.classList.add('hidden');
      copyLabel.textContent = 'Copy';
      copyBtn.style.background = '';
    }, 2000);
  });


  /* ──────────────────────────────────────────────
     5. API KEY LIVE PREVIEW
  ────────────────────────────────────────────── */
  const apiKeyInput   = document.getElementById('api-key-input');
  const apiKeyDisplay = document.getElementById('api-key-display');

  apiKeyInput.addEventListener('input', () => {
    const val = apiKeyInput.value.trim();
    apiKeyDisplay.textContent = val || 'YOUR_API_KEY';
  });


  /* ──────────────────────────────────────────────
     6. DEMO CHATBOT (interactive placeholder)
  ────────────────────────────────────────────── */
  const demoInput    = document.getElementById('demo-input');
  const demoSend     = document.getElementById('demo-send');
  const demoMessages = document.getElementById('demo-messages');

  // Conversation script — bot responses keyed to step index
  const botFlow = [
    { trigger: null, response: null }, // step 0 = initial messages already in DOM
    { trigger: null, response: 'Great choice! Which area or neighbourhood are you looking at?' },
    { trigger: null, response: 'Noted! How many bedrooms are you looking for? (1BHK / 2BHK / 3BHK)' },
    { trigger: null, response: 'Perfect. Can I get your phone number to share matching properties?' },
    { trigger: null, response: '✅ Thanks! Our team will call you within 2 hours with the best options. You\'re all set!' },
  ];

  let flowStep = 1; // tracks where we are in the conversation

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `demo-msg ${type}`;
    msg.textContent = text;
    demoMessages.appendChild(msg);
    demoMessages.scrollTop = demoMessages.scrollHeight;
    return msg;
  }

  function showTypingThenReply(text, delay = 1000) {
    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'demo-msg typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    demoMessages.appendChild(typing);
    demoMessages.scrollTop = demoMessages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      addMessage(text, 'bot');
    }, delay);
  }

  function handleSend() {
    const text = demoInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    demoInput.value = '';
    demoInput.focus();

    if (flowStep < botFlow.length) {
      const next = botFlow[flowStep];
      if (next.response) {
        showTypingThenReply(next.response, 900 + Math.random() * 400);
      }
      flowStep++;
    } else {
      showTypingThenReply('Thanks for trying the demo! Sign up to activate your real chatbot → verbe.ai', 1000);
    }
  }

  demoSend.addEventListener('click', handleSend);
  demoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });


  /* ──────────────────────────────────────────────
     7. SMOOTH SCROLL (polyfill for Safari)
  ────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const headerH = header.getBoundingClientRect().height;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });

});
