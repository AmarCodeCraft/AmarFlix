export const isNonEmptyString = (value) => {
  return typeof value === "string" && value.trim().length > 0;
};

export const validateVideoPayload = (payload) => {
  const errors = [];

  if (!isNonEmptyString(payload.title)) {
    errors.push("title is required and must be a non-empty string.");
  }

  if (!isNonEmptyString(payload.thumbnail)) {
    errors.push("thumbnail is required and must be a non-empty string.");
  }

  if (!isNonEmptyString(payload.videoUrl)) {
    errors.push("videoUrl is required and must be a non-empty string.");
  }

  if (!isNonEmptyString(payload.category)) {
    errors.push("category is required and must be a non-empty string.");
  }

  if (
    payload.description !== undefined &&
    typeof payload.description !== "string"
  ) {
    errors.push("description must be a string.");
  }

  return errors;
};
