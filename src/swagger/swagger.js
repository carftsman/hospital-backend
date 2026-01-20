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

<<<<<<< Updated upstream
    // MUST ADD THIS FOR JWT AUTH IN SWAGGER
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    //  <optional> If you want all endpoints secured by default:
    // security: [
    //   { bearerAuth: [] }
    // ],

=======
>>>>>>> Stashed changes
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
      {
        url: "https://hospital-backend-1-9jq0.onrender.com",
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

      schemas: {
        /* ENUMS */
        SearchTypeEnum: {
          type: "string",
          enum: ["doctor", "hospital", "category", "symptom", "all"],
          example: "doctor",
        },

        ConsultationModeEnum: {
          type: "string",
          enum: ["ONLINE", "OFFLINE", "BOTH"],
          example: "BOTH",
        },

        /* MODE SEARCH */
        ModeSearchRequest: {
          type: "object",
          required: ["q"],
          properties: {
            q: { type: "string", example: "cardio" },
            type: { $ref: "#/components/schemas/SearchTypeEnum" },
            mode: { $ref: "#/components/schemas/ConsultationModeEnum" },
            latitude: { type: "number", nullable: true },
            longitude: { type: "number", nullable: true },
            page: { type: "integer", default: 1 },
            limit: { type: "integer", default: 20 },
          },
        },

        /* BOOKING */
        BookForOther: {
          type: "object",
          required: ["timeslotId", "bookingFor", "patient"],
          properties: {
            timeslotId: { type: "integer" },
            bookingFor: { type: "string", enum: ["OTHER"] },
            patient: {
              type: "object",
              required: ["fullName", "phone"],
              properties: {
                fullName: { type: "string" },
                phone: { type: "string" },
                age: { type: "integer" },
                gender: { type: "string" },
              },
            },
          },
        },

        BookForSelf: {
          type: "object",
          required: ["timeslotId", "bookingFor"],
          properties: {
            timeslotId: { type: "integer" },
            bookingFor: { type: "string", enum: ["SELF"] },
          },
        },

        BookingSummaryResponse: {
          type: "object",
          properties: {
            bookingId: { type: "integer" },
            status: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
            date: { type: "string" },
            time: { type: "string" },
          },
        },
      },
    },
  },

<<<<<<< Updated upstream
  // Where to scan for @swagger comments
=======
>>>>>>> Stashed changes
  apis: [
    "./src/modules/hospital/user/routes/*.js",
    "./src/modules/hospital/admin/routes/*.js",
  ],
};

export const swaggerSpec = swaggerJsDoc(options);
export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
