/* ==========================================================================
   XE PRODUCTIONS — Dynamic Video Discovery, Serene Theater & Studio Desk Booking
   ========================================================================== */

(() => {
  'use strict';

  const CATEGORY_LABELS = {
    'brand-films': 'BRAND FILMS',
    'broadcast-podcast': 'BROADCAST & PODCAST',
    'expert-clinical': 'EXPERT & CLINICAL',
    'ugc-app': 'UGC & APP DEMOS',
    'product-scenes': 'PRODUCT SCENES',
  };

  /**
   * Editorial enrichment dictionary keyed by filename.
   * Any newly added .mp4 in ./Videos/ not listed here is automatically parsed,
   * categorized, titled, and surfaced without changing a line of code.
   */
  const CURATED_COPY = {
    '01-brand-film-runway.mp4': {
      category: 'brand-films',
      title: 'High-Concept 70s Runway Film',
      angle: 'Commands flagship prestige and category authority without a six-figure location shoot.',
      featured: true,
    },
    '02-product-cryo-lab-a.mp4': {
      category: 'product-scenes',
      title: 'Cryo-Lab Product Reveal — Study A',
      angle: 'Elevates physical hardware or CPG into impossible, thumb-stopping visual worlds.',
    },
    '03-product-cryo-lab-b.mp4': {
      category: 'product-scenes',
      title: 'Cryo-Lab Product Reveal — Study B',
      angle: 'Built for kinetic launch teasers that make your product look ten years ahead of the market.',
    },
    '04-podcast-host-a.mp4': {
      category: 'broadcast-podcast',
      title: 'Studio Podcast Authority — Cut A',
      angle: 'Turns founder expertise into daily broadcast authority without stepping in front of a lens.',
    },
    '05-podcast-host-b.mp4': {
      category: 'broadcast-podcast',
      title: 'Studio Podcast Authority — Cut B',
      angle: 'Frames sharp contrarian insights in warm studio lighting that stops scrolling feeds.',
    },
    '06-podcast-host-c.mp4': {
      category: 'broadcast-podcast',
      title: 'Studio Podcast Authority — Cut C',
      angle: 'Engineered for rapid paid-social hook testing with conversational podcast credibility.',
    },
    '07-podcast-host-d.mp4': {
      category: 'broadcast-podcast',
      title: 'Studio Podcast Authority — Cut D',
      angle: 'Builds omnipresent executive trust across Reels, Shorts, and LinkedIn at software speed.',
    },
    '08-podcast-host-e.mp4': {
      category: 'broadcast-podcast',
      title: 'Studio Podcast Authority — Cut E',
      angle: 'Delivers multi-angle interview cutaways that turn warm audiences into booked calls.',
    },
    '10-ugc-hook-night.mp4': {
      category: 'ugc-app',
      title: 'Late-Night Creator Pattern Interrupt',
      angle: 'Blends natively into organic TikTok and Reels feeds to win cheap cold-traffic attention.',
    },
    '11-ugc-app-demo.mp4': {
      category: 'ugc-app',
      title: 'Mobile App Walkthrough Spot',
      angle: 'Demonstrates core mobile UX in seconds so viewers grasp your value before swiping away.',
    },
    '12-ugc-saas-dropshipping.mp4': {
      category: 'ugc-app',
      title: 'SaaS Desk Creator Story',
      angle: 'Converts skeptical B2B and e-commerce buyers with relatable desk-side proof and pacing.',
    },
    '13-authority-nurse-glp1.mp4': {
      category: 'expert-clinical',
      title: 'Hospital Floor Clinical PSA',
      angle: 'Earns immediate medical and wellness credibility through calm, clinical storytelling.',
    },
    '14-ugc-pharmacist-product.mp4': {
      category: 'expert-clinical',
      title: 'Pharmacist Counter Social Proof',
      angle: 'Overcomes buyer skepticism for supplements and skincare with trusted expert validation.',
    },
    '15-broadcast-news-interview.mp4': {
      category: 'broadcast-podcast',
      title: 'Broadcast News Desk Interview',
      angle: 'Wraps product announcements and category disruption in prime-time newsroom authority.',
    },
  };

  function inferCategoryFromName(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('brand') || lower.includes('film') || lower.includes('runway') || lower.includes('cinema')) {
      return 'brand-films';
    }
    if (lower.includes('podcast') || lower.includes('broadcast') || lower.includes('news') || lower.includes('interview')) {
      return 'broadcast-podcast';
    }
    if (lower.includes('nurse') || lower.includes('pharmacist') || lower.includes('doctor') || lower.includes('clinical') || lower.includes('authority')) {
      return 'expert-clinical';
    }
    if (lower.includes('product') || lower.includes('cryo') || lower.includes('lab') || lower.includes('scene') || lower.includes('3d')) {
      return 'product-scenes';
    }
    return 'ugc-app';
  }

  function inferTitleFromName(filename) {
    return filename
      .replace(/\.mp4$/i, '')
      .replace(/^\d+[-_\s]*/, '')
      .split(/[-_]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  function defaultAngleForCategory(category) {
    const map = {
      'brand-films': 'Built for category-defining launches that command prestige on frame one.',
      'broadcast-podcast': 'Turns founder perspective into broadcast-grade authority at scale.',
      'expert-clinical': 'Converts high-consideration audiences with calm, credible expert delivery.',
      'ugc-app': 'Engineered for native paid-social retention and direct-response clicks.',
      'product-scenes': 'Places your product inside unforgettable visual environments.',
    };
    return map[category] || 'Engineered to capture high-intent attention and drive action.';
  }

  function buildCatalogItem(entry) {
    const filename = typeof entry === 'string' ? entry : entry.filename;
    const src = typeof entry === 'string' ? `./Videos/${encodeURIComponent(filename)}` : entry.src;
    const curated = CURATED_COPY[filename];
    const category = curated ? curated.category : inferCategoryFromName(filename);

    return {
      id: filename.replace(/\.mp4$/i, ''),
      filename,
      src,
      category,
      categoryLabel: CATEGORY_LABELS[category] || 'FEATURED WORK',
      title: curated ? curated.title : inferTitleFromName(filename),
      angle: curated ? curated.angle : defaultAngleForCategory(category),
      featured: Boolean(curated && curated.featured),
      durationText: null,
    };
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '--:--';
    const total = Math.round(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Dynamically discover every .mp4 in ./Videos/ via /api/videos,
   * falling back cleanly to ./videos-manifest.json on static hosts.
   */
  async function discoverVideos() {
    const endpoints = ['/api/videos', './videos-manifest.json'];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.videos;
        if (Array.isArray(list) && list.length > 0) {
          return list
            .filter((item) => {
              const name = typeof item === 'string' ? item : item && item.filename;
              return typeof name === 'string' && name.toLowerCase().endsWith('.mp4');
            })
            .map(buildCatalogItem);
        }
      } catch (_) {
        // Try next discovery source
      }
    }
    return Object.keys(CURATED_COPY).map(buildCatalogItem);
  }

  // State
  const state = {
    videos: [],
    activeFilter: 'all',
    selectedIds: new Set(),
    theaterId: null,
    selectedDateIso: null,
    selectedTime: '11:30',
    dates: [],
    deskOpen: false,
  };

  // DOM References
  const headerCta = document.getElementById('headerCta');
  const heroBookCta = document.getElementById('heroBookCta');
  const heroVideo = document.getElementById('heroVideo');
  const heroVideoTrigger = document.getElementById('heroVideoTrigger');
  const heroSoundBtn = document.getElementById('heroSoundBtn');
  const heroTheaterBtn = document.getElementById('heroTheaterBtn');
  const heroCaptionCategory = document.getElementById('heroCaptionCategory');
  const heroCaptionTitle = document.getElementById('heroCaptionTitle');
  const heroDuration = document.getElementById('heroDuration');

  const filterBar = document.getElementById('filterBar');
  const reelGrid = document.getElementById('reelGrid');
  const reelCountStatus = document.getElementById('reelCountStatus');
  const jumpToDeskBtn = document.getElementById('jumpToDeskBtn');
  const carriedCount = document.getElementById('carriedCount');
  const headerSelectionCount = document.getElementById('headerSelectionCount');

  // Studio Desk / Booking Elements
  const deskToggleBtn = document.getElementById('deskToggleBtn');
  const deskToggleLabel = document.getElementById('deskToggleLabel');
  const deskToggleArrow = document.getElementById('deskToggleArrow');
  const deskGateStatus = document.getElementById('deskGateStatus');
  const studioDeskDrawer = document.getElementById('studioDeskDrawer');
  const selectedRefs = document.getElementById('selectedRefs');
  const togglePickerBtn = document.getElementById('togglePickerBtn');
  const refDrawer = document.getElementById('refDrawer');
  const vibeGrid = document.getElementById('vibeGrid');
  const bookingForm = document.getElementById('bookingForm');
  const visionInput = document.getElementById('visionInput');
  const outcomeInput = document.getElementById('outcomeInput');
  const clientNameInput = document.getElementById('clientNameInput');
  const clientContactInput = document.getElementById('clientContactInput');
  const dateStrip = document.getElementById('dateStrip');
  const timeGrid = document.getElementById('timeGrid');
  const timezoneLabel = document.getElementById('timezoneLabel');
  const liveDirection = document.getElementById('liveDirection');
  const liveRefs = document.getElementById('liveRefs');
  const liveSlot = document.getElementById('liveSlot');
  const bookingError = document.getElementById('bookingError');
  const bookingConfirmed = document.getElementById('bookingConfirmed');
  const confirmedMeta = document.getElementById('confirmedMeta');
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');
  const sendEmailLink = document.getElementById('sendEmailLink');
  const sendWhatsappLink = document.getElementById('sendWhatsappLink');
  const copySummaryBtn = document.getElementById('copySummaryBtn');

  // Theater Elements
  const theaterModal = document.getElementById('theaterModal');
  const theaterBackdrop = document.getElementById('theaterBackdrop');
  const theaterVideo = document.getElementById('theaterVideo');
  const theaterCategory = document.getElementById('theaterCategory');
  const theaterRuntime = document.getElementById('theaterRuntime');
  const theaterTitle = document.getElementById('theaterTitle');
  const theaterAngle = document.getElementById('theaterAngle');
  const theaterPrevBtn = document.getElementById('theaterPrevBtn');
  const theaterNextBtn = document.getElementById('theaterNextBtn');
  const theaterCloseBtn = document.getElementById('theaterCloseBtn');
  const theaterUseBtn = document.getElementById('theaterUseBtn');
  const theaterToggleRefBtn = document.getElementById('theaterToggleRefBtn');

  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  function getVideoById(id) {
    return state.videos.find((v) => v.id === id);
  }

  function getVisibleVideos() {
    if (state.activeFilter === 'all') return state.videos;
    return state.videos.filter((v) => v.category === state.activeFilter);
  }

  /* ------------------------------------------------------------------------
     HERO FEATURED FILM SETUP
     ------------------------------------------------------------------------ */
  function setupHeroVideo() {
    const featured = state.videos.find((v) => v.featured) || state.videos[0];
    if (!featured) return;

    heroVideo.src = featured.src;
    heroCaptionCategory.textContent = featured.categoryLabel;
    heroCaptionTitle.textContent = featured.title;
    heroVideoTrigger.dataset.videoId = featured.id;

    heroVideo.addEventListener('loadedmetadata', () => {
      featured.durationText = formatDuration(heroVideo.duration);
      heroDuration.textContent = featured.durationText;
    });

    heroVideo.play().catch(() => { });

    heroSoundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      heroVideo.muted = !heroVideo.muted;
      heroSoundBtn.textContent = heroVideo.muted ? 'SOUND OFF' : 'SOUND ON';
      if (heroVideo.paused) heroVideo.play().catch(() => { });
    });

    heroTheaterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openTheater(featured.id);
    });

    heroVideoTrigger.addEventListener('click', () => openTheater(featured.id));
    heroVideoTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openTheater(featured.id);
      }
    });
  }

  /* ------------------------------------------------------------------------
     SCROLL-TRIGGERED PROGRESSIVE REVEAL (INTERSECTION OBSERVER)
     ------------------------------------------------------------------------ */
  let revealObserver = null;

  function setupScrollReveal() {
    document.documentElement.classList.add('js-reveal-ready');

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
    );

    observeRevealTargets(document);
  }

  function observeRevealTargets(scope) {
    const targets = scope.querySelectorAll('.reveal:not(.is-visible)');
    if (!revealObserver) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    targets.forEach((el) => revealObserver.observe(el));
  }

  /* ------------------------------------------------------------------------
     COLLAPSIBLE STUDIO DESK DRAWER
     ------------------------------------------------------------------------ */
  function setDeskOpen(shouldOpen) {
    state.deskOpen = Boolean(shouldOpen);
    studioDeskDrawer.classList.toggle('is-open', state.deskOpen);
    studioDeskDrawer.setAttribute('aria-hidden', String(!state.deskOpen));
    deskToggleBtn.setAttribute('aria-expanded', String(state.deskOpen));
    deskToggleLabel.textContent = state.deskOpen ? 'HIDE BRIEF BUILDER' : 'SHARE WHAT YOU WANT TO SEE';
    deskToggleArrow.textContent = state.deskOpen ? '↑' : '↓';
  }

  /* ------------------------------------------------------------------------
     SERENE FLOATING REEL GRID
     ------------------------------------------------------------------------ */
  function renderReelGrid() {
    const items = getVisibleVideos();
    const activeLabel = state.activeFilter === 'all' ? 'CURATED REEL' : CATEGORY_LABELS[state.activeFilter];
    reelCountStatus.textContent = `${items.length} ${items.length === 1 ? 'FILM' : 'FILMS'} IN ${activeLabel}`;

    reelGrid.innerHTML = items
      .map((item, idx) => {
        const selected = state.selectedIds.has(item.id);
        const delayMs = (idx % 3) * 70;
        return `
          <article class="reel-card reveal" style="--reveal-delay: ${delayMs}ms" data-id="${item.id}">
            <div class="reel-media" role="button" tabindex="0" data-watch-id="${item.id}" aria-label="Watch ${item.title} with sound">
              <video
                src="${item.src}"
                muted
                loop
                playsinline
                preload="metadata"
              ></video>
              <span class="reel-duration" data-duration-for="${item.id}">${item.durationText || '--:--'}</span>
              <button type="button" class="reel-sound-trigger" data-watch-id="${item.id}">
                WATCH WITH SOUND
              </button>
            </div>

            <div class="reel-body">
              <span class="reel-category">${item.categoryLabel}</span>
              <h3 class="reel-title">${item.title}</h3>
              <p class="reel-angle">${item.angle}</p>
              <button type="button" class="reel-direction-btn ${selected ? 'is-selected' : ''}" data-use-id="${item.id}">
                ${selected ? 'SELECTED DIRECTION ✓' : 'USE THIS DIRECTION →'}
              </button>
            </div>
          </article>
        `;
      })
      .join('');

    wireGridVideos();
    observeRevealTargets(reelGrid);
  }

  function wireGridVideos() {
    reelGrid.querySelectorAll('.reel-card').forEach((card) => {
      const id = card.dataset.id;
      const item = getVideoById(id);
      const media = card.querySelector('.reel-media');
      const video = card.querySelector('video');
      const durBadge = card.querySelector('.reel-duration');

      if (!video) return;

      video.addEventListener('loadedmetadata', () => {
        const formatted = formatDuration(video.duration);
        if (item) item.durationText = formatted;
        if (durBadge) durBadge.textContent = formatted;
        // Paint a crisp non-black first preview frame once metadata is ready
        if (video.paused && Number.isFinite(video.duration) && video.duration > 0.25) {
          try {
            video.currentTime = Math.min(0.2, video.duration * 0.1);
          } catch (_) { }
        }
      });

      const startHoverPreview = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise
            .then(() => card.classList.add('is-previewing'))
            .catch(() => { });
        }
      };

      const stopHoverPreview = () => {
        video.pause();
        card.classList.remove('is-previewing');
      };

      media.addEventListener('mouseenter', startHoverPreview);
      media.addEventListener('mouseleave', stopHoverPreview);
      media.addEventListener('focus', startHoverPreview);
      media.addEventListener('blur', stopHoverPreview);

      media.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTheater(id);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     THEATER MODAL (FULL AUDIO + SCRUBBING)
     ------------------------------------------------------------------------ */
  function openTheater(videoId) {
    const item = getVideoById(videoId);
    if (!item) return;

    state.theaterId = item.id;

    if (heroVideo && !heroVideo.paused) {
      heroVideo.pause();
    }

    theaterCategory.textContent = item.categoryLabel;
    theaterTitle.textContent = item.title;
    theaterAngle.textContent = item.angle;
    theaterRuntime.textContent = `DURATION: ${item.durationText || '--:--'}`;

    const locked = state.selectedIds.has(item.id);
    theaterToggleRefBtn.textContent = locked ? 'REMOVE FROM STUDIO DESK −' : 'ADD TO STUDIO DESK +';

    theaterVideo.pause();
    theaterVideo.src = item.src;
    theaterVideo.muted = false;
    theaterVideo.currentTime = 0;

    theaterModal.hidden = false;
    document.body.style.overflow = 'hidden';

    theaterVideo.play().catch(() => { });
    theaterCloseBtn.focus();
  }

  function stepTheater(delta) {
    if (!state.theaterId || state.videos.length === 0) return;
    const pool = getVisibleVideos().length > 0 ? getVisibleVideos() : state.videos;
    const idx = pool.findIndex((v) => v.id === state.theaterId);
    const nextIdx = (idx === -1 ? 0 : idx + delta + pool.length) % pool.length;
    openTheater(pool[nextIdx].id);
  }

  function closeTheater() {
    theaterVideo.pause();
    theaterVideo.removeAttribute('src');
    theaterVideo.load();
    theaterModal.hidden = true;
    document.body.style.overflow = '';
    state.theaterId = null;

    if (heroVideo) {
      heroVideo.muted = true;
      heroSoundBtn.textContent = 'SOUND OFF';
      heroVideo.play().catch(() => { });
    }
  }

  theaterVideo.addEventListener('loadedmetadata', () => {
    const formatted = formatDuration(theaterVideo.duration);
    theaterRuntime.textContent = `DURATION: ${formatted}`;
    const current = getVideoById(state.theaterId);
    if (current) current.durationText = formatted;
  });

  /* ------------------------------------------------------------------------
     STUDIO DESK REFERENCES & BOOKING ENGINE
     ------------------------------------------------------------------------ */
  function renderReferenceDrawer() {
    refDrawer.innerHTML = state.videos
      .map((item) => {
        const selected = state.selectedIds.has(item.id);
        return `
          <button type="button" class="drawer-pick ${selected ? 'is-selected' : ''}" data-drawer-id="${item.id}">
            ${selected ? '✓ ' : '+ '}${item.title}
          </button>
        `;
      })
      .join('');
  }

  function getSelectedVibe() {
    const checked = vibeGrid.querySelector('input[name="vibe"]:checked');
    return checked ? checked.value : 'High-Concept Brand Film';
  }

  function syncSelections() {
    const count = state.selectedIds.size;

    headerSelectionCount.textContent = String(count);
    headerSelectionCount.hidden = count === 0;

    carriedCount.textContent = String(count);
    jumpToDeskBtn.hidden = count === 0;

    // Update floating cards
    reelGrid.querySelectorAll('.reel-direction-btn').forEach((btn) => {
      const selected = state.selectedIds.has(btn.dataset.useId);
      btn.classList.toggle('is-selected', selected);
      btn.textContent = selected ? 'SELECTED DIRECTION ✓' : 'USE THIS DIRECTION →';
    });

    // Update drawer picks
    refDrawer.querySelectorAll('.drawer-pick').forEach((btn) => {
      const item = getVideoById(btn.dataset.drawerId);
      const selected = state.selectedIds.has(btn.dataset.drawerId);
      btn.classList.toggle('is-selected', selected);
      if (item) btn.textContent = `${selected ? '✓ ' : '+ '}${item.title}`;
    });

    // Update carried reference pills in Studio Desk & Gate status
    const selectedItems = Array.from(state.selectedIds).map(getVideoById).filter(Boolean);
    if (selectedItems.length === 0) {
      selectedRefs.innerHTML = `<p class="refs-empty">No specific clip selected yet — choose a creative vibe below or click “Use This Direction” on any video above.</p>`;
      liveRefs.textContent = 'Using selected creative vibe';
      deskGateStatus.textContent = '20-minute strategy & production alignment • 72-hour ad-ready masters';
    } else {
      selectedRefs.innerHTML = selectedItems
        .map(
          (item) => `
            <span class="ref-chip">
              <span>${item.title}</span>
              <button type="button" data-remove-ref="${item.id}" aria-label="Remove ${item.title}">×</button>
            </span>
          `
        )
        .join('');
      const summaryLabel =
        selectedItems.length === 1
          ? selectedItems[0].title
          : `${selectedItems[0].title} + ${selectedItems.length - 1} more`;
      liveRefs.textContent = summaryLabel;
      deskGateStatus.textContent = `Pre-loaded with ${selectedItems.length} reference ${selectedItems.length === 1 ? 'direction' : 'directions'}: ${summaryLabel}`;
    }

    // Update theater toggle button if open
    if (state.theaterId) {
      const locked = state.selectedIds.has(state.theaterId);
      theaterToggleRefBtn.textContent = locked ? 'REMOVE FROM STUDIO DESK −' : 'ADD TO STUDIO DESK +';
    }

    updateCallSummary();
  }

  function carryDirectionToDesk(id) {
    const item = getVideoById(id);
    if (!item) return;

    state.selectedIds.add(id);
    bookingConfirmed.hidden = true;
    syncSelections();
    setDeskOpen(true);
    showToast(`CARRIED "${item.title.toUpperCase()}" TO STUDIO DESK`);

    document.getElementById('book').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      if (!visionInput.value.trim()) visionInput.focus({ preventScroll: true });
    }, 520);
  }

  function generateBusinessDays(count = 5) {
    const days = [];
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);

    while (days.length < count) {
      cursor.setDate(cursor.getDate() + 1);
      const dow = cursor.getDay();
      if (dow === 0 || dow === 6) continue;
      const d = new Date(cursor);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        iso,
        dateObj: d,
        dow: d.toLocaleDateString(undefined, { weekday: 'short' }),
        day: d.getDate(),
        month: d.toLocaleDateString(undefined, { month: 'short' }),
        fullLabel: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }

  function setupBookingCalendar() {
    state.dates = generateBusinessDays(5);
    state.selectedDateIso = state.dates[0].iso;

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) timezoneLabel.textContent = tz.replace(/_/g, ' ').toUpperCase();
    } catch (_) {
      timezoneLabel.textContent = 'LOCAL TIME';
    }

    dateStrip.innerHTML = state.dates
      .map(
        (d, idx) => `
          <button
            type="button"
            class="date-btn ${idx === 0 ? 'is-selected' : ''}"
            data-date="${d.iso}"
            aria-pressed="${idx === 0}"
          >
            <span class="date-dow">${d.dow}</span>
            <span class="date-day">${d.day}</span>
            <span class="date-mon">${d.month}</span>
          </button>
        `
      )
      .join('');

    updateCallSummary();
  }

  function getFormattedTime(hhmm) {
    const [hStr, mStr] = hhmm.split(':');
    const h = Number(hStr);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${mStr} ${suffix}`;
  }

  function updateCallSummary() {
    liveDirection.textContent = getSelectedVibe();
    const activeDate = state.dates.find((d) => d.iso === state.selectedDateIso) || state.dates[0];
    if (activeDate) {
      liveSlot.textContent = `${activeDate.fullLabel} • ${getFormattedTime(state.selectedTime)}`;
    }
  }

  function buildBookingSummaryText() {
    const selectedItems = Array.from(state.selectedIds).map(getVideoById).filter(Boolean);
    const activeDate = state.dates.find((d) => d.iso === state.selectedDateIso) || state.dates[0];
    const slotText = activeDate ? `${activeDate.fullLabel} at ${getFormattedTime(state.selectedTime)} (${timezoneLabel.textContent})` : state.selectedTime;

    return [
      'XE PRODUCTIONS — STRATEGY & PRODUCTION CALL BRIEF',
      '--------------------------------------------------',
      `CLIENT & BRAND: ${clientNameInput.value.trim()}`,
      `CONTACT: ${clientContactInput.value.trim()}`,
      `REQUESTED CALL SLOT: ${slotText}`,
      `PRIMARY DIRECTION: ${getSelectedVibe()}`,
      `REFERENCE VIDEOS: ${selectedItems.length ? selectedItems.map((v) => v.title).join(', ') : 'None specified'}`,
      '',
      'WHAT WE WANT TO CREATE / AUDIENCE FEELING:',
      visionInput.value.trim(),
      '',
      'TARGET CUSTOMER & DESIRED OUTCOME:',
      outcomeInput.value.trim(),
    ].join('\n');
  }

  function downloadCalendarInvite() {
    const activeDate = state.dates.find((d) => d.iso === state.selectedDateIso) || state.dates[0];
    if (!activeDate) return;

    const [hh, mm] = state.selectedTime.split(':').map(Number);
    const start = new Date(activeDate.dateObj);
    start.setHours(hh, mm, 0, 0);
    const end = new Date(start.getTime() + 20 * 60 * 1000);

    const fmtIcs = (d) =>
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}T${String(d.getUTCHours()).padStart(2, '0')}${String(d.getUTCMinutes()).padStart(2, '0')}00Z`;

    const desc = buildBookingSummaryText().replace(/\n/g, '\\n');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//XE PRODUCTIONS//Studio Desk//EN',
      'BEGIN:VEVENT',
      `UID:xe-call-${Date.now()}@xeproductions.co`,
      `DTSTAMP:${fmtIcs(new Date())}`,
      `DTSTART:${fmtIcs(start)}`,
      `DTEND:${fmtIcs(end)}`,
      `SUMMARY:XE PRODUCTIONS — Strategy & Production Call (${clientNameInput.value.trim()})`,
      `DESCRIPTION:${desc}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `XE-Productions-Call-${activeDate.iso}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('CALENDAR INVITE (.ICS) DOWNLOADED');
  }

  /* ------------------------------------------------------------------------
     EVENT WIRING
     ------------------------------------------------------------------------ */
  filterBar.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    state.activeFilter = tab.dataset.filter;
    filterBar.querySelectorAll('.filter-tab').forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    renderReelGrid();
  });

  reelGrid.addEventListener('click', (e) => {
    const watchTarget = e.target.closest('[data-watch-id]');
    if (watchTarget) {
      openTheater(watchTarget.dataset.watchId);
      return;
    }

    const useTarget = e.target.closest('[data-use-id]');
    if (useTarget) {
      carryDirectionToDesk(useTarget.dataset.useId);
    }
  });

  deskToggleBtn.addEventListener('click', () => {
    setDeskOpen(!state.deskOpen);
    if (state.deskOpen) {
      setTimeout(() => {
        if (!visionInput.value.trim()) visionInput.focus({ preventScroll: true });
      }, 420);
    }
  });

  [headerCta, heroBookCta].forEach((el) => {
    if (!el) return;
    el.addEventListener('click', () => {
      setDeskOpen(true);
    });
  });

  jumpToDeskBtn.addEventListener('click', () => {
    setDeskOpen(true);
    document.getElementById('book').scrollIntoView({ behavior: 'smooth' });
  });

  togglePickerBtn.addEventListener('click', () => {
    const willOpen = refDrawer.hidden;
    refDrawer.hidden = !willOpen;
    togglePickerBtn.textContent = willOpen ? '− HIDE REEL REFERENCES' : '+ BROWSE REEL REFERENCES';
  });

  refDrawer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-drawer-id]');
    if (!btn) return;
    const id = btn.dataset.drawerId;
    if (state.selectedIds.has(id)) state.selectedIds.delete(id);
    else state.selectedIds.add(id);
    bookingConfirmed.hidden = true;
    syncSelections();
  });

  selectedRefs.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-ref]');
    if (!btn) return;
    state.selectedIds.delete(btn.dataset.removeRef);
    bookingConfirmed.hidden = true;
    syncSelections();
  });

  vibeGrid.addEventListener('change', () => {
    vibeGrid.querySelectorAll('.vibe-option').forEach((label) => {
      const radio = label.querySelector('input');
      label.classList.toggle('is-active', Boolean(radio && radio.checked));
    });
    bookingConfirmed.hidden = true;
    updateCallSummary();
  });

  dateStrip.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-date]');
    if (!btn) return;
    state.selectedDateIso = btn.dataset.date;
    dateStrip.querySelectorAll('.date-btn').forEach((b) => {
      const selected = b === btn;
      b.classList.toggle('is-selected', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    bookingConfirmed.hidden = true;
    updateCallSummary();
  });

  timeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-time]');
    if (!btn) return;
    state.selectedTime = btn.dataset.time;
    timeGrid.querySelectorAll('.slot-btn').forEach((b) => {
      b.classList.toggle('is-selected', b === btn);
    });
    bookingConfirmed.hidden = true;
    updateCallSummary();
  });

  [visionInput, outcomeInput, clientNameInput, clientContactInput].forEach((input) => {
    input.addEventListener('input', () => {
      bookingError.hidden = true;
    });
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    bookingError.hidden = true;

    const vision = visionInput.value.trim();
    const outcome = outcomeInput.value.trim();
    const name = clientNameInput.value.trim();
    const contact = clientContactInput.value.trim();

    if (!vision || !outcome || !name || !contact) {
      bookingError.textContent = 'Please share your creative vision, target outcome, name/brand, and email or WhatsApp to lock your call.';
      bookingError.hidden = false;
      if (!vision) visionInput.focus();
      else if (!outcome) outcomeInput.focus();
      else if (!name) clientNameInput.focus();
      else clientContactInput.focus();
      return;
    }

    const summary = buildBookingSummaryText();
    const subject = encodeURIComponent(`XE PRODUCTIONS Call Request — ${name} (${liveSlot.textContent})`);
    sendEmailLink.href = `mailto:hello@xeproductions.co?subject=${subject}&body=${encodeURIComponent(summary)}`;
    sendWhatsappLink.href = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    confirmedMeta.textContent = `${liveSlot.textContent} reserved for ${name}. Download your invite or dispatch directly below.`;
    bookingConfirmed.hidden = false;
    bookingConfirmed.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('PRODUCTION CALL RESERVED');
  });

  downloadIcsBtn.addEventListener('click', downloadCalendarInvite);

  copySummaryBtn.addEventListener('click', () => {
    const summary = buildBookingSummaryText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(summary)
        .then(() => showToast('BRIEF & SLOT COPIED TO CLIPBOARD'))
        .catch(() => showToast('USE EMAIL OR WHATSAPP BELOW'));
    } else {
      showToast('USE EMAIL OR WHATSAPP BELOW');
    }
  });

  // Theater Events
  theaterCloseBtn.addEventListener('click', closeTheater);
  theaterBackdrop.addEventListener('click', closeTheater);
  theaterPrevBtn.addEventListener('click', () => stepTheater(-1));
  theaterNextBtn.addEventListener('click', () => stepTheater(1));

  theaterUseBtn.addEventListener('click', () => {
    if (!state.theaterId) return;
    const id = state.theaterId;
    closeTheater();
    carryDirectionToDesk(id);
  });

  theaterToggleRefBtn.addEventListener('click', () => {
    if (!state.theaterId) return;
    const item = getVideoById(state.theaterId);
    if (!item) return;
    if (state.selectedIds.has(item.id)) {
      state.selectedIds.delete(item.id);
      showToast('REMOVED FROM STUDIO DESK');
    } else {
      state.selectedIds.add(item.id);
      showToast('ADDED TO STUDIO DESK');
    }
    syncSelections();
  });

  document.addEventListener('keydown', (e) => {
    if (theaterModal.hidden) return;
    if (e.key === 'Escape') closeTheater();
    else if (e.key === 'ArrowLeft') stepTheater(-1);
    else if (e.key === 'ArrowRight') stepTheater(1);
  });

  // FAQ Accordion (all collapsed by default, smooth CSS grid-row expansion one at a time)
  const faqList = document.getElementById('faqList');
  faqList.addEventListener('click', (e) => {
    const trigger = e.target.closest('.faq-trigger');
    if (!trigger) return;

    const item = trigger.closest('.faq-item');
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    const symbol = trigger.querySelector('.faq-symbol');
    const isOpen = item.classList.contains('is-open');

    faqList.querySelectorAll('.faq-item').forEach((other) => {
      const btn = other.querySelector('.faq-trigger');
      const otherPanel = document.getElementById(btn.getAttribute('aria-controls'));
      const otherSymbol = btn.querySelector('.faq-symbol');
      other.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      otherPanel.setAttribute('aria-hidden', 'true');
      otherSymbol.textContent = '+';
    });

    if (!isOpen) {
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      symbol.textContent = '−';
    }
  });

  // Dynamic Footer Year
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------------
     INITIALIZE DYNAMIC VIDEO DISCOVERY, REVEALS & UI
     ------------------------------------------------------------------------ */
  async function init() {
    setupScrollReveal();
    setupBookingCalendar();
    setDeskOpen(false);
    state.videos = await discoverVideos();
    setupHeroVideo();
    renderReferenceDrawer();
    renderReelGrid();
    syncSelections();
  }

  init();
})();
