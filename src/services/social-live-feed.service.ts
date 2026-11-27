const mongoose = require("mongoose");
const SocialLiveFeed = require("../models/social-live-feed.model");

type SocialLiveFeedPayload = {
  _id?: string;
  platform?: string;
  accountId?: string;
};

type StatusError = Error & { statusCode: number };

const validationError = (message: string): StatusError => {
  const error = new Error(message) as StatusError;
  error.statusCode = 400;
  return error;
};

const normalisePayload = (
  payload: SocialLiveFeedPayload,
  current: any = {},
) => {
  const platform = String(payload.platform ?? current.platform ?? "")
    .trim()
    .toLowerCase();
  const accountId = String(payload.accountId ?? current.accountId ?? "").trim();

  if (!["instagram", "youtube"].includes(platform)) {
    throw validationError("platform must be either instagram or youtube.");
  }
  if (!accountId) throw validationError("accountId is required.");

  return { platform, accountId };
};

const ensureValidId = (id: string) => {
  if (!mongoose.isValidObjectId(id))
    throw validationError("Invalid social live feed id.");
};

const create = async (body: SocialLiveFeedPayload) => {
  return SocialLiveFeed.create(normalisePayload(body));
};

const getAll = async () => {
  return SocialLiveFeed.find().sort({ createdAt: -1 });
};

type YouTubeSearchResponse = { items?: unknown[]; nextPageToken?: string };

const getAllYouTubeVideos = async (pageToken?: string) => {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error(
      "YouTube API key is not configured.",
    ) as StatusError;
    error.statusCode = 503;
    throw error;
  }
  const account = await SocialLiveFeed.findOne({ platform: "youtube" }).sort({
    createdAt: -1,
  });
  console.log(account, "acccouuun");
  if (!account?.accountId?.trim()) {
    const error = new Error(
      "No YouTube social feed account ID is configured.",
    ) as StatusError;
    error.statusCode = 404;
    throw error;
  }

  const items: unknown[] = [];
  let nextPageToken = pageToken || undefined;
  // YouTube search permits at most 50 results per request.
  for (let page = 0; page < 2; page++) {
    const params = new URLSearchParams({
      part: "snippet",
      channelId: account.accountId.trim(),
      type: "video",
      order: "date",
      maxResults: "50",
      key: apiKey,
    });
    if (nextPageToken) params.set("pageToken", nextPageToken);
    let response: Response;
    try {
      response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params}`,
        { signal: AbortSignal.timeout(15000) },
      );
    } catch {
      const error = new Error(
        "Unable to reach the YouTube API.",
      ) as StatusError;
      error.statusCode = 502;
      throw error;
    }
    if (!response.ok) {
      const error = new Error(
        "YouTube API request failed. Check the configured channel ID, API key and quota.",
      ) as StatusError;
      error.statusCode = 502;
      throw error;
    }
    let result: YouTubeSearchResponse;
    try {
      result = (await response.json()) as YouTubeSearchResponse;
    } catch {
      const error = new Error(
        "YouTube API returned an invalid response.",
      ) as StatusError;
      error.statusCode = 502;
      throw error;
    }
    if (!Array.isArray(result.items)) {
      const error = new Error(
        "YouTube API returned an invalid response.",
      ) as StatusError;
      error.statusCode = 502;
      throw error;
    }
    items.push(...result.items);
    nextPageToken = result.nextPageToken;
    if (!nextPageToken) break;
  }
  return { items, nextPageToken: nextPageToken || null };
};

const getById = async (id: string) => {
  ensureValidId(id);
  return SocialLiveFeed.findById(id);
};

const update = async (body: SocialLiveFeedPayload) => {
  const { _id, ...updateData } = body;
  if (!_id) throw validationError("_id is required.");
  ensureValidId(_id);

  const socialLiveFeed = await SocialLiveFeed.findById(_id);
  if (!socialLiveFeed) return null;

  return SocialLiveFeed.findByIdAndUpdate(
    _id,
    { $set: normalisePayload(updateData, socialLiveFeed) },
    { new: true, runValidators: true },
  );
};

const remove = async (id: string) => {
  ensureValidId(id);
  return SocialLiveFeed.findByIdAndDelete(id);
};

export = { create, getAll, getAllYouTubeVideos, getById, update, remove };
