// src/middleware/sanitization.middleware.js

const { body, query, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 * Returns 400 if validation fails
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
}

/**
 * Validation rules for user registration
 */
const validateRegister = [
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .isLength({ max: 255 }).withMessage('Email must not exceed 255 characters')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6, max: 100 }).withMessage('Password must be between 6 and 100 characters'),
    body('full_name')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ max: 100 }).withMessage('Full name must not exceed 100 characters')
        .escape(), // Escape HTML characters
    handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

/**
 * Validation rules for creating a review
 */
const validateReview = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid recipe ID'),
    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters')
        .escape(), // Escape HTML to prevent XSS
    handleValidationErrors
];

/**
 * Validation rules for search query
 */
const validateSearch = [
    query('q')
        .trim()
        .notEmpty().withMessage('Search query is required')
        .isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters')
        .escape(),
    handleValidationErrors
];

/**
 * Validation rules for recipe ID parameter
 */
const validateRecipeId = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid recipe ID'),
    handleValidationErrors
];

/**
 * Validation rules for pagination and filters
 */
const validateRecipeQuery = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 }).withMessage('Offset must be a positive integer'),
    query('prep_time_min')
        .optional()
        .isInt({ min: 1, max: 1440 }).withMessage('Prep time must be between 1 and 1440 minutes'),
    query('average_rating')
        .optional()
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    handleValidationErrors
];

/**
 * Validation rules for saving a recipe
 */
const validateSaveRecipe = [
    body('recipe_id')
        .isInt({ min: 1 }).withMessage('Invalid recipe ID'),
    handleValidationErrors
];

/**
 * Validation rules for user ID parameter
 */
const validateUserId = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid user ID'),
    handleValidationErrors
];

/**
 * Validation rules for user list query parameters
 */
const validateUserQuery = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 }).withMessage('Offset must be a positive integer'),
    handleValidationErrors
];

/**
 * Validation rules for updating a recipe (all fields optional)
 */
const validateUpdateRecipe = [
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title cannot be empty')
        .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters')
        .escape(),
    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Description cannot be empty')
        .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
        .escape(),
    body('image_url')
        .optional()
        .trim()
        .isURL().withMessage('Image URL must be a valid URL')
        .isLength({ max: 500 }).withMessage('Image URL must not exceed 500 characters'),
    body('prep_time_min')
        .optional()
        .isInt({ min: 1, max: 1440 }).withMessage('Prep time must be between 1 and 1440 minutes'),
    body('ingredients')
        .optional()
        .isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('ingredients.*.name')
        .optional()
        .trim()
        .notEmpty().withMessage('Ingredient name is required')
        .isLength({ max: 100 }).withMessage('Ingredient name must not exceed 100 characters')
        .escape(),
    body('ingredients.*.quantity')
        .optional()
        .trim()
        .notEmpty().withMessage('Ingredient quantity is required')
        .isLength({ max: 50 }).withMessage('Quantity must not exceed 50 characters'),
    body('ingredients.*.unit')
        .optional()
        .trim()
        .notEmpty().withMessage('Ingredient unit is required')
        .isLength({ max: 50 }).withMessage('Unit must not exceed 50 characters'),
    body('steps')
        .optional()
        .isArray({ min: 1 }).withMessage('At least one step is required'),
    body('steps.*.instruction')
        .optional()
        .trim()
        .notEmpty().withMessage('Step instruction is required')
        .isLength({ max: 500 }).withMessage('Instruction must not exceed 500 characters')
        .escape(),
    handleValidationErrors
];

/**
 * Validation rules for creating a recipe
 */
const validateCreateRecipe = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters')
        .escape(),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
        .escape(),
    body('image_url')
        .optional()
        .trim()
        .isURL().withMessage('Image URL must be a valid URL')
        .isLength({ max: 500 }).withMessage('Image URL must not exceed 500 characters'),
    body('prep_time_min')
        .isInt({ min: 1, max: 1440 }).withMessage('Prep time must be between 1 and 1440 minutes'),
    body('ingredients')
        .isArray({ min: 1 }).withMessage('At least one ingredient is required'),
    body('ingredients.*.name')
        .trim()
        .notEmpty().withMessage('Ingredient name is required')
        .isLength({ max: 100 }).withMessage('Ingredient name must not exceed 100 characters')
        .escape(),
    body('ingredients.*.quantity')
        .trim()
        .notEmpty().withMessage('Ingredient quantity is required')
        .isLength({ max: 50 }).withMessage('Quantity must not exceed 50 characters'),
    body('ingredients.*.unit')
        .trim()
        .notEmpty().withMessage('Ingredient unit is required')
        .isLength({ max: 50 }).withMessage('Unit must not exceed 50 characters'),
    body('steps')
        .isArray({ min: 1 }).withMessage('At least one step is required'),
    body('steps.*.instruction')
        .trim()
        .notEmpty().withMessage('Step instruction is required')
        .isLength({ max: 500 }).withMessage('Instruction must not exceed 500 characters')
        .escape(),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateReview,
    validateSearch,
    validateRecipeId,
    validateRecipeQuery,
    validateSaveRecipe,
    validateUserId,
    validateUserQuery,
    validateCreateRecipe,
    validateUpdateRecipe,
    handleValidationErrors
};
