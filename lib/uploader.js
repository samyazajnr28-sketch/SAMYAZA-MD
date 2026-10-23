import { uploadToUguu } from './uploaders.js';

export const UploadFileUgu = uploadToUguu;
export const TelegraPh = async filePath => (await uploadToUguu(filePath)).url;
