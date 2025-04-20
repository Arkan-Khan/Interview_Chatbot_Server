import { protect } from "../middlewares/authMiddleware.js";
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { extractTextFromPDF } from '../utils/extract.js';
import { generateInterviewQuestions } from '../utils/geminiService.js';
import { continueChatWithGemini } from '../utils/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Uploads directory created at:', uploadsDir);
}

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        const filename = `${Date.now()}${extname}`;
        cb(null, filename);
    }
});
const upload = multer({ storage: storage });

router.post('/upload', protect, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const jobPosition = req.body.jobPosition;
        
        if (!jobPosition) {
            // ❌ File has already been saved, so delete it
            fs.unlinkSync(req.file.path);
            console.log('File deleted due to missing jobPosition');
            return res.status(400).json({ error: 'Job position is required' });
        }

        console.log("File received:", req.file.originalname);
        console.log("Job Position:", jobPosition);

        const extractedText = await extractTextFromPDF(req.file.path);
        const aiResponse = await generateInterviewQuestions(extractedText, jobPosition);

        // ✅ Send response first
        res.json({
            message: 'File uploaded successfully',
            file: req.file,
            extractedText,
            aiResponse
        });

        // ✅ Then delete the file after response is sent
        fs.unlinkSync(req.file.path);
        console.log('File deleted after processing');

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });

        // If an error occurs and file exists, delete it to avoid unnecessary storage
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('File deleted due to an error');
        }
    }
});

router.post('/chat', protect, async (req, res) => {
    try {
        const { query, jobPosition, resumeText, previousResponse } = req.body;
        
        if (!query || !jobPosition || !resumeText) {
            return res.status(400).json({ error: 'Required information missing' });
        }
        
        console.log("Chat query received:", query);
        console.log("Job Position:", jobPosition);
        
        const response = await continueChatWithGemini(
            query, 
            resumeText, 
            jobPosition, 
            previousResponse
        );
        
        res.json({
            response: response
        });
        
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
 