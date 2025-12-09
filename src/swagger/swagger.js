import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hospital Backend API",
      version: "1.0.0",
      description: "API documentation for frontend team",
    },

    // 🔥 MUST ADD THIS FOR JWT AUTH IN SWAGGER
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // 🔥 <optional> If you want all endpoints secured by default:
    // security: [
    //   { bearerAuth: [] }
    // ],

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
      {
        url: "https://hospital-backend-1-9jq0.onrender.com",
        description: "Render Production Server",
      }
    ],
  },

  // 🔍 Where to scan for @swagger comments
  apis: [
    "./src/modules/hospital/user/routes/*.js",
    "./src/modules/hospital/admin/routes/*.js",
  ],
};

// Create swagger spec & middleware
export const swaggerSpec = swaggerJsDoc(options);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
