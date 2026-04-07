/* ══════════════════════════════════════════════════════════
   PREMIER REALTY — Application JavaScript
   Helen Wong · Sacramento, CA
   ══════════════════════════════════════════════════════════ */

'use strict';

/* ── PIPELINE DEFINITIONS ─────────────────────────────────── */
const PIPELINES = {
  buy:      { label: '🏡 Buyer Lead Pipeline',              color: '#22c55e', emoji: '🏡', tag: 'Buyer' },
  sell:     { label: '📈 Seller Consultation Pipeline',     color: '#f59e0b', emoji: '📈', tag: 'Seller' },
  value:    { label: '🔍 Home Valuation Request Pipeline',  color: '#8b5cf6', emoji: '🔍', tag: 'Valuation' },
  relocate: { label: '🗺️  Relocation Pipeline',             color: '#06b6d4', emoji: '🗺️', tag: 'Relocation' },
  invest:   { label: '💼 Investor Lead Pipeline',           color: '#ef4444', emoji: '💼', tag: 'Investor' },
  consult:  { label: '💬 General Consultation Pipeline',    color: '#6366f1', emoji: '💬', tag: 'Consultation' },
};

const PIPELINE_MESSAGES = {
  buy:      'Your inquiry has been added to our Buyer Lead Pipeline. Helen's team will reach out within 24 hours to discuss your home search.',
  sell:     'Your inquiry has been added to our Seller Consultation Pipeline. Helen will schedule a market analysis and listing consultation shortly.',
  value:    'Your Home Valuation request has been received. Expect a detailed market report from Helen within 48 hours.',
  relocate: 'Welcome to Sacramento! Your Relocation inquiry is with Helen's team. We'll reach out to schedule a neighborhood tour.',
  invest:   'Your investor profile has been received. Helen's team will be in touch with curated opportunities matching your criteria.',
  consult:  'Your consultation request is confirmed. Helen's team will reach out to schedule a time that works for you.',
};

/* ── CORE SERVICE AREA ────────────────────────────────────── */
const SERVICE_AREA_KEYWORDS = [
  // Sacramento city neighborhoods
  'sacramento', 'sac city', 'downtown sacramento', 'midtown', 'mid-town',
  'uptown', 'oak park', 'tahoe park', 'east sacramento', 'east sac',
  'fab 40', 'fab40', 'land park', 'william land', 'south sacramento',
  'south sac', 'north sacramento', 'north sac', 'natomas', 'rio linda',
  'del paso', 'meadowview', 'valley hi', 'pocket', 'rosemont',
  'arden arcade', 'arden-arcade', 'fair oaks', 'citrus heights',
  'carmichael', 'rancho cordova', 'gold river', 'mather', 'vineyard',
  'elk grove', 'laguna', 'sheldon', 'florin', 'galt',
  'west sacramento', 'west sac',
  // Placer County
  'roseville', 'rocklin', 'lincoln', 'granite bay', 'loomis', 'penryn',
  // El Dorado County
  'el dorado hills', 'folsom', 'shingle springs',
  // Yolo County
  'davis', 'woodland', 'winters',
  // Yuba County
  'marysville', 'yuba city',
  // Zip codes (Sacramento area)
  '95814','95815','95816','95817','95818','95819','95820','95821',
  '95822','95823','95824','95825','95826','95827','95828','95829',
  '95830','95831','95832','95833','95834','95835','95836','95837',
  '95838','95841','95842','95843','95660','95670','95762','95758',
  '95757','95624','95628','95630','95678','95747','95765',
];

const NEIGHBORHOOD_TAGS = {
  natomas:      ['natomas','95834','95835','95833','north sacramento','north sac','rio linda','del paso'],
  midtown:      ['midtown','mid-town','uptown','95816','95811'],
  downtown:     ['downtown','95814'],
  east_sac:     ['east sacramento','east sac','fab 40','fab40','95819'],
  land_park:    ['land park','95818'],
  elk_grove:    ['elk grove','95758','95757','laguna','sheldon'],
  arden_arcade: ['arden arcade','arden-arcade','carmichael','95821','95825','fair oaks','citrus heights'],
  south_sac:    ['south sacramento','south sac','95820','95822','95823','florin','meadowview'],
  rancho:       ['rancho cordova','gold river','mather','95670','95762'],
  folsom:       ['folsom','95630'],
  roseville:    ['roseville','rocklin','95678','95747','95765'],
  el_dorado:    ['el dorado hills','95762'],
  davis:        ['davis','woodland','95616','95695'],
};

/* ── PAGE ROUTING ─────────────────────────────────────────── */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeNav();

  setTimeout(() => observeRevealElements(), 100);

  if (pageId === 'home') {
    countersStarted = false; // allow re-trigger on home revisit
    setTimeout(() => startCounters(), 600);
  }
}

/* Navigate to a section on the services page */
function gotoSection(sectionId) {
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72', 10);
      const top = el.getBoundingClientRect().top + window.pageYOffset - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, 180);
}

/* ── MOBILE MENU ──────────────────────────────────────────── */
function toggleNav() {
  const menu = document.getElementById('navMenu');
  const burger = document.getElementById('burger');
  if (!menu || !burger) return;

  const isOpen = menu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeNav() {
  const menu = document.getElementById('navMenu');
  const burger = document.getElementById('burger');
  if (menu) menu.classList.remove('open');
  if (burger) burger.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── NAVBAR SCROLL EFFECT ─────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── COUNTER ANIMATIONS ───────────────────────────────────── */
let countersStarted = false;

function startCounters() {
  if (countersStarted) return;

  const counters = document.querySelectorAll('.count[data-to]');
  if (counters.length === 0) return;

  countersStarted = true;

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.to, 10);
    if (isNaN(target)) return;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      counter.textContent = Math.floor(current);
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      }
    }, 16);
  });
}

/* ── SCROLL REVEAL ────────────────────────────────────────── */
function observeRevealElements() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  if (!window.IntersectionObserver) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
}

// Counter trigger on scroll
window.addEventListener('scroll', () => {
  const impactSec = document.getElementById('impactSec');
  if (impactSec) {
    const rect = impactSec.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) startCounters();
  }
}, { passive: true });

/* ── SERVICE AREA DETECTION ───────────────────────────────── */
function detectServiceArea(input) {
  if (!input || input.trim().length < 2) return { inArea: null, tag: null };

  const lower = input.toLowerCase().trim();

  const inArea = SERVICE_AREA_KEYWORDS.some(kw => lower.includes(kw));

  let tag = null;
  if (inArea) {
    for (const [neighborhood, keywords] of Object.entries(NEIGHBORHOOD_TAGS)) {
      if (keywords.some(kw => lower.includes(kw))) {
        tag = neighborhood.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        break;
      }
    }
    if (!tag) tag = 'Sacramento Area';
  }

  return { inArea, tag };
}

/* ── PIPELINE PILL (live update on service dropdown change) ── */
function updatePipeline() {
  const serviceType = document.getElementById('serviceType');
  const pill = document.getElementById('pipelinePill');
  if (!serviceType || !pill) return;

  const value = serviceType.value;
  if (value && PIPELINES[value]) {
    const p = PIPELINES[value];
    pill.textContent = '→  ' + p.label;
    pill.style.color = p.color;
    pill.style.borderColor = p.color + '40';
    pill.style.background = p.color + '12';
    pill.classList.add('show');
  } else {
    pill.classList.remove('show');
    pill.textContent = '';
  }
}

/* ── NEIGHBORHOOD INPUT LIVE CHECK ───────────────────────── */
let neighborhoodTimer = null;

function initNeighborhoodCheck() {
  const input = document.getElementById('neighborhood');
  if (!input) return;

  input.addEventListener('input', () => {
    clearTimeout(neighborhoodTimer);
    neighborhoodTimer = setTimeout(() => {
      const chip = document.getElementById('areaChip');
      if (!chip) return;

      const val = input.value.trim();
      if (val.length < 3) { chip.textContent = ''; chip.className = 'area-chip'; return; }

      const { inArea, tag: neighborhoodTag } = detectServiceArea(val);

      if (inArea === null) {
        chip.textContent = '';
        chip.className = 'area-chip';
      } else if (inArea) {
        chip.textContent = '✓ ' + (neighborhoodTag || 'Service Area');
        chip.className = 'area-chip in';
      } else {
        chip.textContent = '⚠ Outside primary service area';
        chip.className = 'area-chip out';
      }
    }, 450);
  });
}

/* ── FORM VALIDATION HELPERS ──────────────────────────────── */
function validateField(id, errorId, message) {
  const field = document.getElementById(id);
  const errorEl = document.getElementById(errorId);
  if (!field) return true;

  const value = field.value.trim();
  if (!value) {
    if (errorEl) errorEl.textContent = message || 'This field is required.';
    field.classList.add('error');
    return false;
  }
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validateEmail(id, errorId) {
  const field = document.getElementById(id);
  const errorEl = document.getElementById(errorId);
  if (!field) return true;

  const email = field.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    if (errorEl) errorEl.textContent = 'Email address is required.';
    field.classList.add('error');
    return false;
  }
  if (!regex.test(email)) {
    if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
    field.classList.add('error');
    return false;
  }
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

function validatePhone(id, errorId) {
  const field = document.getElementById(id);
  const errorEl = document.getElementById(errorId);
  if (!field) return true;

  const digits = field.value.replace(/\D/g, '');
  if (!field.value.trim()) {
    if (errorEl) errorEl.textContent = 'Phone number is required.';
    field.classList.add('error');
    return false;
  }
  if (digits.length < 10) {
    if (errorEl) errorEl.textContent = 'Please enter a valid 10-digit phone number.';
    field.classList.add('error');
    return false;
  }
  field.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
  return true;
}

/* ── MAIN HERO FORM SUBMIT ────────────────────────────────── */
let pendingSubmissionData = null;

function handleSubmit(e) {
  e.preventDefault();

  const v1 = validateField('fullName',    'err-fullName',    'Full name is required.');
  const v2 = validateEmail('email',       'err-email');
  const v3 = validatePhone('phone',       'err-phone');
  const v4 = validateField('neighborhood','err-neighborhood','Please enter a neighborhood or address.');
  const v5 = validateField('serviceType', 'err-serviceType', 'Please select a service type.');

  if (!v1 || !v2 || !v3 || !v4 || !v5) {
    // Scroll first error into view
    const firstErr = document.querySelector('.error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const data = {
    fullName:     document.getElementById('fullName').value.trim(),
    email:        document.getElementById('email').value.trim(),
    phone:        document.getElementById('phone').value.trim(),
    serviceType:  document.getElementById('serviceType').value,
    neighborhood: document.getElementById('neighborhood').value.trim(),
    priceRange:   document.getElementById('priceRange').value,
    timeline:     document.getElementById('timeline').value,
    timestamp:    new Date().toISOString(),
  };

  const { inArea } = detectServiceArea(data.neighborhood);

  if (inArea === false) {
    pendingSubmissionData = data;
    setFormState('ooa');
    return;
  }

  submitLead(data);
}

function submitAnyway() {
  if (pendingSubmissionData) {
    pendingSubmissionData.outOfArea = true;
    submitLead(pendingSubmissionData);
  }
}

function submitLead(data) {
  const btn = document.getElementById('submitBtn');
  const spin = document.getElementById('btnSpin');
  if (btn) { btn.disabled = true; btn.classList.add('loading'); }
  if (spin) spin.style.display = 'inline-block';

  // Simulate async API call
  setTimeout(() => {
    routeLeadToPipeline(data);
    showSuccessState(data);
    if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    if (spin) spin.style.display = 'none';
  }, 1400);
}

/* ── BACKEND PIPELINE ROUTING ─────────────────────────────── */
function routeLeadToPipeline(data) {
  const pipeline = PIPELINES[data.serviceType];
  if (!pipeline) return;

  const { inArea, tag: neighborhoodTag } = detectServiceArea(data.neighborhood);
  const areaStatus = data.outOfArea ? 'OUT_OF_AREA (manual)' : (inArea ? 'IN_AREA' : 'UNKNOWN');

  const payload = {
    ...data,
    pipeline:        pipeline.tag,
    pipelineLabel:   pipeline.label,
    neighborhoodTag: neighborhoodTag || 'Unknown',
    areaStatus,
    priority:        inArea === false ? 'LOW' : 'HIGH',
  };

  const routingMap = {
    buy:      'buyer-lead-pipeline',
    sell:     'seller-consultation-pipeline',
    value:    'home-valuation-pipeline',
    relocate: 'relocation-pipeline',
    invest:   'investor-lead-pipeline',
    consult:  'general-consultation-pipeline',
  };

  console.group('📬 Premier Realty Lead Submission');
  console.log('Pipeline:', routingMap[data.serviceType]);
  console.log('Area Status:', areaStatus, '· Tag:', neighborhoodTag);
  console.log('Payload:', payload);
  console.groupEnd();

  // ── CRM / Webhook integration points ─────────────────────
  // Replace the console.log above with your actual integration:
  //
  // fetch('/api/leads', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ pipeline: routingMap[data.serviceType], ...payload })
  // });
  //
  // Or use: sendToZapier(payload) / sendToHubSpot(payload) /
  //         sendToFollowUpBoss(payload) / sendToGoHighLevel(payload)
  // ─────────────────────────────────────────────────────────

  return payload;
}

/* ── SUCCESS STATE ────────────────────────────────────────── */
function showSuccessState(data) {
  const pipeline = PIPELINES[data.serviceType];
  const msg = PIPELINE_MESSAGES[data.serviceType] || 'Helen's team will be in touch shortly.';
  const { tag: neighborhoodTag } = detectServiceArea(data.neighborhood);

  const el_msg    = document.getElementById('succMsg');
  const el_detail = document.getElementById('succDetail');
  const el_pipe   = document.getElementById('succPipe');

  if (el_msg) el_msg.textContent = msg;

  if (el_detail) {
    el_detail.innerHTML = `
      <strong>Name:</strong> ${escapeHtml(data.fullName)}<br/>
      <strong>Email:</strong> ${escapeHtml(data.email)}<br/>
      <strong>Service:</strong> ${escapeHtml(pipeline ? pipeline.tag : data.serviceType)}<br/>
      ${neighborhoodTag ? `<strong>Area:</strong> ${escapeHtml(neighborhoodTag)}<br/>` : ''}
      ${data.priceRange ? `<strong>Budget:</strong> ${formatPriceRange(data.priceRange)}<br/>` : ''}
      ${data.timeline   ? `<strong>Timeline:</strong> ${formatTimeline(data.timeline)}` : ''}
    `.trim();
  }

  if (el_pipe && pipeline) {
    el_pipe.textContent = '→  ' + pipeline.label;
    el_pipe.style.color = pipeline.color;
  }

  setFormState('success');
}

/* ── FORM STATE MANAGER ───────────────────────────────────── */
// state: 'form' | 'success' | 'ooa'
function setFormState(state) {
  const form    = document.getElementById('captureForm');
  const success = document.getElementById('formSuccess');
  const ooa     = document.getElementById('formOOA');

  if (form)    { form.style.display    = (state === 'form') ? '' : 'none'; }
  if (success) { success.classList.toggle('show', state === 'success'); }
  if (ooa)     { ooa.classList.toggle('show', state === 'ooa'); }
}

function resetForm() {
  const form  = document.getElementById('captureForm');
  const pill  = document.getElementById('pipelinePill');
  const chip  = document.getElementById('areaChip');

  if (form) form.reset();

  setFormState('form');

  if (pill) { pill.classList.remove('show'); pill.textContent = ''; }
  if (chip) { chip.textContent = ''; chip.className = 'area-chip'; }

  // Clear inline validation
  document.querySelectorAll('.ferr').forEach(el => el.textContent = '');
  document.querySelectorAll('input.error, select.error, textarea.error').forEach(el => el.classList.remove('error'));

  pendingSubmissionData = null;
}

/* ── CONTACT PAGE FORM ────────────────────────────────────── */
function handleContact(e) {
  e.preventDefault();

  const name    = document.getElementById('cn');
  const email   = document.getElementById('ce');
  const message = document.getElementById('cm');

  let valid = true;

  if (!name?.value.trim())    { name.classList.add('error');    valid = false; }
  else                          name.classList.remove('error');

  if (!email?.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email?.classList.add('error'); valid = false;
  } else email?.classList.remove('error');

  if (!message?.value.trim()) { message.classList.add('error'); valid = false; }
  else                          message.classList.remove('error');

  if (!valid) return;

  const btn = e.target.querySelector('button[type="submit"]');
  const origText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  setTimeout(() => {
    const form  = document.getElementById('contactForm');
    const succ  = document.getElementById('contactSucc');
    if (form) form.style.display = 'none';
    if (succ) succ.classList.add('show');
    if (btn)  { btn.textContent = origText; btn.disabled = false; }
  }, 1200);
}

/* ── NEWSLETTER SUBSCRIBE ─────────────────────────────────── */
function subscribeNL() {
  const input = document.getElementById('nlEmail');
  const msg   = document.getElementById('nlMsg');
  if (!input || !msg) return;

  const email = input.value.trim();
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    msg.textContent = 'Please enter your email address.';
    msg.className   = 'nl-msg error';
    input.focus();
    return;
  }
  if (!regex.test(email)) {
    msg.textContent = 'Please enter a valid email address.';
    msg.className   = 'nl-msg error';
    input.focus();
    return;
  }

  // Success
  input.value     = '';
  msg.textContent = '✓ You're subscribed! Watch your inbox for Sacramento market updates.';
  msg.className   = 'nl-msg success';

  setTimeout(() => { msg.textContent = ''; msg.className = 'nl-msg'; }, 6000);

  // ── Integration point ─────────────────────────────────────
  // fetch('/api/newsletter', { method:'POST', body: JSON.stringify({ email }) })
  // ─────────────────────────────────────────────────────────
}

/* ── FAQ ACCORDION ────────────────────────────────────────── */
function toggleFAQ(btn) {
  const item   = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));

  // Toggle clicked
  if (!isOpen) item.classList.add('open');
}

/* ── PHONE INPUT AUTO-FORMAT ──────────────────────────────── */
function initPhoneFormat() {
  const phone = document.getElementById('phone');
  if (!phone) return;
  phone.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').substring(0, 10);
    if      (v.length >= 6) v = '(' + v.substring(0,3) + ') ' + v.substring(3,6) + '-' + v.substring(6);
    else if (v.length >= 4) v = '(' + v.substring(0,3) + ') ' + v.substring(3);
    else if (v.length >= 1) v = '(' + v;
    this.value = v;
  });
}

/* ── HELPERS ──────────────────────────────────────────────── */
function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

function formatPriceRange(val) {
  return {
    'under-400k': 'Under $400,000',
    '400k-600k':  '$400,000 – $600,000',
    '600k-800k':  '$600,000 – $800,000',
    '800k-1m':    '$800,000 – $1,000,000',
    '1m-1.5m':    '$1,000,000 – $1,500,000',
    '1.5m-plus':  '$1,500,000+',
  }[val] || val;
}

function formatTimeline(val) {
  return {
    'asap':    'As soon as possible',
    '1-3m':    '1–3 months',
    '3-6m':    '3–6 months',
    '6-12m':   '6–12 months',
    'explore': 'Just exploring',
  }[val] || val;
}

/* ── KEYBOARD ACCESSIBILITY ───────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

/* ── CLOSE NAV ON OUTSIDE CLICK ───────────────────────────── */
document.addEventListener('click', e => {
  const menu   = document.getElementById('navMenu');
  const burger = document.getElementById('burger');
  if (!menu || !menu.classList.contains('open')) return;
  if (!menu.contains(e.target) && !burger.contains(e.target)) closeNav();
});

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Initialise all modules
  observeRevealElements();
  initNeighborhoodCheck();
  initPhoneFormat();

  // Set initial form state
  setFormState('form');

  // Stagger reveal passes
  setTimeout(observeRevealElements, 250);
  setTimeout(observeRevealElements, 700);

  // Counter: attempt immediately (if already visible)
  setTimeout(startCounters, 800);
});

// Continuous reveal on scroll
window.addEventListener('scroll', observeRevealElements, { passive: true });

/* ── CTA HELPERS ──────────────────────────────────────────── */

/**
 * Pre-fill the hero form's service-type dropdown and smooth-scroll to it.
 * Usage: prefillAndScrollToForm('sell') / ('buy') / ('value') etc.
 */
function prefillAndScrollToForm(serviceType) {
  const sel = document.getElementById('serviceType');
  if (sel && serviceType) {
    sel.value = serviceType;
    // Trigger the pipeline pill update
    updatePipeline();
  }

  // Find the form card — works for both custom nav and Webflow page
  const formCard = document.getElementById('captureForm') || document.querySelector('.form-card');
  if (formCard) {
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72', 10);
    const top = formCard.getBoundingClientRect().top + window.pageYOffset - navH - 24;
    window.scrollTo({ top, behavior: 'smooth' });
  } else {
    // Fallback: scroll to top where hero form lives
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Smooth scroll to an element by ID, accounting for fixed nav height.
 */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '72', 10);
  const top = el.getBoundingClientRect().top + window.pageYOffset - navH - 16;
  window.scrollTo({ top, behavior: 'smooth' });
}

/**
 * Navigate to another HTML page, optionally with a hash.
 */
function goToPage(url) {
  window.location.href = url;
}

// Expose globally for inline onclick usage
window.prefillAndScrollToForm = prefillAndScrollToForm;
window.scrollToSection = scrollToSection;
window.goToPage = goToPage;
