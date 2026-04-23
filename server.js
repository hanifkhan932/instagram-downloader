const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (!fs.existsSync('downloads')) fs.mkdirSync('downloads');

// yt-dlp path dhundho
function getYtDlpPath() {
  const paths = [
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    '/root/.local/bin/yt-dlp',
    'yt-dlp'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return 'yt-dlp';
}

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Valid Instagram URL dein' });
  }

  const filename = `audio_${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, 'downloads', filename);
  const ytdlp = getYtDlpPath();

  console.log('yt-dlp path:', ytdlp);

  const command = `${ytdlp} -x --audio-format mp3 --no-check-certificates -o "${outputPath}" "${url}"`;

  console.log('Command:', command);

  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Stderr:', stderr);
      return res.status(500).json({ error: 'Audio download nahi ho saka.' });
    }

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'File nahi bani.' });
    }

    res.download(outputPath, 'instagram_audio.mp3', (err) => {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  });
});

app.listen(3000, () => {
  console.log('Server chal raha hai: http://localhost:3000');
});