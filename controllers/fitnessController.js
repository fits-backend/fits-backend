import { Fitness, User } from "../models";
import fitnessSchema from "../validators/fitnessSchema";

const fitnessController = {
  // create profile
  async store(req, res, next) {
    // validation
    const { error } = fitnessSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { fitness_level, fitness_goal, services_offered } = req.body;
    let document,
      success,
      message = "",
      statusCode,
      fitness;

    try {
      console.log("req.userId", req.user._id);
      fitness = await Fitness.create(
        {
          fitness_level,
          fitness_goal,
          services_offered,
          user: req.user._id,
        },
        { new: true }
      );
      if (fitness) {
        success = true;
        statusCode = 201;
        message = "fitness info create successfully";
      } else {
        message = "not found";
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
      data: fitness,
    };

    res.status(statusCode).json(document);
  },

  //update fitness info
  async update(req, res, next) {
    // validation
    // const { error } = fitnessSchema.validate(req.body);
    // if (error) {
    //   return next(error);
    // }
    const { fitness_level, fitness_goal, services_offered } = req.body;
    console.log("fitenesslevel", fitness_level, services_offered);
    let document,
      success,
      message = "",
      statusCode,
      getFitness;

    try {
      getFitness = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
          fitness_level,
          fitness_goal,
          services_offered,
          user: req.user._id,
        },
        { new: true }
      );
      console.log("getFitness", getFitness);

      if (getFitness) {
        success = true;
        statusCode = 200;
        message = "particular fitness info updated successfully";
      } else {
        message = "not found";
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
      data: getFitness,
    };

    res.status(statusCode).json(document);
  },

  // choose fitness level and goal
  async chooseFitness(req, res, next) {
    const { fitness_level, fitness_goal, services_offered } = req.body;

    let document,
      success,
      message = "",
      statusCode,
      fitness,
      user;

    if (fitness_level) {
      user = {
        fitness_level,
      };
    } else if (fitness_goal) {
      user = {
        fitness_goal,
      };
    } else if (services_offered) {
      user = {
        services_offered,
      };
    } else {
      return next("error");
    }

    try {
      console.log("user", user);
      fitness = await User.findByIdAndUpdate({ _id: req.params.id }, user, {
        new: true,
      });
      console.log("fitness", fitness);
      if (fitness) {
        success = true;
        statusCode = 200;
        message = "your fitness info updated successfully";
      } else {
        message = "not found";
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
      data: fitness,
    };
    res.status(statusCode).json(document);
  },
};

export default fitnessController;
