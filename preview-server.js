const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// --- Argument parsing ---
const shopUrl = process.argv[2];

if (!shopUrl || !shopUrl.startsWith('http')) {
  console.error('Usage: npm run preview -- <url>');
  console.error('Example: npm run preview -- https://www.vitie.cz/xl-caj-rodinny--20-sacku--vlci-mak/');
  process.exit(1);
}

const PORT = 3001;
const ROOT = __dirname;

var parsedUrl = new URL(shopUrl);
var previewName = parsedUrl.hostname.replace(/^www\./, '').split('.')[0];

var previewDir = path.join(ROOT, 'preview', previewName);
var contentFile = path.join(previewDir, 'content.html');
var scriptFile = path.join(previewDir, 'script.js');
var cssOutputFile = path.join(ROOT, 'dist', 'generic.css');

// --- Fetch e-shop page ---
function fetchPage(url) {
  return new Promise(function (resolve, reject) {
    var client = url.startsWith('https') ? https : http;

    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function (res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        var loc = res.headers.location;
        if (loc.startsWith('/')) loc = parsedUrl.origin + loc;
        return fetchPage(loc).then(resolve, reject);
      }

      var chunks = [];
      res.on('data', function (chunk) { chunks.push(chunk); });
      res.on('end', function () { resolve(Buffer.concat(chunks).toString('utf8')); });
      res.on('error', reject);
    }).on('error', reject);
  });
}

// --- HTML processing ---

function splitRootElements(html) {
  var results = [];
  var depth = 0;
  var start = -1;
  var i = 0;

  while (i < html.length) {
    var rest = html.slice(i);

    if (/^<div[\s>]/i.test(rest)) {
      if (depth === 0) start = i;
      depth++;
      while (i < html.length && html[i] !== '>') i++;
    } else if (/^<\/div>/i.test(rest)) {
      depth--;
      if (depth === 0 && start !== -1) {
        results.push(html.substring(start, i + 6));
        start = -1;
      }
      i += 5;
    }
    i++;
  }

  if (results.length === 0 && html.trim()) {
    results.push(html.trim());
  }

  return results;
}

function detectWidgetClass(elementHTML) {
  var match = elementHTML.match(/class="[^"]*\b(?:rc|pb)-([a-z0-9]+(?:-[a-z0-9]+)*)\b/);
  return match ? match[1] : null;
}

function wrapWidgetHTML(rawHTML) {
  var elements = splitRootElements(rawHTML);

  var wrapped = elements.map(function (el, index) {
    var widgetName = detectWidgetClass(el);
    if (!widgetName) return el;

    return '<div data-pobo-widget-id="' + (index + 1) + '"' +
      ' data-pobo-unique-id="' + (1000 + index) + '"' +
      ' class="widget-container widget-' + widgetName + ' pobo-reveal">' +
      '<div class="widget-typography">' + el + '</div></div>';
  });

  return '<div id="pobo-all-content" data-pobo-content="product"' +
    ' data-pobo-design-id="default"' +
    ' data-pobo-page-id="0"' +
    ' data-pobo-lang="default"' +
    ' data-pobo-version="2.0">' +
    '<div id="pobo-inner-content">' +
    '<div id="pobo-standard-widget">' +
    wrapped.join('\n') +
    '</div></div></div>';
}

// --- Read compiled CSS ---
function readCSS() {
  try {
    return fs.readFileSync(cssOutputFile, 'utf8');
  } catch (e) {
    return '';
  }
}

// --- Read user script ---
function readScript() {
  try {
    return fs.readFileSync(scriptFile, 'utf8');
  } catch (e) {
    return '';
  }
}

// --- Build current widget state ---
function buildWidgetData(includeCSS) {
  var rawHTML = fs.existsSync(contentFile)
    ? fs.readFileSync(contentFile, 'utf8')
    : '';

  var data = {
    html: wrapWidgetHTML(rawHTML),
    js: readScript(),
  };

  if (includeCSS) {
    data.css = readCSS();
  }

  return data;
}

// --- SSE ---
var clients = new Set();

function pushUpdate(includeCSS) {
  var data = buildWidgetData(includeCSS);
  var payload = 'data: ' + JSON.stringify(data) + '\n\n';

  for (var client of clients) {
    client.write(payload);
  }

  console.log('[' + new Date().toLocaleTimeString() + '] Update → ' + clients.size + ' client(s)' + (includeCSS ? ' (+CSS)' : ''));
}

// --- Live reload script ---
var liveReloadScript = `
<script>
(function() {
  function init() {
    var source = new EventSource('http://localhost:${PORT}/events');

    source.onopen = function() {
      console.log('[Pobo Preview] Connected');
    };

    source.onmessage = function(event) {
      var data = JSON.parse(event.data);

      var target = document.querySelector('.basic-description');
      if (target && data.html) {
        target.innerHTML = data.html;
        console.log('[Pobo Preview] HTML updated');
      } else if (!target) {
        console.warn('[Pobo Preview] .basic-description not found on page');
      }

      if (data.css) {
        var style = document.getElementById('pobo-dev-preview');
        if (!style) {
          style = document.createElement('style');
          style.id = 'pobo-dev-preview';
          document.head.appendChild(style);
        }
        style.textContent = data.css;
        console.log('[Pobo Preview] CSS updated (' + Math.round(data.css.length / 1024) + ' KB)');
      }

      // Execute user script (re-run after each HTML update so event listeners re-attach)
      if (data.js) {
        try {
          var oldScript = document.getElementById('pobo-dev-script');
          if (oldScript) oldScript.remove();
          var s = document.createElement('script');
          s.id = 'pobo-dev-script';
          s.textContent = data.js;
          document.body.appendChild(s);
          console.log('[Pobo Preview] JS executed');
        } catch(e) {
          console.error('[Pobo Preview] JS error:', e);
        }
      }
    };

    source.onerror = function() {
      console.log('[Pobo Preview] Connection lost, retrying...');
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;

// --- Main ---
async function main() {
  // Create preview directory if needed
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });

    fs.writeFileSync(contentFile, '<div class="rc-image-half-left">\n' +
      '  <div class="rc-image-half-left__image">\n' +
      '    <img src="https://via.placeholder.com/600x400" class="rc-image-half-left__img" alt="Preview">\n' +
      '  </div>\n' +
      '  <div class="rc-image-half-left__text">\n' +
      '    <h2>Nadpis widgetu</h2>\n' +
      '    <p>Zde napište obsah widgetu.</p>\n' +
      '  </div>\n' +
      '</div>\n');

    fs.writeFileSync(scriptFile, '// Custom JavaScript for your widgets\n' +
      '// This runs after each HTML update, so event listeners re-attach automatically.\n' +
      '//\n' +
      '// Example:\n' +
      '// document.querySelectorAll(\'.rc-gallery-one__image\').forEach(function(img) {\n' +
      '//   img.addEventListener(\'click\', function() { console.log(\'clicked\'); });\n' +
      '// });\n');

    console.log('Created: preview/' + previewName + '/');
  }

  // Start Parcel watch for SCSS compilation in the background
  console.log('Starting Parcel watch for SCSS...');
  var parcel = spawn('npx', ['parcel', 'watch', 'src/generic.scss', '--dist-dir', 'dist', '--no-hmr'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  var parcelReady = false;
  var parcelFailed = false;

  parcel.stdout.on('data', function (data) {
    var msg = data.toString().trim();
    if (msg) console.log('[Parcel] ' + msg);

    if (msg.includes('Built in') || msg.includes('built in')) {
      if (parcelReady) {
        pushUpdate(true);
      }
      parcelReady = true;
    }
    if (msg.includes('Build failed') || msg.includes('failed')) {
      parcelFailed = true;
    }
  });

  parcel.stderr.on('data', function (data) {
    var msg = data.toString().trim();
    if (msg && (msg.includes('Build failed') || msg.includes('Error:'))) {
      console.log('[Parcel] ' + msg.split('\n')[0]);
      parcelFailed = true;
    }
  });

  parcel.on('close', function (code) {
    if (code !== null && code !== 0) {
      parcelFailed = true;
    }
  });

  // Wait for first Parcel build (max 20s), fallback to build/generic.css
  var buildCssFile = path.join(ROOT, 'build', 'generic.css');
  await new Promise(function (resolve) {
    var elapsed = 0;
    var check = setInterval(function () {
      elapsed += 300;
      if (parcelReady) {
        clearInterval(check);
        resolve();
      } else if (parcelFailed || elapsed > 20000) {
        clearInterval(check);
        // Fallback to existing build
        if (fs.existsSync(buildCssFile)) {
          cssOutputFile = buildCssFile;
          console.log('Parcel build failed, using fallback: build/generic.css');
        } else {
          console.log('Warning: No CSS available (Parcel failed, no build/generic.css)');
        }
        resolve();
      }
    }, 300);
  });

  console.log('CSS ready: ' + Math.round(readCSS().length / 1024) + ' KB');

  // Fetch the e-shop page
  console.log('Fetching: ' + shopUrl);
  var pageHTML;
  try {
    pageHTML = await fetchPage(shopUrl);
  } catch (err) {
    console.error('Failed to fetch page:', err.message);
    process.exit(1);
  }
  console.log('Fetched OK (' + Math.round(pageHTML.length / 1024) + ' KB)');

  // Modify the fetched page
  var baseTag = '<base href="' + parsedUrl.origin + parsedUrl.pathname + '">';
  var modifiedHTML = pageHTML;

  modifiedHTML = modifiedHTML.replace(/<head([^>]*)>/i, '<head$1>' + baseTag);
  modifiedHTML = modifiedHTML.replace('</body>', liveReloadScript + '</body>');

  // --- HTTP server ---
  var server = http.createServer(function (req, res) {
    // SSE endpoint
    if (req.url === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      clients.add(res);
      console.log('Client connected (' + clients.size + ' total)');

      req.on('close', function () {
        clients.delete(res);
        console.log('Client disconnected (' + clients.size + ' total)');
      });

      // Send initial data with CSS
      var data = buildWidgetData(true);
      res.write('data: ' + JSON.stringify(data) + '\n\n');
      return;
    }

    // Serve the e-shop page copy
    if (req.url === '/' || req.url === parsedUrl.pathname) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(modifiedHTML);
    }

    // Everything else → redirect to original domain
    res.writeHead(302, { 'Location': parsedUrl.origin + req.url });
    res.end();
  });

  // Watch content.html and script.js changes
  fs.watch(previewDir, function (eventType, filename) {
    if (filename && (filename.endsWith('.html') || filename.endsWith('.js'))) {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(function () {
        pushUpdate(false);
      }, 100);
    }
  });

  var debounce = null;

  // Cleanup on exit
  process.on('SIGINT', function () {
    parcel.kill();
    process.exit(0);
  });
  process.on('SIGTERM', function () {
    parcel.kill();
    process.exit(0);
  });

  // Start
  server.listen(PORT, function () {
    console.log('');
    console.log('  ┌──────────────────────────────────────────────────┐');
    console.log('  │  Pobo Preview Server                             │');
    console.log('  │  http://localhost:' + PORT + '                            │');
    console.log('  └──────────────────────────────────────────────────┘');
    console.log('');
    console.log('  E-shop: ' + shopUrl);
    console.log('');
    console.log('  Otevři v prohlížeči:');
    console.log('  http://localhost:' + PORT);
    console.log('');
    console.log('  Edituj:');
    console.log('    preview/' + previewName + '/content.html  — HTML widgetů');
    console.log('    preview/' + previewName + '/script.js     — JavaScript');
    console.log('    src/**/*.scss                     — styly widgetů');
    console.log('');
  });
}

main();
