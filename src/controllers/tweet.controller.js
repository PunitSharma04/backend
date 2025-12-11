import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new apiError(400, "Tweet content is required");
  }
  const user = req.user?._id;
  const tweet = await Tweet.create({
    content: content,
    owner: user,
  });
  return res
    .status(200)
    .json(new apiResponse(200, tweet, "Tweet is created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = req.user?._id;
  const tweets = await Tweet.find({
    owner: user,
  }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new apiResponse(200, tweets, "Tweet is fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  const user = req.user?._id;
  if (!isValidObjectId(tweetId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid tweet or user Id");
  }
  const updatedTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: user,
    },
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedTweet) {
    throw new apiError(404, "Tweet not found or you do not have access");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedTweet, "Tweet is updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const user = req.user?._id;
  if (!isValidObjectId(tweetId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid tweet or user Id");
  }
  const deleted = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: user,
  });
  if (!deleted) throw new apiError(404, "Tweet not found or not authorized");
  return res
    .status(200)
    .json(new apiResponse(200, null, "Tweet is deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
