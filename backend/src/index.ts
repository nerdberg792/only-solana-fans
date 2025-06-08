// backend/src/index.ts
import express , {Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Route Imports
import { getChallenge, verifySignature } from './controllers/authController';
import { getProfile } from './controllers/userController';
import { getSignedUrlForUpload, createPost, verifyPurchase } from './controllers/postController';
import { authMiddleware } from './middleware/authMiddleware';

const app:Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---
//@ts-ignore
// Health Check
app.get('/api/health', (req, res) => res.send('Backend is healthy!'));

// Auth
//@ts-ignore
app.post('/api/auth/challenge', getChallenge);
//@ts-ignore
app.post('/api/auth/verify', verifySignature);

// Users
//@ts-ignore
app.get('/api/users/:walletAddress/profile', getProfile);

// Posts
//@ts-ignore
app.post('/api/posts/signed-url', authMiddleware, getSignedUrlForUpload);
//@ts-ignore
app.post('/api/posts', authMiddleware, createPost);
//@ts-ignore
app.post('/api/posts/verify-purchase', authMiddleware, verifyPurchase);

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));