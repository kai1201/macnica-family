import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  executablePath: undefined,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

try {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 15000 });
} catch (e) {
  console.error('Navigation error:', e.message);
}

// Wait a moment for any animations/renders
await new Promise(r => setTimeout(r, 1500));

await page.screenshot({
  path: 'C:\\Users\\21754\\AppData\\Local\\Temp\\app-screenshot.png',
  fullPage: false,
});

// Also capture full page
await page.screenshot({
  path: 'C:\\Users\\21754\\AppData\\Local\\Temp\\app-screenshot-full.png',
  fullPage: true,
});

// Get some layout metrics
const metrics = await page.evaluate(() => {
  const bodyHeight = document.body.scrollHeight;
  const viewportHeight = window.innerHeight;
  const overflows = bodyHeight > viewportHeight;

  const logo = document.querySelector('img[alt], .logo, header img, nav img, [class*="logo"]');
  const previewArea = document.querySelector('[class*="preview"], [class*="Preview"], canvas, .preview-area');
  const promptInput = document.querySelector('textarea, input[type="text"], [class*="prompt"], [class*="input"]');

  function getBounds(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height, bottom: r.bottom, tag: el.tagName, className: el.className };
  }

  return {
    bodyHeight,
    viewportHeight,
    overflows,
    logo: getBounds(logo),
    previewArea: getBounds(previewArea),
    promptInput: getBounds(promptInput),
    title: document.title,
    bodyClasses: document.body.className,
  };
});

console.log(JSON.stringify(metrics, null, 2));

await browser.close();
