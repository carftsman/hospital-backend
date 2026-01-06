import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
    
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    // Zod validation error
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    // Other errors
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

