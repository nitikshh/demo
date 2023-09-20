const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/video-list', (req, res) => {
  const results = [];
  fs.createReadStream('videos.csv')
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      console.log('CSV file loaded:', results);
      res.json(results);
    });
});

app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), (req, res) => {
  const videoFile = req.files['video'][0];
  const posterFile = req.files['poster'][0];
  const title = req.body.title;

  // Create column names if the CSV file doesn't exist
  if (!fs.existsSync('videos.csv')) {
    fs.writeFileSync('videos.csv', 'Title,VideoLink,PosterLink\n');
  }

  // Append data to the CSV file
  const videoLink = `/uploads/${videoFile.filename}`;
  const posterLink = `/uploads/${posterFile.filename}`;
  fs.appendFileSync('videos.csv', `${title},${videoLink},${posterLink}\n`);

  res.status(200).send('Data saved successfully.');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
