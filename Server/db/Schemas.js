import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  email: { type: String, required: [true,"Email is required"], unique: true, maxlength: 255 },
  password: { type: String, required: [true, "Password is required"], maxlength: 255 },
  name: { type: String, required: true, maxlength: 255 },
  createdAt: { type: Date, default: Date.now, required: true },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
})

const reportsSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: String, required: true },
  wasteType: { type: String, required: true, maxlength: 255 },
  amount: { type: String, required: true, maxlength: 255 },
  imageUrl: { type: String },
  verificationResult: { type: Object }, // JSON object
  status: { type: String, required: true, default: "Pending", maxlength: 255 },
  createdAt: { type: Date, default: Date.now, required: true, get: (v) => v instanceof Date ? v : new Date(v) },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const rewardSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  points: { type: Number, default: 0, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  isAvailable: { type: Boolean, default: true, required: true },
  desc: { type: String },
  name: { type: String, required: true, maxlength: 255 },
  collectionInfo: { type: Object, required: true }, // JSON object
});

const collectedWasteSchema = mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report",
    required: true,
  },
  collectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collectionDate: { type: Date, required: true },
  status: { type: String, default: "Collected", required: true },
});

const notificationSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, maxlength: 50 },
  isRead: { type: Boolean, default: false, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
});

const TransactionSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true, maxlength: 20 },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
});

// Named Exports - must be import and used with same name as in this file.
export const User = mongoose.model("User", userSchema);
export const Rewards = mongoose.model("Rewards", rewardSchema);
export const Report = mongoose.model("Report", reportsSchema);
export const CollectedWaste = mongoose.model(
  "CollectedWaste",
  collectedWasteSchema
);
export const Notifications = mongoose.model(
  "Notifications",
  notificationSchema
);
export const Transaction = mongoose.model("Transaction", TransactionSchema);
