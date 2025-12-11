import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid video ID");
  }

  const user = req.user?._id;

  // like : true

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: user,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, null, "Video unliked successfully"));
  }

  // like : false
  else {
    const newLike = await Like.create({ video: videoId, likedBy: user });
    return res
      .status(200)
      .json(new apiResponse(200, newLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid comment ID");
  }
  const user = req.user?._id;

  // like : true

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: user,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, null, "Comment unliked successfully"));
  }

  // like : false
  else {
    const newLike = await Like.create({ comment: commentId, likedBy: user });
    return res
      .status(200)
      .json(new apiResponse(200, newLike, "Comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid tweet ID");
  }
  const user = req.user?._id;

  // like : true

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: user,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new apiResponse(200, null, "Tweet unliked successfully"));
  }

  // like : false
  else {
    const newLike = await Like.create({ tweet: tweetId, likedBy: user });
    return res
      .status(200)
      .json(new apiResponse(200, newLike, "Tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user?._id;
  const likedVideos = await Like.find({
    likedBy: user,
  })
    .select("-comment -tweet")
    .populate("video", "title thumbnail views")
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(
      new apiResponse(200, likedVideos, "Liked Videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
