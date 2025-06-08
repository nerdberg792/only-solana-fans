import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Best Practice: "Fail-fast" if a critical environment variable is missing.
if (!process.env.R2_PUBLIC_URL) {
    throw new Error("FATAL ERROR: R2_PUBLIC_URL environment variable is not set.");
}

const R2_ENDPOINT = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const s3Client = new S3Client({
    endpoint: R2_ENDPOINT,
    region: "auto",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const generateUploadUrl = async (fileType: string) => {
    const fileExtension = fileType.split('/')[1] || 'jpg';
    const key = `uploads/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key, ContentType: fileType });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    
    // Construct the public URL using the environment variable. Clean and correct.
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    
    return { signedUrl, publicUrl };
};