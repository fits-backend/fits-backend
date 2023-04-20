import Joi from "joi";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { Personal, Profession, User } from "../../models";
import JwtServices from "../../services/JwtService";
import { isObjectEmpty } from "../../utils/utility";
import { ROLE_TYPES } from "../../utils/constants";

const loginController = {
  async login(req, res, next) {
    // Validation
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
    });
    const { error } = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    // check if user exist in database already
    let user, result, professionResult, personal, profile_status;
    let personal_step_1 = false;
    // for trainer profiles steps
    let professional_step_2 = false;
    let service_offered_step_3 = false;
    // for trainee profiles steps
    let fitness_level_step_2 = false;
    let fitness_goal_step_3 = false;
    let profile_completed = false;

    try {
      user = await User.findOne({ email: req.body.email }).select(
        "-updatedAt -__v"
      );
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }
      personal = await Personal.findOne({ user: user._id });
      if (user.role === ROLE_TYPES.TRAINER) {
        if (personal) {
          personal_step_1 = true;
        }
        professionResult = await Profession.findOne({ user: user._id });
        if (professionResult) {
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
        if (personal) {
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
    } catch (err) {
      return next(err);
    }

    // compare password
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return next(CustomErrorHandler.wrongCredentials());
    }
    console.log("emailVerified:", user.emailVerified);
    //emailVerified
    if (!user.emailVerified) {
      return next(
        CustomErrorHandler.wrongCredentials("please verify your email first")
      );
    } else if (user.suspended) {
      return next(
        CustomErrorHandler.wrongCredentials("your account has been suspended")
      );
    } else {
      // tokens
      const access_token = JwtServices.sign({ _id: user._id, role: user.role });

      // database whitlist
      result = {
        message: "success",
        login: true,
        access_token,
        profile_completed,
        profile_status,
        data: user,
      };
    }
    res.status(200).json(result);
  },

  async logout(req, res, next) {
    // validations
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const { error } = refreshSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (err) {
      return next(new Error("Something went wrong in the database"));
    }
    res.json({ status: 1 });
  },
};

export default loginController;
