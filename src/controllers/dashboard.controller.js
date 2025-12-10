import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelId = req.user._id;

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const totalVideos = await Video.countDocuments({
    owner: channelId,
  });

  const totalVideoViewsAgg = await Video.aggregate([
    {
      $match: {
        owner: channelId,
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  const totalVideoLikesAgg = await Video.aggregate([
    {
      $match: {
        owner: channelId,
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: "$likes",
        },
      },
    },
  ]);

  const totalVideoViews = totalVideoViewsAgg[0]?.totalViews || 0;
  const totalVideoLikes = totalVideoLikesAgg[0]?.totalLikes || 0;

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalSubscribers,
        totalVideos,
        totalVideoLikes,
        totalVideoViews,
      },
      "channel Statistics fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channelId = req.user?._id;

  //  const totalVideos = await Video
  //  .find(
  //     {
  //         owner:channelId
  //     }
  //  )
  //  .sort(
  //     {
  //         createdAt:-1
  //     }
  //  )

  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: channelId,
        ispublished: true,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, totalVideos, "All Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
