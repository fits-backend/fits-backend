import { Review, Session, User, Video } from "../models";

const updateReview = async (next, obj) => {
  let document,
    reviewing,
    findById = {},
    setResult = {};

  // console.log("obje", obj);

  try {
    if (obj.reviewFor === "trainer" && obj.trainerId) {
      reviewing = await Review.find({
        $and: [{ trainer: obj.trainerId }, { reviewFor: "trainer" }],
      });
      findById._id = obj.trainerId;
    } else if (obj.reviewFor === "session" && obj.sessionId) {
      reviewing = await Review.find({
        $and: [{ session: obj.sessionId }, { reviewFor: "session" }],
      });
      findById._id = obj.sessionId;
    } else if (obj.reviewFor === "video" && obj.videoId) {
      reviewing = await Review.find({
        $and: [{ video: obj.videoId }, { reviewFor: "video" }],
      });
      findById._id = obj.videoId;
    }

    console.log("reviewing", reviewing);
    var sum = 0;

    const reviewsRecive = reviewing.length;
    reviewing.map((item, index) => {
      // console.log("item=>", item);
      // console.log("itemreview", item.rating);
      sum = sum + item.rating;
    });
    // console.log("reviewsRecive", reviewsRecive);
    // console.log("sum", sum);
    const average = sum / reviewsRecive;
    // console.log("average", average);
    setResult.numReviews = reviewsRecive;
    setResult.averageRating = average;
    // console.log("setResult", setResult);
    if (obj.reviewFor === "trainer" && obj.trainerId) {
      document = await User.findByIdAndUpdate(findById, setResult);
    } else if (obj.reviewFor === "session" && obj.sessionId) {
      document = await Session.findByIdAndUpdate(findById, setResult);
    } else if (obj.reviewFor === "video" && obj.videoId) {
      document = await Video.findByIdAndUpdate(findById, setResult);
    }
    document = await User.findByIdAndUpdate(findById, setResult);
    // console.log("....document", document);
    return document;
  } catch (err) {
    return next(err);
  }
};

export default updateReview;
