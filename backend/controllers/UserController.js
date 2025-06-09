import { User, Report } from "../models/index.js";
import bcrypt from "bcryptjs";

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // Don't return passwords
            include: [
                {
                    model: Report,
                    as: 'reports',
                    attributes: ['id', 'report_title', 'location', 'createdAt']
                }
            ],
            order: [['name', 'ASC']]
        });

        res.status(200).json({
            message: "Users retrieved successfully",
            data: users
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { id: req.params.id },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Report,
                    as: 'reports',
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            data: user
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error fetching user", error: error.message });
    }
};

// Create new user (Register)
export const createUser = async (req, res) => {
    try {
        const { email, password, name, student_id } = req.body;

        // Check if required fields are provided
        if (!email || !password || !name || !student_id) {
            return res.status(400).json({ 
                message: "All fields are required: email, password, name, student_id" 
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            student_id
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.status(201).json({ 
            message: "User created successfully", 
            data: userWithoutPassword 
        });
    } catch (error) {
        console.log(error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields.email) {
                res.status(400).json({ message: "Email already exists" });
            } else if (error.fields.student_id) {
                res.status(400).json({ message: "Student ID already exists" });
            } else {
                res.status(400).json({ message: "Duplicate entry" });
            }
        } else {
            res.status(500).json({ message: "Error creating user", error: error.message });
        }
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required" 
            });
        }

        // Find user by email
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.status(200).json({
            message: "Login successful",
            data: userWithoutPassword
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error during login", error: error.message });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // If password is being updated, hash it
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        const [updated] = await User.update(updateData, {
            where: { id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({ 
            message: "User updated successfully", 
            data: updatedUser 
        });
    } catch (error) {
        console.log(error.message);
        if (error.name === 'SequelizeUniqueConstraintError') {
            if (error.fields.email) {
                res.status(400).json({ message: "Email already exists" });
            } else if (error.fields.student_id) {
                res.status(400).json({ message: "Student ID already exists" });
            } else {
                res.status(400).json({ message: "Duplicate entry" });
            }
        } else {
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        // Check if user has reports
        const reportCount = await Report.count({
            where: { user_id: req.params.id }
        });

        if (reportCount > 0) {
            return res.status(400).json({ 
                message: `Cannot delete user. User has ${reportCount} reports. Delete reports first.` 
            });
        }

        const deleted = await User.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};