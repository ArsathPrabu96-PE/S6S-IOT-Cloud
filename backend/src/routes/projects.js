import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// @route   GET /api/projects/categories
// @desc    Get available project categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Project.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get categories',
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty().trim().withMessage('Project name is required'),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('tags').optional().isArray(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, description, category, tags } = req.body;
      
      const project = await Project.create(req.userId, {
        name,
        description,
        category,
        tags,
      });
      
      res.status(201).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create project',
      });
    }
  }
);

// @route   GET /api/projects
// @desc    Get all user projects
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, category } = req.query;
    
    const result = await Project.listByUser(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      category,
    });
    
    res.json({
      success: true,
      data: result.projects,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list projects',
    });
  }
});

// @route   GET /api/projects/stats
// @desc    Get project statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await Project.getStats(req.userId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project statistics',
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id, req.userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project',
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('status').optional().isIn(['active', 'paused', 'archived']),
    body('tags').optional().isArray(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { name, description, category, status, tags } = req.body;
      
      const project = await Project.update(req.params.id, req.userId, {
        name,
        description,
        category,
        status,
        tags,
      });
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found',
        });
      }
      
      res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update project',
      });
    }
  }
);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.delete(req.params.id, req.userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
});

// @route   GET /api/projects/:id/devices
// @desc    Get devices for a project
// @access  Private
router.get('/:id/devices', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id, req.userId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    const devices = await Project.getDevicesByProject(req.params.id, req.userId);
    
    res.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error('Get project devices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get project devices',
    });
  }
});

export default router;
