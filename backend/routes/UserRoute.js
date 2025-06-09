import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    loginUser,
    updateUser,
    deleteUser
} from "../controllers/UserController.js";

const router = express.Router();

// GET /api/users - Get all users
router.get('/users', getUsers);

// GET /api/users/:id - Get user by ID
router.get('/users/:id', getUserById);

// POST /api/users/register - Create new user (Register)
router.post('/users/register', createUser);

// POST /api/users/login - User login
router.post('/users/login', loginUser);

// PUT /api/users/:id - Update user
router.put('/users/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', deleteUser);

export default router;