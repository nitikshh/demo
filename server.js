const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Use JSON middleware for parsing request bodies
app.use(express.json());

// Define the route for uploading videos and posters
app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), (req, res) => {
  const videoFile = req.files['video'][0];
  const posterFile = req.files['poster'][0];
  const title = req.body.title;

  // Generate the paths for video and poster files
  const videoPath = '/uploads/' + videoFile.filename;
  const posterPath = '/uploads/' + posterFile.filename;

  // Create or append to the CSV file with column names if it doesn't exist
  const csvData = [
    {
      Title: 'Title',
      VideoLink: 'VideoLink',
      PosterLink: 'PosterLink',
    },
    {
      Title: title,
      VideoLink: videoPath,
      PosterLink: posterPath,
    },
  ];

  const csvFilePath = 'videos.csv';

  fs.stat(csvFilePath, (err, stat) => {
    const fileExists = !err;

    csvData.forEach((data, index) => {
      if (!fileExists && index === 0) {
        // If the file doesn't exist, write the header row
        fs.writeFileSync(csvFilePath, `${Object.keys(data).join(',')}\n`);
      }

      // Append data to the CSV file
      fs.appendFileSync(csvFilePath, `${Object.values(data).join(',')}\n`);
    });

    res.send('File uploaded successfully.');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
