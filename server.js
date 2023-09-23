const express = require('express');
const app = express();
const http = require('http').createServer(app);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;

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

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads')); // Serve uploaded videos and images

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/upload', (req, res) => {
    res.sendFile(__dirname + '/upload.html');
});

// Define an array to store video data
const videos = [];

// Define a function to save video metadata to a file
function saveVideoMetadata() {
    const metadataPath = path.join(__dirname, 'metadata.json');

    // Create an array of video data with URLs
    const videoList = videos.map(video => ({
        title: video.title,
        videoUrl: `/uploads/${video.videoFileName}`,
        posterUrl: `/uploads/${video.posterFileName}`,
    }));

    // Save the video metadata to a JSON file
    fs.writeFileSync(metadataPath, JSON.stringify(videoList, null, 2));
}

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

    // Add video data to the videos array
    videos.push({
        title: title,
        videoFileName: videoFile.filename,
        posterFileName: posterFile.filename,
    });

    // Save video metadata to a file
    saveVideoMetadata();

    // Redirect back to the main page after uploading
    res.redirect('/');
});

// Define a route to get the list of videos
app.get('/video-list', (req, res) => {
    // Create an array of video data with URLs
    const videoList = videos.map(video => ({
        title: video.title,
        videoUrl: `/uploads/${video.videoFileName}`,
        posterUrl: `/uploads/${video.posterFileName}`,
    }));

    // Send the videoList as JSON response
    res.json(videoList);
});
