const { Storage } = require('@google-cloud/storage');
const path = require('path');
require('dotenv').config();

// Create GCS client
const storageOptions = {
  projectId: process.env.GCS_PROJECT_ID,
};

// Use keyFilename if GOOGLE_APPLICATION_CREDENTIALS is set in .env
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  storageOptions.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
}

const storage = new Storage(storageOptions);

const bucketName = process.env.GCS_BUCKET || 'bestbill-logos';
const bucket = storage.bucket(bucketName);

/**
 * Uploads a file to Google Cloud Storage and returns the public URL.
 * @param {Object} file - The file object from Multer (memoryStorage)
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject('No file provided');
    }

    const gcsFileName = `logos/${Date.now()}-${path.basename(file.originalname)}`;
    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', async () => {
      // The public URL can be used to directly access the file if the bucket is public
      // or if we make the file public here.
      try {
        // If the bucket is not public by default, uncomment the line below:
        // await blob.makePublic();
        
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    blobStream.end(file.buffer);
  });
};

/**
 * Deletes a file from Google Cloud Storage.
 * @param {string} fileUrl - The public URL of the file to delete
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes(bucketName)) return;

  try {
    // Extract file path from URL (e.g. logos/123456789-logo.png)
    const filePath = fileUrl.split(`${bucketName}/`)[1];
    if (filePath) {
      await bucket.file(filePath).delete();
      console.log(`GCS File Deleted: ${filePath}`);
    }
  } catch (err) {
    console.error('GCS Delete Error:', err);
    // Continue even if delete fails (e.g. file already gone)
  }
};

module.exports = {
  uploadFile,
  deleteFile
};
