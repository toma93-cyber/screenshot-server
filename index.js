const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/screenshot', async (req, res) => {
  const { url, width, height } = req.query;
  if (!url) return res.status(400).send('Missing url param');

  // Use puppeteer's bundled Chrome
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ],
    // Don't specify executablePath to use bundled Chrome
  });

  try {
    const page = await browser.newPage();
    const w = parseInt(width) || 1920;
    const h = parseInt(height) || 1080;
    await page.setViewport({ width: w, height: h });
    await page.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await page.screenshot({ fullPage: false });
    await browser.close();

    res.set('Content-Type', 'image/png');
    res.send(screenshot);
  } catch (err) {
    console.error(err);
    await browser.close();
    res.status(500).send('Failed to take screenshot: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Screenshot server running on port ${PORT}`));
