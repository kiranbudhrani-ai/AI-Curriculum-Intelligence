const HUB_BUTTON_CSS = `.home-btn{display:inline-block;margin-bottom:18px;padding:9px 14px;border-radius:999px;background:#005035;color:#fff!important;text-decoration:none!important;font-family:Inter,Aptos,Arial,sans-serif;font-size:13px;font-weight:800;box-shadow:0 6px 14px rgba(15,23,42,.10)}.home-btn:hover{background:#00351f}.top-nav{padding-top:18px;padding-bottom:0}.growth-label{font-size:13px;text-transform:uppercase;letter-spacing:.08em;font-weight:850;color:var(--green-dark,#00351f)}.kpi.highlight .val{display:flex;align-items:baseline;gap:12px}`;
const HUB_BUTTON_HTML = `<a class="home-btn" href="../index.html">← Back to Dashboard Hub</a>`;
const DASH5_GROWTH_NOTE = `<div class="growth-note"><strong>Reading the numbers:</strong> The lines above show <em>cumulative</em> totals by catalog — Undergraduate reaches 47, Graduate reaches 42, for 89 combined. The <strong>46</strong> in the panel at right is a different measure: the number of records (both catalogs combined) that became newly effective in 2026 alone.</div>`;

self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isDashboardPage = event.request.mode === 'navigate' && url.pathname.includes('/resources/') && url.pathname.endsWith('.html');
  if (!isDashboardPage) return;

  event.respondWith((async () => {
    const response = await fetch(event.request);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    let changed = false;

    if (url.pathname.endsWith('/dashboard_5_full_dashboard.html') && !html.includes('Undergraduate reaches 47, Graduate reaches 42')) {
      html = html.replace('    </svg>\n    </section>', `    </svg>\n      ${DASH5_GROWTH_NOTE}\n    </section>`);
      changed = true;
    }

    if (url.pathname.endsWith('/dashboard_8_provost_report.html') && html.includes('<div class="val">51.7%</div><div class="lbl"><strong>46 of 89</strong> dated AI-signal records became effective in 2026</div>')) {
      html = html.replace('<div class="val">51.7%</div><div class="lbl"><strong>46 of 89</strong> dated AI-signal records became effective in 2026</div>', '<div class="val">51.7% <span class="growth-label">Growth in 2026</span></div><div class="lbl"><strong>46 of 89</strong> dated AI-signal records became effective in 2026</div>');
      changed = true;
    }

    if (!html.includes('Back to Dashboard Hub')) {
      if (html.includes('<div class="wrap">')) {
        html = html.replace('<div class="wrap">', `<div class="wrap">\n  ${HUB_BUTTON_HTML}`);
      } else if (html.includes('<div class="page">')) {
        html = html.replace('<div class="page">', `<div class="page">\n  ${HUB_BUTTON_HTML}`);
      } else if (html.includes('<div class="cover"')) {
        html = html.replace('<body>', `<body>\n<div class="page top-nav">${HUB_BUTTON_HTML}</div>`);
      } else {
        html = html.replace('<body>', `<body>\n${HUB_BUTTON_HTML}`);
      }
      changed = true;
    }

    if (changed && !html.includes('.home-btn{display:inline-block')) {
      if (html.includes('</style>')) {
        html = html.replace('</style>', `${HUB_BUTTON_CSS}</style>`);
      } else {
        html = html.replace('</head>', `<style>${HUB_BUTTON_CSS}</style></head>`);
      }
    }

    return new Response(html, { status: response.status, statusText: response.statusText, headers: { 'content-type': 'text/html; charset=utf-8' } });
  })());
});