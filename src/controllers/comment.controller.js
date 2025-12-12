import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req, res) => {
  // TODO: get all comments for a video
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Video Id");
  }

  // pagination
  const { page = 1, limit = 10 } = req.query;

  // convert string → number
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const allComments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 }) // latest first
    .skip((pageNumber - 1) * limitNumber) // skip previous pages
    .limit(limitNumber); // limit results per page

  const totalComments = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new apiResponse(
      200,
      {
        comments: allComments,
        page: pageNumber,
        limit: limitNumber,
        totalComments,
        totalPages: Math.ceil(totalComments / limitNumber),
      },
      "Comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const user = req.user?._id;
  if (!isValidObjectId(videoId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid Video or User ID");
  }
  const { content } = req.body;
  if (!content) {
    throw new apiError(404, "Content is required");
  }
  const addedComment = await Comment.create({
    content,
    video: videoId,
    owner: user,
  });
  //upsert: true => use findOneAndUpdate and this upsert Creates a new comment if it doesn't exist.

  if (!addedComment) {
    throw new apiError(404, "No Video Found or Unauthorized");
  }

  return res
    .status(200)
    .json(new apiResponse(200, addedComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const user = req.user?._id;
  if (!isValidObjectId(commentId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid Video or User ID");
  }
  const { content } = req.body;
  if (!content) {
    throw new apiError(404, "Content is required");
  }
  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
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

  if (!updatedComment) {
    throw new apiError(404, "No Comment Found or Unauthorized");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const user = req.user?._id;
  if (!isValidObjectId(commentId) || !isValidObjectId(user)) {
    throw new apiError(400, "Invalid Video or User ID");
  }

  const deleted = await Comment.findOneAndDelete({
    _id: commentId,
    owner: user,
  });
  if (!deleted) {
    throw new apiError(404, "No Comment Found or Unauthorized");
  }

  return res
    .status(200)
    .json(new apiResponse(200, null, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
