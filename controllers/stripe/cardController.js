import { Payment, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { STRIPE_SECRET_KEY } from "../../config";
import { errorResponse, successResponse } from "../../utils/response";
import { HTTP_STATUS } from "../../utils/constants";
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const cardController = {
  //create customers card
  async store(req, res, next) {
    const { card_number, exp_month, exp_year, cvc } = req.body;
    let documents, isExist;
    let updateCustomer;
    let tok_card;
    try {
      if (!card_number || !exp_month || !exp_year || !cvc) {
        const { error } = cardSchema.validate(req.body);
        res.status(500).json(error);
      }
      await stripe.tokens
        .create({
          card: {
            number: parseInt(card_number),
            exp_month: parseInt(exp_month),
            exp_year: parseInt(exp_year),
            cvc: parseInt(cvc),
          },
        })
        .then(async (response) => {
          tok_card = response.id;
          documents = await stripe.customers.createSource(req.params.id, {
            source: response.id,
          });

          updateCustomer = await Payment.updateOne(
            { cus_id: req.params.id },
            {
              card_id: documents.id,
              tok_card,
            },
            { new: true }
          );
          const updateUser = await User.findByIdAndUpdate(
            { _id: req.user._id },
            { cardCreated: true }
          );
          if (updateCustomer && updateUser) {
            console.log("doc>>0", documents);
            return successResponse(
              res,
              next,
              documents,
              HTTP_STATUS.OK,
              "card created successfully..."
            );
          } else {
            console.log("doc>>0");
            return errorResponse(
              res,
              HTTP_STATUS.FORBIDDEN,
              null,
              "database does't updated"
            );
          }
        });
    } catch (err) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, err.message);
    }
  },
  //get all customers cards
  //   async index(req, res, next) {
  //     let documents;
  //     console.log("admin controller");
  //     try {
  //       documents = await stripe.customers.list({});
  //     } catch (err) {
  //       return next(CustomErrorHandler.serverError());
  //     }
  //     console.log("users", documents);
  //     res.status(201).json(documents);
  //   },
  //get particular customer card
  async show(req, res, next) {
    let documents;

    try {
      console.log("coming");
      if (req.params.id && req.body.card_id) {
        console.log("first");
        documents = await stripe.customers.retrieveSource(
          req.params.id,
          req.body.card_id
        );
      } else {
        return next(CustomErrorHandler.emptyState());
      }
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    return successResponse(
      res,
      next,
      documents,
      HTTP_STATUS.CREATED,
      "customer card get successfully"
    );
  },
  //update card data
  async update(req, res, next) {
    //card not update because we are not live mode
    let documents;
    const { card_id, address_city } = req.body;
    try {
      documents = await stripe.customers.updateSource(req.params.id, card_id, {
        address_city: address_city,
      });
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
  //delete card
  async destroy(req, res, next) {
    let documents;
    try {
      documents = await stripe.customers.del(req.params.id);
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(201).json(documents);
  },
};

export default cardController;
