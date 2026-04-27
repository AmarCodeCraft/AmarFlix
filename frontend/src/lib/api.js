/**
 * AmarFlix API Service Layer
 *
 * Centralizes all communication with the Express backend.
 * In development Vite proxies /api → http://localhost:5000.
 * In production set VITE_API_BASE_URL to the backend origin.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Helper: get auth headers from localStorage.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("amarflix_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Videos ──────────────────────────────────────────────────────────

/**
 * Fetch all videos from the backend.
 * Optionally filter by category via query param.
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Array>} Array of video objects from MongoDB
 */
export const fetchVideos = async (category) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);

  const url = `${BASE_URL}/api/videos${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch videos: ${res.status}`);
  }

  const json = await res.json();
  return json.data || [];
};

/**
 * Fetch a single video by its MongoDB _id.
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object>} The video document
 */
export const fetchVideoById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/videos/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch video ${id}: ${res.status}`);
  }

  const json = await res.json();
  return json.data || null;
};

// ─── Add Video (Admin) ──────────────────────────────────────────────

/**
 * Create a new video entry in the database.
 * @param {Object} videoData - { title, thumbnail, videoUrl, category, description? }
 * @returns {Promise<Object>} The created video document
 */
export const addVideo = async (videoData) => {
  const res = await fetch(`${BASE_URL}/api/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(videoData),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to add video: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
};

// ─── Delete Video (Admin) ───────────────────────────────────────────

/**
 * Delete a video by its MongoDB _id.
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object>} The deleted video document
 */
export const deleteVideo = async (id) => {
  const res = await fetch(`${BASE_URL}/api/videos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to delete video: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
};

// ─── Upload Video (Admin) ───────────────────────────────────────────

/**
 * Upload a video file to Cloudinary via the backend.
 * Returns a Promise that resolves with upload data including videoUrl.
 * @param {File} file - The video file
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} { videoUrl, duration, publicId }
 */
export const uploadVideo = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/upload`);

    // Set auth header
    const token = localStorage.getItem("amarflix_token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid JSON response from server"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || "Failed to upload video"));
        } catch {
          reject(new Error("Failed to upload video"));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
};

// ─── My List ────────────────────────────────────────────────────────

export const getMyList = async () => {
  const res = await fetch(`${BASE_URL}/api/user/my-list`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch My List");
  const json = await res.json();
  return json.data || [];
};

export const addToMyList = async (videoId) => {
  const res = await fetch(`${BASE_URL}/api/user/my-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ videoId }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to add to My List");
  const json = await res.json();
  return json.data;
};

export const removeFromMyList = async (videoId) => {
  const res = await fetch(`${BASE_URL}/api/user/my-list/${videoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to remove from My List");
  const json = await res.json();
  return json.data;
};

// ─── Watch History ──────────────────────────────────────────────────

export const updateWatchProgress = async (videoId, progress, duration) => {
  const res = await fetch(`${BASE_URL}/api/user/history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ videoId, progress, duration }),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to update watch progress");
};

export const getWatchHistory = async () => {
  const res = await fetch(`${BASE_URL}/api/user/history`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch watch history");
  const json = await res.json();
  return json.data || [];
};

export const getVideoProgress = async (videoId) => {
  const res = await fetch(`${BASE_URL}/api/user/history/${videoId}`, {
    headers: getAuthHeaders(),
    credentials: "include",
  });

  if (!res.ok) return { progress: 0, duration: 0 };
  const json = await res.json();
  return json.data || { progress: 0, duration: 0 };
};
