const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  location: String,
  work: String,
  gender: String,
  age: Number,
  preferredContact: String,
  volunteering: String,
  volunteeringTypes: [String],
  volunteeringDays: String
});

module.exports = mongoose.model("User", userSchema);
