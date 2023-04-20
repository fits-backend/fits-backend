import Subscription from "../models/subscription";
import { HTTP_STATUS } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";
import subscriptionSchema from "../validators/subscription";
const subscriptionController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = subscriptionSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { video_links } = req.body;
    let subscribeVideo;

    try {
      subscribeVideo = await Subscription.create({
        video_links: video_links,
        user: req.user._id,
      });
      if (!subscribeVideo) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "you does't subscribe any video"
        );
      }

      return successResponse(
        res,
        next,
        subscribeVideo,
        HTTP_STATUS.OK,
        "subscribe videos successfully"
      );
    } catch (err) {
      return next(err);
    }
  },

  //get all subscriptions videos

  async index(req, res, next) {
    let subscribeVideo;

    try {
      subscribeVideo = await Subscription.find({});

      return successResponse(
        res,
        next,
        subscribeVideo,
        HTTP_STATUS.OK,
        "subscribe videos successfully"
      );
    } catch (err) {
      return next(err);
    }
  },

  //show subscription get by userId

  async show(req, res, next) {
    let subscribeVideo;

    try {
      subscribeVideo = await Subscription.findOne({ user: req.params.userId });
      if (!subscribeVideo) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "you does't subscribe any video"
        );
      }
      return successResponse(
        res,
        next,
        subscribeVideo,
        HTTP_STATUS.OK,
        "subscribe videos successfully"
      );
    } catch (err) {
      return next(err);
    }
  },
};

export default subscriptionController;
