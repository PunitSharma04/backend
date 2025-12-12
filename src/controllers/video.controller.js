import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { extractPublicId } from "../utils/extractPublicId.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Build filter object
  let filter = { ispublished: true }; // show only published videos

  // If search query exists (title or description)
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // If filtering by user (their channel)
  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  // Fetch data with pagination
  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        totalVideos,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalVideos / limitNumber),
        videos,
      },
      "Videos fetched successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user?._id;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new apiError(400, "title and description are required");
  }
  if (!isValidObjectId(user)) {
    throw new apiError(400, "Invalid user");
  }
  const videoFilePath = req.files?.videofile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath || !thumbnailPath) {
    throw new apiError("Video File and thumbnail are requried");
  }

  const uploadVideo = await uploadOnCloudinary(videoFilePath);
  const uploadThumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!uploadVideo || !uploadThumbnail) {
    throw new apiError(500, "Failed to Upload");
  }

  const newVideo = await Video.create({
    videofile: uploadVideo?.url,
    thumbnail: uploadThumbnail?.url,
    title,
    description,
    duration: uploadVideo?.duration,
    ispublished: true,
    owner: user,
  });
  return res
    .status(200)
    .json(new apiResponse(200, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video");
  }
  const video = await Video.findOne({
    _id: videoId,
  });

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user?._id;

  if (!isValidObjectId(videoId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid Video or User ID");
  }

  const { title, description } = req.body;

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;

  const thumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (thumbnailPath) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);
    updateData.thumbnail = uploadedThumbnail.url;
  }

  const updatedVideo = await Video.findOneAndUpdate(
    { _id: videoId, owner: user },
    { $set: updateData },
    { new: true }
  );

  if (!updatedVideo) {
    throw new apiError(404, "No video found or unauthorized");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "Video updated successfully"));
});

const increaseVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video ID");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } }, // Increase views by 1
    { new: true }
  );

  if (!updatedVideo) {
    throw new apiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "Views updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const user = req.user?._id;
  if (!isValidObjectId(videoId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid Video or user Id");
  }
  const video = await Video.findOne({
    _id: videoId,
    owner: user,
  });
  if (!video) {
    throw new apiError(404, "Video not found");
  }
  // Extract Cloudinary public IDs
  const videoPublicId = extractPublicId(video.videofile);
  const thumbnailPublicId = extractPublicId(video.thumbnail);

  // Delete from Cloudinary
  if (videoPublicId) {
    await deleteFromCloudinary(videoPublicId, "video");
  }

  if (thumbnailPublicId) {
    await deleteFromCloudinary(thumbnailPublicId, "image");
  }

  // Delete from database
  await Video.deleteOne({ _id: videoId });
  return res
    .status(200)
    .json(new apiResponse(200, null, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user?._id;

  if (!isValidObjectId(videoId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid Video or user Id");
  }

  const video = await Video.findOne({
    _id: videoId,
    owner: user,
  });

  if (!video) {
    throw new apiError(404, "Video not found or unauthorized");
  }

  // Toggle publish/unpublish
  video.ispublished = !video.ispublished;

  await video.save(); // IMPORTANT — persists the change

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        video,
        video.ispublished
          ? "Video published successfully"
          : "Video unpublished successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  increaseVideoViews,
};
