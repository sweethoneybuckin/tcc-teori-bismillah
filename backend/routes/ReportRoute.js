import express from "express";
import {
    getReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    getReportsByUser,
    getRecentReports
} from "../controllers/ReportController.js";

const router = express.Router();

// GET /api/reports - Get all reports with pagination and search
router.get('/reports', getReports);

// GET /api/reports/recent - Get recent reports
router.get('/reports/recent', getRecentReports);

// GET /api/reports/:id - Get report by ID
router.get('/reports/:id', getReportById);

// POST /api/reports - Create new report (with photo upload)
router.post('/reports', (req, res, next) => {
    req.upload.single('photo')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, createReport);

// PUT /api/reports/:id - Update report (with photo upload)
router.put('/reports/:id', (req, res, next) => {
    req.upload.single('photo')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, updateReport);

// DELETE /api/reports/:id - Delete report
router.delete('/reports/:id', deleteReport);

// GET /api/users/:userId/reports - Get reports by user
router.get('/users/:userId/reports', getReportsByUser);

export default router;