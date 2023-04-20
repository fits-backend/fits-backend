const mongoose = require("mongoose");

const ratingSchema = mongoose.Schema(
  {
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    reviewFor: { type: String }, // video || trainer
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    trainee: { type: Array, required: false },
    role: { type: String },
    alreadyReview: { type: Boolean, default: false },
    reviews: [ratingSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema, "reviews");
