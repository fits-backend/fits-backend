import { Message, Personal, Room } from "../models";
import { HTTP_STATUS, ROLE_TYPES } from "../utils/constants";
import { errorResponse, successResponse } from "../utils/response";
import mongoose from "mongoose";

const messageController = {
  // Get all messages using room id
  async index(req, res, next) {
    try {
      const messages = await Message.find({
        roomId: req.params.roomId,
      }).select("-updatedAt -__v");

      if (messages.length == 0) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "messages not found",
          null
        );
      }

      return successResponse(
        res,
        next,
        { messages },
        HTTP_STATUS.OK,
        "messages found"
      );
    } catch (err) {
      return next(err);
    }
  },

  // create room by sending message first time
  async createRoom(req, res, next) {
    const { message, rid, sname } = req.body;
    try {
      const room = await Room.findOne({
        $and: [{ senderId: req.user._id }, { receiverId: rid }],
      });
      const sender = await Personal.findOne({
        user: req.user._id,
      });
      const receiver = await Personal.findOne({
        user: rid,
      });
      if (!sender || !receiver) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "sender and receiver has no personal account",
          null
        );
      }
      console.log(sender, receiver);
      let roomId = "";
      let newRoom;
      if (!room) {
        newRoom = await new Room({
          senderId: req.user._id,
          receiverId: rid,
          lastMessage: message,
          receiverName: receiver.name,
          senderName: sender.name,
          status: "unread",
          click: false,
        }).save();
        roomId = newRoom._id;

        await new Message({
          roomId: roomId,
          senderId: req.user._id,
          receiverId: rid,
          message: message,
          receiverName: receiver.name,
          senderName: sender.name,
          status: "unread",
          click: false,
        }).save();
        console.log("=================================");
        console.log(newRoom);
        console.log("=================================");
      } else {
        console.log("ab room mil gaya hai us ko");
        roomId = room._id;
        await new Message({
          roomId: roomId,
          senderId: req.user._id,
          receiverId: rid,
          message: message,
          status: "unread",
          receiverName: receiver.name,
          senderName: sender.name,
        }).save();

        await Room.findByIdAndUpdate(
          { _id: roomId },
          {
            lastMessage: message,
          },
          { new: true }
        );
      }

      return successResponse(
        res,
        next,
        null,
        HTTP_STATUS.CREATED,
        "Message sent successfully.."
      );
    } catch (err) {
      return next(err);
    }
  },

  // get all my rooms
  async getAllMyRooms(req, res, next) {
    let room;
    let operator = {};
    let condition = req.user.role === ROLE_TYPES.TRAINEE && !req.body.all_rooms;
    let queryCondition = [
      { senderId: mongoose.Types.ObjectId(req.user._id) },
      {
        receiverId: mongoose.Types.ObjectId(
          condition ? req.body.trainerId : req.user._id
        ),
      },
    ];
    try {
      if (condition) {
        operator = {
          $and: queryCondition,
        };
      } else {
        operator = {
          $or: queryCondition,
        };
      }

      room = await Room.aggregate([
        {
          $match: operator,
        },
        {
          $lookup: {
            from: "users",
            as: "sender",
            let: { sender_id: "$senderId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$_id", "$$sender_id"] }],
                  },
                },
              },
              {
                $lookup: {
                  from: "personals",
                  as: "personal",
                  localField: "personal",
                  foreignField: "_id",
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        profileImage: 1,
                      },
                    },
                  ],
                },
              },

              { $unwind: "$personal" },
              {
                $project: {
                  isVerified: 0,
                  password: 0,
                  emailVerified: 0,
                  reset_password: 0,
                  trainerVerified: 0,
                  accountVerified: 0,
                  numReviews: 0,
                  averageRating: 0,
                  createdAt: 0,
                  updatedAt: 0,
                  __v: 0,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            as: "receiver",
            let: { receiver_id: "$receiverId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$_id", "$$receiver_id"] }],
                  },
                },
              },
              {
                $lookup: {
                  from: "personals",
                  as: "personal",
                  localField: "personal",
                  foreignField: "_id",
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        profileImage: 1,
                      },
                    },
                  ],
                },
              },
              { $unwind: "$personal" },
              {
                $project: {
                  isVerified: 0,
                  password: 0,
                  emailVerified: 0,
                  reset_password: 0,
                  trainerVerified: 0,
                  accountVerified: 0,
                  numReviews: 0,
                  averageRating: 0,
                  createdAt: 0,
                  updatedAt: 0,
                  __v: 0,
                },
              },
            ],
          },
        },
        { $unwind: "$sender" },
        { $unwind: "$receiver" },
        {
          $project: {
            click: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      ]).sort({
        createdAt: -1,
      });

      if (room.length == 0) {
        return errorResponse(
          res,
          HTTP_STATUS.NOT_FOUND,
          "rooms not found",
          null
        );
      }
      return successResponse(
        res,
        next,
        { rooms: room },
        HTTP_STATUS.OK,
        "rooms found"
      );
    } catch (err) {
      return next(err);
    }
  },

  // send messages
  async sendMessage(req, res, next) {
    const { roomId, rid, sname, mes } = req.body;

    const user = await Personal.findOne({
      user: rid,
    });
    try {
      await new Message({
        roomId,
        senderId: req.user._id,
        receiverId: rid,
        message: mes,
        senderName: sname,
        receiverName: user.name,
        status: "unread",
      }).save();
      await Room.findByIdAndUpdate(
        { _id: roomId },
        {
          lastMessage: mes,
        }
      );
      return successResponse(
        res,
        next,
        null,
        HTTP_STATUS.CREATED,
        "Message sent successfully.."
      );
    } catch (err) {
      return next(err);
    }
  },
};

export default messageController;
