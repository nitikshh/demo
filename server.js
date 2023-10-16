const express = require('express');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const createDirectories = () => {
    const directories = ['videos', 'images', 'data'];
    const uploadDirectory = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory);
    }
    directories.forEach(directory => {
        const dirPath = path.join(uploadDirectory, directory);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
};

const createDataFile = () => {
    const filePath = path.join(__dirname, 'uploads', 'data', 'data.txt');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf-8');
    }
};

createDirectories();
createDataFile();

app.use('/', express.static(path.join(__dirname, 'uploads')));

// Rest of the code remains unchanged
// ...

app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), (req, res) => {
    const { title } = req.body;
    const videoFile = req.files['video'][0];
    const posterFile = req.files['poster'][0];

    const videoExt = path.extname(videoFile.originalname);
    const posterExt = path.extname(posterFile.originalname);

    const videoName = uuid.v4() + videoExt;
    const posterName = uuid.v4() + posterExt;

    const videoPath = path.join(__dirname, 'uploads', 'videos', videoName);
    const posterPath = path.join(__dirname, 'uploads', 'images', posterName);

    fs.renameSync(videoFile.path, videoPath);
    fs.renameSync(posterFile.path, posterPath);

    const dataFilePath = path.join(__dirname, 'uploads', 'data', 'data.txt');
    const data = `Title: ${title}\nPoster URL: ${path.join('images', posterName)}\nVideo URL: ${path.join('videos', videoName)}\n\n`;

    fs.appendFileSync(dataFilePath, data);

    res.redirect('/');
});


app.get('/video-list', (req, res) => {
    const dataFilePath = path.join(__dirname, 'uploads', 'data', 'data.txt');
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const dataArray = rawData.split('\n\n').filter(Boolean);

    const videoData = dataArray.map(entry => {
        const [title, posterUrl, videoUrl] = entry.split('\n').map(row => row.split(': ')[1]);
        return { title, posterUrl, videoUrl };
    });

    res.json(videoData);
});

app.post('/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), (req, res) => {
    const { title } = req.body;
    const videoFile = req.files['video'][0];
    const posterFile = req.files['poster'][0];

    const videoExt = path.extname(videoFile.originalname);
    const posterExt = path.extname(posterFile.originalname);

    const videoName = uuid.v4() + videoExt;
    const posterName = uuid.v4() + posterExt;

    const videoPath = path.join(__dirname, 'uploads', 'videos', videoName);
    const posterPath = path.join(__dirname, 'uploads', 'images', posterName);

    fs.renameSync(videoFile.path, videoPath);
    fs.renameSync(posterFile.path, posterPath);

    const dataFilePath = path.join(__dirname, 'uploads', 'data', 'data.txt');
    const data = `Title: ${title}\nPoster URL: ${path.relative(path.join(__dirname, 'uploads'), posterPath)}\nVideo URL: ${path.relative(path.join(__dirname, 'uploads'), videoPath)}\n\n`;

    fs.appendFileSync(dataFilePath, data);

    res.redirect('/');
});

app.use(express.static('public'));
app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/play.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'play.html'));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
