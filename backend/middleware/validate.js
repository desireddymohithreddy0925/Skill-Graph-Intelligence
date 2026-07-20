const Joi = require('joi');

/**
 * Generic middleware to validate req.body against a Joi schema.
 * Prevents NoSQL injection by ensuring strict payload shapes.
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    // stripUnknown ensures any extra fields injected by attacker are removed
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    
    if (error) {
      const errorMessage = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: 'Validation Error', details: errorMessage });
    }
    
    // Assign validated and stripped payload back to req.body
    req.body = value;
    next();
  };
};

module.exports = { validateBody };
