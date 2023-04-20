// Load the AWS SDK for Node.js
import { config, SES } from "aws-sdk";
const apiController = {
  // Welcome to fits
  async api(req, res, next) {
    try {
      return res.json({
        message: "Welcome To Fits Backend API",
      });
    } catch (error) {
      console.log("Default Api error : " + error);
      return next(error);
    }
  },
  // async email(req, res, next) {
  //   try {
  //     const resData = await awsMailerSender();
  //     console.log("res", resData);
  //   } catch (error) {
  //     console.log("Default Api error : " + error);
  //     return next(error);
  //   }
  // },
};
// Set the region
config.update({ region: "us-east-1" });

// Create sendEmail params
// var params = {
//   Source: "protechgiant@gmail.com",
//   Destination: {
//     ToAddresses: ["protechgiant@gmail.com"],
//     /* required */
//     // CcAddresses: [
//     //   "protechgiant@gmail.com",
//     //   /* more items */
//     // ],
//     // ToAddresses: [
//     //   "protechgiant@gmail.com",
//     //   /* more items */
//     // ],
//   },
//   Message: {
//     /* required */
//     Body: {
//       /* required */
//       // Html: {
//       //   Charset: "UTF-8",
//       //   Data: "HTML_FORMAT_BODY",
//       // },
//       Text: {
//         // Charset: "UTF-8",
//         Data: "TEXT_FORMAT_BODY",
//       },
//     },
//     Subject: {
//       // Charset: "UTF-8",
//       Data: "Test email",
//     },
//   },
//   // Source: "protechgiant@gmail.com" /* required */,
//   // ReplyToAddresses: [
//   //   "ameenhamza392@domain.com",
//   //   /* more items */
//   // ],
// };

// Create the promise and SES service object
// var sendPromise = new SES({ apiVersion: "2010-12-01" })
//   .sendEmail(params)
//   .promise();

// Handle promise's fulfilled/rejected states
// const awsMailerSender = () => {
//   sendPromise
//     .then(function (data) {
//       console.log(data.MessageId);
//     })
//     .catch(function (err) {
//       console.error(err, err.stack);
//     });
// };

export default apiController;
