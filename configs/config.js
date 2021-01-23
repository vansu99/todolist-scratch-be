module.exports = {
  ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3001,
  URL: process.env.BASE_URL || 'http://localhost:3001',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://sa:adMapHK64CHQWzsS@cluster0.zlqb1.mongodb.net/climate?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'secret1',
};