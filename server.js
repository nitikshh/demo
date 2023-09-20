const express = require('express');
const app = express();
const http = require('http').createServer(app);
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const PORT = process.env.PORT || 3000;
const CSV_FILE_PATH = path.join(__dirname, 'uploads', 'video_links.csv'); // Path to the CSV file

// Create the "uploads" folder if it doesn't exist
const UPLOADS_FOLDER = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER);
}

// Set up Multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save uploaded videos and images to the "uploads" folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext); // Rename the file with a unique timestamp
    },
});

const upload = multer({ storage });

// Initialize the videos array by reading data from the CSV file
const videos = [];

fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (row) => {
        videos.push(row);
    })
    .on('end', () => {
        console.log('CSV file loaded:', videos);
    });

// Serve static files from the "public" folder
app.use(express.static(__dirname + '/public'));

// Serve uploaded videos and images
app.use('/uploads', express.static(__dirname + '/uploads'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/upload', (req, res) => {
    res.sendFile(__dirname + '/upload.html');
});

// Handle video uploads
app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), (req, res) => {
    const title = req.body.title;
    const videoFile = req.files['video'][0];
    const posterFile = req.files['poster'][0];

    // Save the video, poster, and title to the uploads folder
    const videoPath = path.join(__dirname, 'uploads', videoFile.filename);
    const posterPath = path.join(__dirname, 'uploads', posterFile.filename);

    fs.renameSync(videoFile.path, videoPath);
    fs.renameSync(posterFile.path, posterPath);

    // Add video data to the videos array and save to the CSV file
    const videoData = {
        Title: title,
        VideoLink: `/uploads/${videoFile.filename}`,
        PosterLink: `/uploads/${posterFile.filename}`,
    };

    videos.push(videoData);

    fs.appendFileSync(CSV_FILE_PATH, `${videoData.Title},${videoData.VideoLink},${videoData.PosterLink}\n`);

    // Redirect back to the main page after uploading
    res.redirect('/');
});

app.get('/video-list', (req, res) => {
    // Send the videoList as JSON response
    res.json(videos);
});


// Generate and save the CSV file
app.get('/generate-csv', (req, res) => {
    const csvData = videos.map(video => `${video.Title},${video.VideoLink},${video.PosterLink}`).join('\n');

    // Save the CSV to a file
    fs.writeFileSync(CSV_FILE_PATH, csvData);

    res.send('CSV file generated and saved.');
});

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
