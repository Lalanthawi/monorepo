const { body, validationResult } = require("express-validator");

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => `${error.path}: ${error.msg}`).join(", ");
    return res.status(400).json({ 
      success: false,
      message: `Validation failed: ${errorMessages}`,
      errors: errors.array() 
    });
  }
  next();
};

// Sri Lankan phone number validator (supports both mobile and landline)
const isSriLankanPhone = (value) => {
  if (!value) return false;

  // Remove spaces, dashes, and parentheses
  const cleanPhone = value.replace(/[\s\-\(\)]/g, "");

  // Sri Lankan phone number patterns:
  // Mobile: +94XXXXXXXXX or 0XXXXXXXXX (starts with 07)
  // Landline: +94XXXXXXXXX or 0XXXXXXXXX (starts with 01, 02, 03, 04, 05, 06, 08, 09)
  
  // Mobile pattern: starts with 07 or +947
  const mobileRegex = /^(?:\+94|0)?7[0-9]{8}$/;
  
  // Landline pattern: starts with 01-06, 08, 09 or +941-6, +948, +949
  const landlineRegex = /^(?:\+94|0)?[1-6,8-9][0-9]{8}$/;

  return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
};

// Full name validator
const isValidFullName = (value) => {
  if (!value || value.trim() === "") {
    return false;
  }
  
  const trimmedName = value.trim();
  
  // Check if full name contains only numbers
  if (/^\d+$/.test(trimmedName)) {
    return false;
  }
  
  // Check if full name is primarily numbers (more than 70% numbers)
  const totalChars = trimmedName.replace(/\s/g, '').length;
  const numberChars = (trimmedName.match(/\d/g) || []).length;
  if (totalChars > 0 && (numberChars / totalChars) > 0.7) {
    return false;
  }
  
  // Check minimum length (at least 2 characters)
  if (trimmedName.length < 2) {
    return false;
  }
  
  return true;
};

// User validation rules
const userValidationRules = () => {
  return [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Invalid email format"),
    body("password")
      .optional({ nullable: true })
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("full_name")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Full name is required")
      .custom(isValidFullName)
      .withMessage("Full name cannot be only numbers and must be at least 2 characters long"),
    body("phone")
      .notEmpty()
      .withMessage("Phone number is required")
      .custom(isSriLankanPhone)
      .withMessage(
        "Please enter a valid Sri Lankan phone number (mobile: 07X XXX XXXX or landline: 0XX XXX XXXX)"
      ),
    body("role")
      .isIn(["Admin", "Manager", "Electrician"])
      .withMessage("Invalid role"),
  ];
};

// Task validation rules
const taskValidationRules = () => {
  return [
    body("title")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Task title is required"),
    body("description").optional().trim().escape(),
    body("customer_name")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Customer name is required"),
    body("customer_phone")
      .notEmpty()
      .withMessage("Customer phone is required")
      .custom(isSriLankanPhone)
      .withMessage("Please enter a valid Sri Lankan phone number (mobile or landline)"),
    body("customer_address")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Customer address is required"),
    body("priority")
      .isIn(["High", "Medium", "Low", "Urgent"])
      .withMessage("Invalid priority value"),
    body("scheduled_date")
      .isDate()
      .withMessage("Invalid scheduled date"),
    body("scheduled_time_start")
      .notEmpty()
      .withMessage("Start time is required"),
    body("scheduled_time_end")
      .notEmpty()
      .withMessage("End time is required"),
    body("estimated_hours")
      .isNumeric()
      .withMessage("Estimated hours must be a number"),
  ];
};

module.exports = {
  validate,
  userValidationRules,
  taskValidationRules,
};
