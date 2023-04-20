import { JWT_SECRET } from "../config";
import { User } from "../models";
import otp from "../models/otp";
import sgMail from "@sendgrid/mail";
import { API_KEY } from "../config/";
import CustomErrorHandler from "./CustomErrorHandler";
class SendGridService {
  static async sendEmail(email, next) {
    const otpCode = Math.floor(10000 + Math.random() * 90000);
    let result;
    // check if user exist in database already
    const exist = await User.exists({ email: email });
    if (!exist) {
      return next(
        CustomErrorHandler.alreadyExist("This User Is Not Registered!")
      );
    }
    // check if otp already exist
    result = await otp
      .findOne({ email: email })
      .limit(1)
      .sort({ $natural: -1 });
    console.log("result", result);
    //if exist then update the otp otherwise create new one
    if (result) {
      const upDate = await otp.findByIdAndUpdate(
        { _id: result._id },
        { code: otpCode, expireIn: new Date().getTime() + 60000 },{new:true}
      );
      return upDate;
    } else {
      const otpData = new otp({
        email,
        code: otpCode,
        expireIn: new Date().getTime() + 60000,
      });
      result = await otpData.save();
      return result;
    }

    // if (result) {
    //   console.log("mailer if");
    //   mailer(result.email, otpCode, next);
    //   console.log("mailer");
    //   let response = {
    //     statusCode: 200,
    //     success: true,
    //     email: result.email,
    //     message: "OTP sent to your email, please check your email",
    //   };
    //   return response;
    // } else {
    //   return next(new Error("email does not exist!"));
    // }
  }
}
//mailer function call
function mailer(email, otp, next) {
  try {
    const resp = sgMail.setApiKey(API_KEY);

    const message = {
      // from: "protechgiant@gmail.com",
      from: "hamzaameen8079@gmail.com",
      to: { email },
      subject: "OTP Genrate from Fits App",
      text: `Your verification code is ${otp} from Fits`,
      html: `<p>Your verification code is  <h4> ${otp} </h4> for Fits App </p>`,
    };

    sgMail
      .send(message)
      .then((res) => {
        console.log("Email Send Successfully...", res);
        return res;
      })
      .catch((error) => {
        // console.log("erroriiiii", error);
        // console.log("erroriiiii", error);
        // console.log("erroriiiii", error.response.body.errors[0]);
        return next(error);
      });
  } catch (error) {
    console.log("catch error", error);
    return next(error);
  }
}
export default SendGridService;
