// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true }, // <-- Add custom ID field
  fullName: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone:    { type: String },
  location: { type: String },
  work:     { type: String },
  gender:   { type: String },
  age:      { type: Number },
  volunteering: { type: String },
  volunteeringTypes: { type: [String], default: [] },
  volunteeringDays: { type: String },
}, { timestamps: true });

// Generate sequential custom userId like USR001, USR002...
userSchema.pre("save", async function (next) {
  if (this.userId) return next(); // skip if already set

  try {
    // Get last created user sorted by creation date
    const lastUser = await mongoose.model("User").findOne({}, {}, { sort: { createdAt: -1 } });

    let newNumber = 1;
    if (lastUser && lastUser.userId) {
      const lastNumber = parseInt(lastUser.userId.replace("USR", ""), 10);
      if (!isNaN(lastNumber)) {
        newNumber = lastNumber + 1;
      }
    }

    // Format as USR001, USR002...
    this.userId = `USR${String(newNumber).padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Optional: remove password before sending user data
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
