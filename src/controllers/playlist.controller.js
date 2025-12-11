import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  if (!name || !description) {
    throw new apiError(400, "name and description are required");
  }

  const user = req.user?._id;

  await Playlist.create({
    name: name,
    description: description,
    owner: user,
  });

  return res
    .status(200)
    .json(new apiResponse(200, `${name} playlist created successfully`));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid user ID");
  }
  const userPlaylist = await Playlist.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  if (!userPlaylist) {
    throw new apiError(404, "Playlist not found or you do not have access");
  }

  return res
    .status(200)
    .json(new apiResponse(200, userPlaylist, "playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid playlist ID");
  }
  const user = req.user?._id;

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: user,
  }).populate("videos", "thumbnail title views duration");

  if (!playlist) {
    throw new apiError(404, "Playlist not found or you do not have access");
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // add video to playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid playlist or video ID");
  }
  const user = req.user?._id;
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: user,
    },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new apiError(404, "Playlist not found or you do not have access");
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedPlaylist,
        "video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid playlist or video ID");
  }
  const user = req.user?._id;
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: user,
    },
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new apiError(404, "Playlist not found or you do not have access");
  }
  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedPlaylist,
        "video removed from playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid playlist ID");
  }
  const user = req.user?._id;
  const removePlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: user,
  });
  if (!removePlaylist) {
    throw new apiError(404, "Playlist not found or you do not have access");
  }
  return res
    .status(200)
    .json(new apiResponse(200, null, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid playlist ID");
  }
  if (!name || !description) {
    throw new apiError(400, "name and description are required");
  }
  const user = req.user?._id;
  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: user,
    },
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new apiError(404, "Playlist not found or you do not have access");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, "playlist updated  successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
