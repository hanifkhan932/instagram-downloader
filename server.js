const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const YTDlpWrap = require('yt-dlp-wrap').default;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (!fs.existsSync('downloads')) fs.mkdirSync('downloads');

const ytDlpBinary = path.join(__dirname, 'yt-dlp-bin');

async function setupYtDlp() {
  if (!fs.existsSync(ytDlpBinary)) {
    console.log('yt-dlp download ho raha hai...');
    await YTDlpWrap.downloadFromGithub(ytDlpBinary);
    console.log('yt-dlp ready hai!');
  }
}

setupYtDlp();

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Valid Instagram URL dein' });
  }

  const filename = `audio_${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, 'downloads', filename);

  try {
    const ytDlpWrap = new YTDlpWrap(ytDlpBinary);

    await ytDlpWrap.execPromise([
      url,
      '-x',
      '--audio-format', 'mp3',
      '--no-check-certificates',
      '-o', outputPath
    ]);

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'File nahi bani, dobara try karein.' });
    }

    res.download(outputPath, 'instagram_audio.mp3', (err) => {
      if (err) console.error('Download error:', err);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Audio download nahi ho saka.' });
  }
});

app.listen(3000, () => {
  console.log('Server chal raha hai: http://localhost:3000');
});