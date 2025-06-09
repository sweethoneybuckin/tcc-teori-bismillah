import { Report, User } from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";

// Get all reports
export const getReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = {};
        
        // Search functionality
        if (search) {
            whereClause = {
                [Op.or]: [
                    { report_title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { location: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const reports = await Report.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'student_id']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            message: "Reports retrieved successfully",
            data: reports.rows,
            pagination: {
                totalItems: reports.count,
                totalPages: Math.ceil(reports.count / limit),
                currentPage: parseInt(page),
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
};

// Get report by ID
export const getReportById = async (req, res) => {
    try {
        const report = await Report.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'student_id']
                }
            ]
        });

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        res.status(200).json({
            message: "Report retrieved successfully",
            data: report
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};

// Create new report
export const createReport = async (req, res) => {
    try {
        const { description, report_title, location, user_id } = req.body;

        // Check if required fields are provided
        if (!description || !report_title || !location || !user_id) {
            return res.status(400).json({ 
                message: "All fields are required: description, report_title, location, user_id" 
            });
        }

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        let photoPath = null;
        if (req.file) {
            photoPath = req.file.filename; // Store only filename, not full path
        }

        const report = await Report.create({
            photo: photoPath,
            description,
            report_title,
            location,
            user_id
        });

        // Get the created report with user info
        const createdReport = await Report.findByPk(report.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'student_id']
                }
            ]
        });

        res.status(201).json({ 
            message: "Report created successfully", 
            data: createdReport 
        });
    } catch (error) {
        console.log(error.message);
        // Delete uploaded file if report creation fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.log('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: "Error creating report", error: error.message });
    }
};

// Update report
export const updateReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const { description, report_title, location } = req.body;

        // Check if report exists
        const existingReport = await Report.findByPk(reportId);
        if (!existingReport) {
            return res.status(404).json({ message: "Report not found" });
        }

        let updateData = {};
        if (description) updateData.description = description;
        if (report_title) updateData.report_title = report_title;
        if (location) updateData.location = location;

        // Handle photo update
        if (req.file) {
            // Delete old photo if exists
            if (existingReport.photo) {
                const oldPhotoPath = path.join('uploads', existingReport.photo);
                fs.unlink(oldPhotoPath, (err) => {
                    if (err) console.log('Error deleting old photo:', err);
                });
            }
            updateData.photo = req.file.filename;
        }

        await Report.update(updateData, {
            where: { id: reportId }
        });

        // Get updated report with user info
        const updatedReport = await Report.findByPk(reportId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'student_id']
                }
            ]
        });

        res.status(200).json({ 
            message: "Report updated successfully", 
            data: updatedReport 
        });
    } catch (error) {
        console.log(error.message);
        // Delete uploaded file if update fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.log('Error deleting file:', err);
            });
        }
        res.status(500).json({ message: "Error updating report", error: error.message });
    }
};

// Delete report
export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Delete associated photo file
        if (report.photo) {
            const photoPath = path.join('uploads', report.photo);
            fs.unlink(photoPath, (err) => {
                if (err) console.log('Error deleting photo file:', err);
            });
        }

        await Report.destroy({
            where: { id: req.params.id }
        });

        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error deleting report", error: error.message });
    }
};

// Get reports by user
export const getReportsByUser = async (req, res) => {
    try {
        const reports = await Report.findAll({
            where: { user_id: req.params.userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'student_id']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: "User reports retrieved successfully",
            data: reports
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error fetching user reports", error: error.message });
    }
};

// Get recent reports (for dashboard)
export const getRecentReports = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const reports = await Report.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'student_id']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.status(200).json({
            message: "Recent reports retrieved successfully",
            data: reports
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error fetching recent reports", error: error.message });
    }
};