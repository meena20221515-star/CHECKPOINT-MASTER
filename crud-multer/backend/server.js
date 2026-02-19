const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/checkpointDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// CORRECTED SCHEMA - Has files array for multiple files
const checkpointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  todos: { type: [String], default: [] },
  date: { type: Date, required: true },
  files: [{
    filename: String,
    originalname: String,
    size: Number,
    path: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Checkpoint = mongoose.model('Checkpoint', checkpointSchema);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer setup for MULTIPLE files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ========== CORRECTED ROUTES ==========

// GET all checkpoints
app.get('/api/checkpoints', async (req, res) => {
  try {
    const checkpoints = await Checkpoint.find();
    res.json(checkpoints);
  } catch (error) {
    console.error('Error fetching checkpoints:', error);
    res.status(500).json({ error: 'Failed to fetch checkpoints' });
  }
});

// POST create checkpoint WITH MULTIPLE FILES - CORRECTED
app.post('/api/checkpoints', upload.array('files'), async (req, res) => {
  try {
    console.log('=== MULTIPLE FILE UPLOAD STARTED ===');
    console.log('Files received:', req.files ? req.files.length : 0);
    
    const { name, todos, date } = req.body;
    
    if (!name || !todos || !date) {
      return res.status(400).json({ error: 'Name, todos, and date are required' });
    }

    // Parse todos array
    let parsedTodos;
    try {
      parsedTodos = JSON.parse(todos);
    } catch (error) {
      parsedTodos = Array.isArray(todos) ? todos : [todos];
    }

    // Process MULTIPLE uploaded files
    const files = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'files...');
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.originalname} (${file.size} bytes)`);
        files.push({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          path: `/uploads/${file.filename}`,
          uploadDate: new Date()
        });
      });
    } else {
      console.log('No files received in request');
    }

    const checkpoint = new Checkpoint({
      name,
      todos: parsedTodos,
      date: new Date(date),
      files // ALL FILES SAVED TOGETHER IN ONE DOCUMENT
    });

    await checkpoint.save();
    console.log('Checkpoint saved with', files.length, 'files');
    res.status(201).json(checkpoint);
  } catch (error) {
    console.error('Error creating checkpoint:', error);
    res.status(500).json({ error: 'Failed to create checkpoint' });
  }
});

// PUT update checkpoint
app.put('/api/checkpoints/:id', async (req, res) => {
  try {
    const checkpoint = await Checkpoint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint not found' });
    }
    res.json(checkpoint);
  } catch (error) {
    console.error('Error updating checkpoint:', error);
    res.status(400).json({ error: 'Failed to update checkpoint' });
  }
});

// DELETE checkpoint
app.delete('/api/checkpoints/:id', async (req, res) => {
  try {
    const checkpoint = await Checkpoint.findById(req.params.id);
    if (!checkpoint) {
      return res.status(404).json({ error: 'Checkpoint not found' });
    }

    // Delete associated files from uploads folder
    if (checkpoint.files && checkpoint.files.length > 0) {
      checkpoint.files.forEach(file => {
        if (file.filename) {
          const filePath = path.join(__dirname, 'uploads', file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await Checkpoint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Checkpoint deleted successfully' });
  } catch (error) {
    console.error('Error deleting checkpoint:', error);
    res.status(500).json({ error: 'Failed to delete checkpoint' });
  }
});

// POST upload single file (for editing - adding new files)
app.post('/api/checkpoints/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      uploadDate: new Date()
    };
    
    res.json(fileData);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// POST delete file
app.post('/api/checkpoints/delete-file', async (req, res) => {
  try {
    const { filePath, checkpointId } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    // Extract filename from path
    const filename = path.basename(filePath);
    
    // Delete from uploads folder
    const fullPath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove file from checkpoint if checkpointId provided
    if (checkpointId) {
      await Checkpoint.findByIdAndUpdate(
        checkpointId,
        { $pull: { files: { path: filePath } } },
        { new: true }
      );
    }
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log('Ready for MULTIPLE file uploads...');
});