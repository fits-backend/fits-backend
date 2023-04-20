import { STRIPE_SECRET_KEY } from "../config/";
import {
  Classes,
  Payment,
  Personal,
  Profession,
  Review,
  Service,
  Session,
  User,
} from "../models";
import { ROLE_TYPES } from "../utils/constants";
import { isObjectEmpty } from "../utils/utility";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const userMeController = {
  // get
  async show(req, res, next) {
    let documents,
      userPersonal,
      userProfession,
      user,
      userReview,
      userServices,
      success,
      message = "",
      stripeMessage = "",
      statusCode,
      customer,
      card,
      userSession,
      sessionReview,
      payment,
      profile_status;
    let personal_step_1 = false;
    // for trainer profiles steps
    let professional_step_2 = false;
    let service_offered_step_3 = false;
    // for trainee profiles steps
    let fitness_level_step_2 = false;
    let fitness_goal_step_3 = false;
    let profile_completed = false;
    // try {
    user = await User.findById({ _id: req.user._id }).select(
      "-password -__v -updatedAt"
    );
    if (user) {
      success = true;
      statusCode = 201;
      message = "found";
      userPersonal = await Personal.findOne({
        user: req.user._id,
      }).select("-__v -updatedAt");

      userProfession = await Profession.findOne({
        user: req.user._id,
      }).select("-__v -updatedAt");

      userReview = await Review.find({
        trainer: req.user._id,
        reviewFor: "trainer",
      })
        .populate({
          path: "trainer",
          model: "User",
          select: "email numReviews averageRating role personal profession",
        })
        .populate({
          path: "reviews.user",
          model: "User",
          select: "email numReviews averageRating role personal profession",
          populate: {
            path: "personal",
            model: "Personal",
            select: "-__v -user -updatedAt",
          },
        });

      userServices = await Service.find({ user: req.user._id }).select(
        "-__v -updatedAt"
      );
      userSession = await Session.find({ user: req.user._id }).select(
        "-__v -updatedAt"
      );
      sessionReview = await Review.find({
        user: req.user._id,
      }).select("-__v -updatedAt");
      payment = await Payment.findOne({ user: req.user._id });

      if (payment) {
        if (payment.cus_id) {
          await stripe.customers
            .retrieve(payment.cus_id)
            .then((response) => {
              customer = response;
            })
            .catch((error) => {
              stripeMessage = error.raw.message;
              console.log("create Payment Grid Payment token error : ", error);
            });
        }

        if (payment.card_id && payment.cus_id) {
          await stripe.customers
            .retrieveSource(payment.cus_id, payment.card_id)
            .then((response) => {
              card = response;
            })
            .catch((error) => {
              stripeMessage = error.raw.message;
              console.log("create Payment Grid Payment token error : ", error);
            });
        }
      }

      // PROFILE COMPLETE STEPS
      if (user.role === ROLE_TYPES.TRAINER) {
        if (userPersonal) {
          personal_step_1 = true;
        }

        if (userProfession) {
          professional_step_2 = true;
        }

        if (!isObjectEmpty(user.services_offered.toObject())) {
          service_offered_step_3 = true;
        }
        profile_status = {
          personal_step_1,
          professional_step_2,
          service_offered_step_3,
        };
      } else if (user.role === ROLE_TYPES.TRAINEE) {
        if (userPersonal) {
          personal_step_1 = true;
        }

        if (!isObjectEmpty(user.fitness_level.toObject())) {
          fitness_level_step_2 = true;
        }

        if (!isObjectEmpty(user.fitness_goal.toObject())) {
          fitness_goal_step_3 = true;
        }
        profile_status = {
          personal_step_1,
          fitness_level_step_2,
          fitness_goal_step_3,
        };
      }
      if (personal_step_1 && fitness_level_step_2 && fitness_goal_step_3) {
        profile_completed = true;
      }
      if (personal_step_1 && professional_step_2 && service_offered_step_3) {
        profile_completed = true;
      }
    } else {
      message = "Not Found";
      success = false;
      statusCode = 404;
    }

    documents = {
      statusCode,
      success,
      message,
      profile_completed,
      profile_status,
      user: user,
      personal_info: userPersonal,
      profession_info: userProfession,
      reviews: userReview,
      services: userServices,
      session: { userSession, sessionReview },

      stripe: { message: stripeMessage, customer, card },
    };
    // } catch (err) {
    //   return next(err);
    // }

    res.status(statusCode).json(documents);
  },
  async showAdmin(req, res, next) {
    let documents,
      userPersonal,
      userProfession,
      userClasses,
      user,
      userReview,
      userServices,
      success,
      message = "",
      stripeMessage = "",
      statusCode,
      customer,
      card,
      userSession,
      payment,
      profile_status;
    let personal_step_1 = false;
    // for trainer profiles steps
    let professional_step_2 = false;
    let service_offered_step_3 = false;
    // for trainee profiles steps
    let fitness_level_step_2 = false;
    let fitness_goal_step_3 = false;
    let profile_completed = false;
    try {
      user = await User.findById({ _id: req.params.userId }).select(
        "-password -__v -updatedAt"
      );
      if (user) {
        success = true;
        statusCode = 201;
        message = "found";
        userPersonal = await Personal.findOne({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userProfession = await Profession.findOne({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userClasses = await Classes.find({
          user: req.params.userId,
        }).select("-__v -updatedAt");

        userReview = await Review.find({
          trainer: req.params.userId,
          reviewFor: "trainer",
        })
          .populate({
            path: "trainer",
            model: "User",
            select: "email numReviews averageRating role personal profession",
          })
          .populate({
            path: "reviews.user",
            model: "User",
            select: "email numReviews averageRating role personal profession",
            populate: {
              path: "personal",
              model: "Personal",
              select: "-__v -user -updatedAt",
            },
          });

        userServices = await Service.find({ user: req.params.userId }).select(
          "-__v -updatedAt"
        );
        userSession = await Session.find({ user: req.params.userId }).select(
          "-__v -updatedAt"
        );
        payment = await Payment.findOne({ user: req.params.userId });

        if (payment) {
          if (payment.cus_id) {
            await stripe.customers
              .retrieve(payment.cus_id)
              .then((response) => {
                customer = response;
              })
              .catch((error) => {
                stripeMessage = error.raw.message;
                console.log(
                  "create Payment Grid Payment token error : ",
                  error
                );
              });
          }

          if (payment.card_id && payment.cus_id) {
            await stripe.customers
              .retrieveSource(payment.cus_id, payment.card_id)
              .then((response) => {
                card = response;
              })
              .catch((error) => {
                stripeMessage = error.raw.message;
                console.log(
                  "create Payment Grid Payment token error : ",
                  error
                );
              });
          }
        }

        // PROFILE COMPLETE STEPS
        if (user.role === ROLE_TYPES.TRAINER) {
          if (userPersonal) {
            personal_step_1 = true;
          }

          if (userProfession) {
            professional_step_2 = true;
          }

          if (!isObjectEmpty(user.services_offered.toObject())) {
            service_offered_step_3 = true;
          }
          profile_status = {
            personal_step_1,
            professional_step_2,
            service_offered_step_3,
          };
        } else if (user.role === ROLE_TYPES.TRAINEE) {
          if (userPersonal) {
            personal_step_1 = true;
          }

          if (!isObjectEmpty(user.fitness_level.toObject())) {
            fitness_level_step_2 = true;
          }

          if (!isObjectEmpty(user.fitness_goal.toObject())) {
            fitness_goal_step_3 = true;
          }
          profile_status = {
            personal_step_1,
            fitness_level_step_2,
            fitness_goal_step_3,
          };
        }
        if (personal_step_1 && fitness_level_step_2 && fitness_goal_step_3) {
          profile_completed = true;
        }
        if (personal_step_1 && professional_step_2 && service_offered_step_3) {
          profile_completed = true;
        }
      } else {
        message = "Not Found";
        success = false;
        statusCode = 404;
      }

      documents = {
        statusCode,
        success,
        message,
        profile_completed,
        profile_status,
        user: user,
        personal_info: userPersonal,
        profession_info: userProfession,
        user_classes: userClasses,
        reviews: userReview,
        services: userServices,
        session: userSession,
        stripe: { message: stripeMessage, customer, card },
      };
    } catch (err) {
      return next(err);
    }

    res.status(statusCode).json(documents);
  },

  // async adminShow(req, res, next) {
  //   console.log("req.user._id", req.user._id);
  //   let documents,
  //     userPersonal,
  //     userProfession,
  //     user,
  //     userReview,
  //     userServices,
  //     stripeMessage = "",
  //     customer,
  //     card,
  //     userSession,
  //     payment,
  //     profile_status;
  //   let personal_step_1 = false;
  //   // for trainer profiles steps
  //   let professional_step_2 = false;
  //   let service_offered_step_3 = false;
  //   // for trainee profiles steps
  //   let fitness_level_step_2 = false;
  //   let fitness_goal_step_3 = false;
  //   let profile_completed = false;
  //   try {
  //     user = await User.findById({ _id: req.user._id }).select(
  //       "-password -__v -updatedAt"
  //     );
  //     if (user) {
  //       userPersonal = await Personal.findOne({
  //         user: req.user._id,
  //       }).select("-__v -updatedAt");
  //       userProfession = await Profession.findOne({
  //         user: req.user._id,
  //       }).select("-__v -updatedAt");

  //       userReview = await Review.find({
  //         trainer: req.user._id,
  //         reviewFor: "trainer",
  //       })

  //         .populate({
  //           path: "trainer",
  //           model: "User",
  //           select: "email numReviews averageRating role personal profession",
  //         })
  //         .populate({
  //           path: "reviews.user",
  //           model: "User",
  //           select: "email numReviews averageRating role personal profession",
  //           populate: {
  //             path: "personal",
  //             model: "Personal",
  //             select: "-__v -user -updatedAt",
  //           },
  //         });

  //       userServices = await Service.find({ user: req.user._id }).select(
  //         "-__v -updatedAt"
  //       );
  //       userSession = await Session.find({ user: req.user._id }).select(
  //         "-__v -updatedAt"
  //       );
  //       payment = await Payment.findOne({ user: req.user._id });
  //       console.log("payment", payment);
  //       if (payment) {
  //         if (payment.cus_id) {
  //           await stripe.customers
  //             .retrieve(payment.cus_id)
  //             .then((response) => {
  //               console.log("response custoemr", response);
  //               customer = response;
  //             })
  //             .catch((error) => {
  //               stripeMessage = error.raw.message;
  //               console.log(
  //                 "create Payment Grid Payment token error : ",
  //                 error
  //               );
  //             });
  //         }

  //         if (payment.card_id && payment.cus_id) {
  //           await stripe.customers
  //             .retrieveSource(payment.cus_id, payment.card_id)
  //             .then((response) => {
  //               console.log("caerd--->", response);
  //               card = response;
  //             })
  //             .catch((error) => {
  //               stripeMessage = error.raw.message;
  //               console.log(
  //                 "create Payment Grid Payment token error : ",
  //                 error
  //               );
  //             });
  //         }
  //       }

  //       // PROFILE COMPLETE STEPS
  //       if (user.role === ROLE_TYPES.TRAINER) {
  //         if (userPersonal) {
  //           personal_step_1 = true;
  //         }
  //         if (userProfession) {
  //           professional_step_2 = true;
  //         }

  //         if (!isObjectEmpty(user.services_offered.toObject())) {
  //           service_offered_step_3 = true;
  //         }
  //         profile_status = {
  //           personal_step_1,
  //           professional_step_2,
  //           service_offered_step_3,
  //         };
  //       } else if (user.role === ROLE_TYPES.TRAINEE) {
  //         if (userPersonal) {
  //           personal_step_1 = true;
  //         }

  //         if (!isObjectEmpty(user.fitness_level.toObject())) {
  //           fitness_level_step_2 = true;
  //         }

  //         if (!isObjectEmpty(user.fitness_goal.toObject())) {
  //           fitness_goal_step_3 = true;
  //         }
  //         profile_status = {
  //           personal_step_1,
  //           fitness_level_step_2,
  //           fitness_goal_step_3,
  //         };
  //       }
  //       if (personal_step_1 && fitness_level_step_2 && fitness_goal_step_3) {
  //         profile_completed = true;
  //       }
  //       if (personal_step_1 && professional_step_2 && service_offered_step_3) {
  //         profile_completed = true;
  //       }
  //     } else {
  //       return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Not Found");
  //     }

  //     documents = {
  //       profile_completed,
  //       profile_status,
  //       user: user,
  //       personal_info: userPersonal,
  //       profession_info: userProfession,
  //       reviews: userReview,
  //       services: userServices,
  //       session: userSession,
  //       stripe: { message: stripeMessage, customer, card },
  //     };
  //     console.log("documentas0-------------->", documents);
  //     return successResponse(res, next, documents, HTTP_STATUS.OK, "found");
  //   } catch (err) {
  //     return next(err);
  //   }
  // },
};

export default userMeController;
