// // Load the AWS SDK for Node.js
// import { config, SES } from "aws-sdk";
// // Set the region
// config.update({ region: "us-west-2" });

// // Create sendEmail params
// var params = {
//   Destination: {
//     /* required */
//     CcAddresses: [
//       "protechgiant@gmail.com",
//       /* more items */
//     ],
//     ToAddresses: [
//       "ameenhamza392@gmail.com",
//       /* more items */
//     ],
//   },
//   Message: {
//     /* required */
//     Body: {
//       /* required */
//       Html: {
//         Charset: "UTF-8",
//         Data: "HTML_FORMAT_BODY",
//       },
//       Text: {
//         Charset: "UTF-8",
//         Data: "TEXT_FORMAT_BODY",
//       },
//     },
//     Subject: {
//       Charset: "UTF-8",
//       Data: "Test email",
//     },
//   },
//   Source: "SENDER_EMAIL_ADDRESS" /* required */,
//   ReplyToAddresses: [
//     "ameenhamza392@gmail.com",
//     /* more items */
//   ],
// };

// // Create the promise and SES service object
// var sendPromise = new SES({ apiVersion: "2010-12-01" })
//   .sendEmail(params)
//   .promise();

// // Handle promise's fulfilled/rejected states
// const awsMailerSender = () => {
//   sendPromise
//     .then(function (data) {
//       console.log(data.MessageId);
//     })
//     .catch(function (err) {
//       console.error(err, err.stack);
//     });
// };
// export default awsMailerSender;
