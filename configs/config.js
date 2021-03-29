module.exports = {
  ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  URL: process.env.CORS_URL || "http://localhost:3001",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    "mongodb+srv://sa:y1IWvdawZ6w5zmfR@cluster0.0ksvw.mongodb.net/todos?retryWrites=true&w=majority",
  JWT_SECRET: process.env.JWT_SECRET || "secret1",
};
