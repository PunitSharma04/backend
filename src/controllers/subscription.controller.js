import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const user = req.user?._id;
  if (!isValidObjectId(channelId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid channel or user id");
  }
  const alreadySubscribed = await Subscription.findOne({
    subscriber: user,
    channel: channelId,
  });
  if (alreadySubscribed) {
    await alreadySubscribed.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, null, "Unsubscribed Successfully"));
  }
  const subscribed = await Subscription.create({
    channel: channelId,
    subscriber: user,
  });
  return res
    .status(200)
    .json(new apiResponse(200, subscribed, "Subscribed Successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new apiError(400, "Invalid channel id");
  }
  const subscribers = await Subscription.find({
    channel: channelId,
  }).populate("subscriber", "username email avatar");;
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        subscribers,
        "All subscribers  are fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new apiError(400, "Invalid subscriber ID");
  }
  const subscriberedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username email avatar");;
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        subscriberedChannels,
        "All subscribered  channels are fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
