const validateAndConvertImageToBase64 = async (file, allowedTypes, maxSize) => {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Only image formats: allowed formats: ${allowedTypes.join(", ")}  are accepted.`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds the limit of ${maxSize / (1024 * 1024)} MB.`);
  }

  // Convert file to base64 using FileReader in a Promise
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject("Cannot read file.");
      reader.readAsDataURL(file);
    });

  return await toBase64(file);
};
export const uploadFile = async (file, allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"], maxSize = 3 * 1024 * 1024) => {
  try {
    const base64Image = await validateAndConvertImageToBase64(file, allowedTypes, maxSize);
    return base64Image;
  } catch (error) {
    throw error; // Throw error to be handled by the caller
  }
};
