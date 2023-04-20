import { STRIPE_SECRET_KEY } from "../../config";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const bankController = {
  //create customers card
  async store(req, res, next) {
    try {
      await stripe.balance.retrieve(function (err, balance) {
        console.log("first", balance);
      });
      const transferApi = await stripe.transfers.create({
        amount: 1000,
        currency: "eur",
        destination: "acct_1LQCyxBF3fI9HZXw",
      });
      console.log("transfer", transferApi);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: 1000,
      //   currency: "eur",
      //   transfer_group: "{ORDER10}",
      // });
      // console.log("object...", paymentIntent);
      const account = await stripe.accounts.retrieve("acct_1Ke1KTHjHBX7BsTL");
      console.log("account", account);
      // Create a Transfer to the connected account (later):
      let transferAmount = await stripe.transfers.create({
        amount: 1000,
        currency: "eur",
        destination: "acct_1Ke2SXBQCIvi9wib",
        transfer_group: "{ORDER10}",
      });
      console.log("first", transferAmount);
      const payout = await stripe.payouts.create({
        amount: 1,
        currency: "eur",
      });

      console.log("first....", payout);

      const transfer = await stripe.transfers.create({
        amount: 1,
        currency: "eur",
        destination: "acct_1Ke2SXBQCIvi9wib",
        // transfer_group: "ORDER_95",
      });
      console.log("first....", transfer);
    } catch (error) {
      return next(error);
    }
  },
  // async store(req, res, next) {
  //   const {
  //     routing_number,
  //     account_number,
  //     account_holder_name,
  //     currency,
  //     country,
  //     account_holder_type,
  //   } = req.body;

  //   try {
  //     if (
  //       !routing_number ||
  //       !account_number ||
  //       !account_holder_name ||
  //       !currency ||
  //       !country ||
  //       !account_holder_type
  //     ) {
  //       console.log("first");
  //       const { error } = cardSchema.validate(req.body);
  //       res.status(500).json(error);
  //     }
  //     let bankAccount;
  //     const token = await stripe.tokens
  //       .create({
  //         bank_account: {
  //           country: country,
  //           currency: currency,
  //           account_holder_name: account_holder_name,
  //           account_holder_type: account_holder_type,
  //           routing_number: routing_number,
  //           account_number: account_number,
  //         },
  //       })
  //       .then(async (res) => {
  //         console.log("first..", res);
  //         bankAccount = await stripe.customers.createSource(
  //           "cus_M86jK71wBgtM2H",
  //           { source: res.id }
  //         );
  //         console.log("first..", bankAccount);
  //       });
  //     console.log("first...", token);
  //     return res.status(201).json({
  //       message: "create bank account",
  //       statusCode: 201,
  //       success: true,
  //       data: token,
  //     });
  //   } catch (err) {
  //     return res.status(500).json({
  //       message: err.message,
  //       statusCode: 500,
  //       success: false,
  //       data: null,
  //       stack: err.stack,
  //     });
  //   }
  // },
  async show(req, res, next) {
    const { bankAccount_id } = req.body;

    try {
      if (!bankAccount_id) {
        console.log("first");
        const { error } = cardSchema.validate(req.body);
        res.status(500).json(error);
      }
      const bankAccount = await stripe.customers.createSource(
        req.params.cus_id,
        bankAccount_id
      );
      console.log("first...", bankAccount);
      return res.status(201).json({
        message: "create bank account",
        statusCode: 201,
        success: true,
        data: bankAccount,
      });
    } catch (err) {
      return res.status(500).json({
        message: err.message,
        statusCode: 500,
        success: false,
        data: null,
        stack: err.stack,
      });
    }
  },
};

export default bankController;
