// routes/api.js
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth'); // Import auth middleware

// Apply auth middleware to all routes in this file
// Any request to /api/todos/* will now require a valid token
router.use(auth);

// @route   POST /api/todos
// @desc    Create a new todo for the authenticated user
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;
        if (!title) {
            return res.status(400).json({ msg: 'Title is required' });
        }

        const newTodo = new Todo({
            user: req.user.id, // Associate with logged-in user
            title,
            description,
            dueDate,
            priority,
        });

        const todo = await newTodo.save();
        res.status(201).json(todo);
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/todos
// @desc    Get all todos for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/todos/:id
// @desc    Get a single todo by ID for the authenticated user
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        // Check if the todo belongs to the authenticated user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to access this todo' });
        }
        res.json(todo);
    } catch (err) {
        next(err);
    }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo for the authenticated user
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to update this todo' });
        }

        const { title, description, dueDate, priority, completed } = req.body;
        const updatedFields = {};
        if (title !== undefined) updatedFields.title = title;
        if (description !== undefined) updatedFields.description = description;
        if (dueDate !== undefined) updatedFields.dueDate = dueDate; // Allows setting to null
        if (priority !== undefined) updatedFields.priority = priority;
        if (completed !== undefined) updatedFields.completed = completed;

        if (Object.keys(updatedFields).length === 0) {
             return res.status(400).json({ msg: "No fields to update provided." });
        }
        if (updatedFields.title !== undefined && updatedFields.title.trim() === '') {
             return res.status(400).json({ msg: "Title cannot be empty."});
        }

        // Ensure 'user' field is not accidentally changed by $set
        if (updatedFields.user) delete updatedFields.user;

        todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );
        res.json(todo);
    } catch (err) {
        next(err);
    }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo for the authenticated user
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete this todo' });
        }

        await todo.remove(); // Mongoose v6 uses .remove() on the document

        res.json({ msg: 'Todo removed successfully', id: req.params.id });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
