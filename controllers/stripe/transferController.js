import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
import { errorResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";
import { Payment } from "../../models";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const transferController = {
  //create customers
  async store(req, res, next) {
    let documents;

    const { sender, reciver, currency, amount, subamount } = req.body;
    try {
      if (!sender || !reciver || !currency || !amount || !subamount) {
        res.status(500).json("Please add all requirements");
      }

      const balanceTransaction =
        await stripe.customers.createBalanceTransaction(sender, {
          amount: amount,
          currency: currency,
        });
      let balanceReciver = await stripe.customers.createBalanceTransaction(
        reciver,
        { amount: subamount, currency: currency }
      );
      const updateTransfer = await Payment.findOneAndUpdate(
        { cus_id: sender },
        {
          $push: {
            trnsactions: {
              reciver: balanceReciver,
              sender: balanceTransaction,
            },
          },
        },
        { new: true }
      );
      const updateReciver = await Payment.findOneAndUpdate(
        { cus_id: reciver },
        {
          $push: {
            trnsactions: {
              reciver: balanceReciver,
              sender: balanceTransaction,
            },
          },
        },
        { new: true }
      );
      if (updateTransfer && updateReciver) {
        res.status(200).json({
          reciver: balanceReciver,
          sender: balanceTransaction,
        });
      } else {
        return errorResponse(res, HTTP_STATUS.BAD_GATEWAY, "error in update");
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },

  //get particular customer
  async show(req, res, next) {
    let documents;
    try {
      if (req.params.id) {
        documents = await stripe.customers.retrieve(req.params.id);
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },

  async transfer(req, res, next) {
    const { amount, currency } = req.body;
    const transferPayment = await stripe.transfers.create({
      amount: amount,
      currency: currency,
      destination: req.params.id,
      // transfer_group: "ORDER_95",
    });
    res.status(201).json(transferPayment);
  },
  async update(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.update(req.params.id, {
        balance: req.body.balance,
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
};

export default transferController;
