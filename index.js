const express = require('express');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');
const { performance } = require('perf_hooks');

const app = express();

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// Route to render the index page
app.get('/', (req, res) => {
  res.render('index');
});

// POST route for image conversion (handles file upload)
app.post('/convert', upload.single('image'), async (req, res) => {
  const { format } = req.body;
  const validFormats = ['jpeg', 'png', 'webp', 'tiff', 'gif', 'avif', 'heif'];

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Check if the requested format is valid
  if (!validFormats.includes(format)) {
    return res.status(400).send('Invalid format requested. Supported formats: jpeg, png, webp, tiff, gif, avif, heif');
  }

  // Start measuring the time
  const startTime = performance.now();

  try {
    // Perform image conversion
    const convertedImageBuffer = await sharp(req.file.buffer)
      .toFormat(format) // Convert to the requested format
      .toBuffer();

    // Measure the time taken
    const endTime = performance.now();
    const timeTaken = (endTime - startTime) / 1000; // Convert to seconds

    // Check if conversion time exceeded the limit
    if (timeTaken > 5) {
      return res.status(408).json({ error: 'Conversion took too long. Please reduce the image size.' });
    }

    // Send the converted image as response
    const fileName = `converted-image.${format}`;
    res.json({
      image: convertedImageBuffer.toString('base64'), // Send image as base64
      fileName: fileName
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing the image');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
