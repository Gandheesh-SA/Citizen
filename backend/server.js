// server.js
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 7500;
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
