const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
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
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Role field
}, { timestamps: true });

// Generate sequential custom userId like USR001 or ADM001
userSchema.pre("save", async function (next) {
  if (this.userId) return next();

  try {
    const prefix = this.role === "admin" ? "ADM" : "USR";

    // Find the latest user of the same role
    const lastUser = await mongoose.model("User").findOne(
      { role: this.role },
      {},
      { sort: { createdAt: -1 } }
    );

    let newNumber = 1;
    if (lastUser && lastUser.userId) {
      const lastNumber = parseInt(lastUser.userId.replace(prefix, ""), 10);
      if (!isNaN(lastNumber)) newNumber = lastNumber + 1;
    }

    this.userId = `${prefix}${String(newNumber).padStart(3, "0")}`;
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