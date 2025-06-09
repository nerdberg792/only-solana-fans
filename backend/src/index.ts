// backend/src/index.ts
import express , {Application} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Route Imports
import { getChallenge, verifySignature } from './controllers/authController';
// ---> 1. IMPORT THE NEW CONTROLLERS
import { getProfile, checkUsername, updateProfile } from './controllers/userController';
import { getSignedUrlForUpload, createPost, verifyPurchase, deletePost } from './controllers/postController';
import { authMiddleware } from './middleware/authMiddleware';

const app:Application = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health Check
//@ts-ignore
app.get('/api/health', (req, res) => res.send('Backend is healthy!'));

// Auth
//@ts-ignore
app.post('/api/auth/challenge', getChallenge);
//@ts-ignore
app.post('/api/auth/verify', verifySignature);

// Users
// ---> 2. ADD ROUTE TO CHECK USERNAME AVAILABILITY
//@ts-ignore
app.get('/api/users/check-username', checkUsername);

// ---> 3. ADD ROUTE TO UPDATE A USER'S PROFILE (PROTECTED)
//@ts-ignore
app.put('/api/users/profile', authMiddleware, updateProfile);

// ---> 4. CHANGE :walletAddress to :id TO SEARCH BY BOTH
//@ts-ignore
app.get('/api/users/:id/profile', getProfile);

// Posts (No changes needed here, the description is handled by the createPost controller)
//@ts-ignore
app.post('/api/posts/signed-url', authMiddleware, getSignedUrlForUpload);
//@ts-ignore
app.post('/api/posts', authMiddleware, createPost);
//@ts-ignore
app.post('/api/posts/verify-purchase', authMiddleware, verifyPurchase);
//@ts-ignore
app.delete('/api/:id', authMiddleware , deletePost)

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));