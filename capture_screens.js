import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/rowlandanafu/.gemini/antigravity/brain/d2c9fed0-536d-438c-a90d-6d5d0730edd6';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const distDir = path.resolve('dist');

function serveStatic(req, res) {
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

async function run() {
  const server = createServer(serveStatic);
  await new Promise((resolve) => server.listen(8081, resolve));
  console.log('Static preview server running on http://localhost:8081');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2 });

  await page.goto('http://localhost:8081', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  console.log('1. Capturing Welcome & Onboarding...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_1_welcome_auth.png') });

  // Click "Skip & Explore App" to enter BookingWizard
  console.log('2. Entering App to Capture Step 1...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Skip & Explore App') || el.innerText.includes('Continue'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_2_step1_locations.png') });

  // Click "Continue to Inventory"
  console.log('3. Capturing Step 2: Inventory & Cargo...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Continue to Inventory'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_3_step2_inventory.png') });

  // Click AI Scanner
  console.log('4. Capturing AI Camera Scanner Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div'));
    const b = btns.find(el => el.innerText && el.innerText.includes('Shiftly Vision AI™ Scanner'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_4_ai_scanner_modal.png') });

  // Test scanning a sample room
  console.log('4b. Triggering Sample Room AI Scan...');
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('div, button'));
    const b = els.find(el => el.innerText && el.innerText.includes('Living Room'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_4b_ai_scan_detected.png') });

  // Apply AI scan
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText && el.innerText.includes('Apply AI Scan'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Proceed to Step 3 (Vehicle Fleet)
  console.log('5. Capturing Step 3: Vehicle Fleet Selection...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Select Vehicle Fleet') || el.innerText.includes('Vehicle Fleet'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_5_step3_fleet.png') });

  // Proceed to Step 4 (Pricing & Checkout)
  console.log('6. Capturing Step 4: Price Breakdown & Promo...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Review Price') || el.innerText.includes('Price & Add-Ons'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_6_step4_checkout.png') });

  // Confirm booking to get to Live Tracking Map
  console.log('7. Capturing Live GPS Tracking Map...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Confirm & Dispatch Mover'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // In CheckoutModal, click Pay Now
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Pay $') || el.innerText.includes('Apple Pay') || el.innerText.includes('Pay'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_7_live_tracking_map.png') });

  // Switch to Driver Partner Mode
  console.log('8. Capturing Driver Partner Dispatch Portal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Driver Partner'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_8_driver_portal.png') });

  // Switch to Fleet tab
  console.log('9. Capturing Fleet Types Tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Fleet Types') || el.innerText.includes('Fleet'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screen_9_fleet_types.png') });

  console.log('🎉 ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  await browser.close();
  server.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
