import { Review, User } from "../models";
import updateReview from "../helper/reviewUpdate";
import CustomErrorHandler from "../services/CustomErrorHandler";
import { errorResponse, successResponse } from "../utils/response";
import { HTTP_STATUS } from "../utils/constants";
const ratingController = {
  // create profile
  async store(req, res, next) {
    const { reviews, trainerId, reviewFor, videoId, sessionId } = req.body;
    let reviewData,
      documentSave,
      update,
      traineeDetail,
      trainerDetail,
      sessionDetail;
    traineeDetail = await User.findById({ _id: reviews.user });
    trainerDetail = await Review.find({
      $and: [{ trainer: trainerId }, { user: reviews.user }],
    });
    sessionDetail = await Review.find({
      $and: [{ session: sessionId }, { user: reviews.user }],
    });

    const saveReview = {
      rating: reviews.rating,
      comment: reviews.comment,
      trainer: trainerId,
      user: reviews.user,
      reviewFor,
      alreadyReview: false,
      trainee: [traineeDetail],
    };
    try {
      if (reviewFor === "trainer") {
        if (!trainerId) {
          return errorResponse(
            res,
            HTTP_STATUS.NOT_ACCEPTABLE,
            "trainerId Is Missing!",
            null
          );
        }

        saveReview.alreadyReview =
          trainerDetail[0] && trainerDetail[0].alreadyReview ? true : false;
      } else if (reviewFor === "video") {
        if (!videoId) {
          return errorResponse(
            res,
            HTTP_STATUS.NOT_ACCEPTABLE,
            "videoId Is Missing!",
            null
          );
        }
        saveReview.video = videoId;
      } else if (reviewFor === "session") {
        if (!sessionId) {
          return errorResponse(
            res,
            HTTP_STATUS.NOT_ACCEPTABLE,
            "sessionId Is Missing!",
            null
          );
        }

        saveReview.alreadyReview =
          sessionDetail[0] && sessionDetail[0].alreadyReview ? true : false;

        saveReview.session = sessionId;
      }

      reviewData = new Review(saveReview);

      if (reviewData.alreadyReview) {
        return next(CustomErrorHandler.alreadyExist("alreadyExist"));
      } else {
        reviewData.alreadyReview = true;
        documentSave = await reviewData.save();

        update = await updateReview(next, {
          trainerId,
          videoId,
          sessionId,
          reviewFor,
        });
      }
      return successResponse(
        res,
        next,
        { documentSave, update },
        HTTP_STATUS.CREATED,
        "reviews submit successfully"
      );
    } catch (err) {
      return next(err);
    }
  },

  //Review Show trainer
  async show(req, res, next) {
    let document,
      success,
      message = "",
      statusCode,
      reviewing;
    try {
      reviewing = await Review.find({ trainer: req.params.id });
      if (reviewing) {
        (message = "get successfully"), (statusCode = 200), (success = true);
      } else {
        message = "not create";
        success = false;
        statusCode = 404;
      }
    } catch (err) {
      return next(err);
    }
    document = {
      statusCode,
      success,
      message,
      data: reviewing,
    };
    res.status(statusCode).json(document);
  },
};

export default ratingController;
