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

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
      {
        url: "************",
        description: "Render Production Server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      // ✅ ADD SCHEMAS HERE (THIS FIXES YOUR ERROR)
      schemas: {
        LabPrescription: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            userId: {
              type: "integer",
              example: 29,
            },
            labBookingId: {
              type: "integer",
              nullable: true,
              example: null,
            },
            fileUrl: {
              type: "string",
              example:
                "https://medicaldhatvi.blob.core.windows.net/labs/prescriptions/file.jpg",
            },
            fileType: {
              type: "string",
              example: "image/jpeg",
            },
            status: {
              type: "string",
              example: "UPLOADED",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
  },

  apis: [
    "./src/modules/**/*.routes.js",
    "./src/routes/**/*.js",
  ],
};

export const swaggerSpec = swaggerJsDoc(options);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);