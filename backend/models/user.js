const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },               // Custom ID like USR001
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    phone: { type: String },
    age: { type: Number },
    gender: { type: String },

    work: { type: String },           // Profession / Work
    location: { type: String, default: "Coimbatore" }, 
    area: { type: String },           // NEW FIELD

    volunteering: { type: String },   // Yes / No
    volunteeringTypes: { type: [String], default: [] },   // MULTIPLE selections
    volunteeringDays: { type: String },

    badge: { type: String, default: "Beginner" },         // NEW FIELD, NON-EDITABLE

    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Generate sequential custom userId like USR001 / ADM001
userSchema.pre("save", async function (next) {
  if (this.userId) return next();

  try {
    const prefix = this.role === "admin" ? "ADM" : "USR";

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

// Remove password before sending user
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
