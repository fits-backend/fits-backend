import Joi from "joi";

const subscriptionSchema = Joi.object({
  video_links: Joi.array().required(),
});

export default subscriptionSchema;
