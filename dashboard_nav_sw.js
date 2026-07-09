const HUB_BUTTON_CSS = `.home-btn{display:inline-block;margin-bottom:18px;padding:9px 14px;border-radius:999px;background:#005035;color:#fff!important;text-decoration:none!important;font-family:Inter,Aptos,Arial,sans-serif;font-size:13px;font-weight:800;box-shadow:0 6px 14px rgba(15,23,42,.10)}.home-btn:hover{background:#00351f}.top-nav{padding-top:18px;padding-bottom:0}`;
const HUB_BUTTON_HTML = `<a class="home-btn" href="../index.html">← Back to Dashboard Hub</a>`;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isDashboardPage = event.request.mode === 'navigate' && url.pathname.includes('/resources/') && url.pathname.endsWith('.html');
  if (!isDashboardPage) return;

  event.respondWith((async () => {
    const response = await fetch(event.request);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    if (html.includes('Back to Dashboard Hub')) {
      return new Response(html, { status: response.status, statusText: response.statusText, headers: { 'content-type': 'text/html; charset=utf-8' } });
    }

    if (html.includes('</style>')) {
      html = html.replace('</style>', `${HUB_BUTTON_CSS}</style>`);
    } else {
      html = html.replace('</head>', `<style>${HUB_BUTTON_CSS}</style></head>`);
    }

    if (html.includes('<div class="wrap">')) {
      html = html.replace('<div class="wrap">', `<div class="wrap">\n  ${HUB_BUTTON_HTML}`);
    } else if (html.includes('<div class="page">')) {
      html = html.replace('<div class="page">', `<div class="page">\n  ${HUB_BUTTON_HTML}`);
    } else if (html.includes('<div class="cover"')) {
      html = html.replace('<body>', `<body>\n<div class="page top-nav">${HUB_BUTTON_HTML}</div>`);
    } else {
      html = html.replace('<body>', `<body>\n${HUB_BUTTON_HTML}`);
    }

    return new Response(html, { status: response.status, statusText: response.statusText, headers: { 'content-type': 'text/html; charset=utf-8' } });
  })());
});