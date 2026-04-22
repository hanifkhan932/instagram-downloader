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

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Valid Instagram URL dein' });
  }

  const filename = `audio_${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, 'downloads', filename);

  const command = `yt-dlp -x --audio-format mp3 --no-check-certificates -o "${outputPath}" "${url}"`;

  console.log('Command chal raha hai:', command);

  exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error:', stderr);
      return res.status(500).json({ error: 'Audio download nahi ho saka. URL check karein.' });
    }

    console.log('Success:', stdout);

    if (!fs.existsSync(outputPath)) {
      return res.status(500).json({ error: 'File nahi bani, dobara try karein.' });
    }

    res.download(outputPath, 'instagram_audio.mp3', (err) => {
      if (err) console.error('Download error:', err);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  });
});

app.listen(3000, () => {
  console.log('Server chal raha hai: http://localhost:3000');
});