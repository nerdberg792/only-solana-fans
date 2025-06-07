// backend/src/controllers/postController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateUploadUrl } from '../services/r2';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

const prisma = new PrismaClient();

// Get Presigned URL for upload
export const getSignedUrlForUpload = async (req: Request, res: Response) => {
    const fileType = req.query.fileType as string;
    if (!fileType?.startsWith('image/')) return res.status(400).json({ error: 'Invalid file type.' });
    try {
        const { signedUrl, publicUrl } = await generateUploadUrl(fileType);
        res.json({ signedUrl, publicUrl });
    } catch (error) { res.status(500).json({ error: 'Could not generate upload URL.' }); }
};

// Create post record after upload
export const createPost = async (req: Request, res: Response) => {
    const creatorWallet = req.user!.walletAddress;
    const { imageUrl, description, price } = req.body;

    if (!imageUrl || !price) return res.status(400).json({ error: 'Missing required fields' });

    const newPost = await prisma.post.create({
        data: { creatorWallet, imageUrl, description, price: parseFloat(price) },
    });
    res.status(201).json(newPost);
};

// Verify Solana transaction and unlock content
export const verifyPurchase = async (req: Request, res: Response) => {
    const buyerWallet = req.user!.walletAddress;
    const { transactionSignature, postId } = req.body;

    try {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const tx = await connection.getTransaction(transactionSignature, { maxSupportedTransactionVersion: 0 });
        if (!tx || !tx.meta) return res.status(404).json({ error: 'Transaction not found on-chain.' });
        
        // Basic Verification (a more robust solution would check instructions)
        const accountKeys = tx.transaction.message.staticAccountKeys.map(k => k.toBase58());
        const sentAmount = (tx.meta.preBalances[0] - tx.meta.postBalances[0]) / LAMPORTS_PER_SOL;

        if (accountKeys[0] !== buyerWallet || accountKeys.indexOf(post.creatorWallet) === -1) {
            return res.status(400).json({ error: 'Invalid transaction parties.' });
        }
        if (Math.abs(sentAmount - Number(post.price)) > 0.0001) {
            return res.status(400).json({ error: 'Incorrect amount transferred.' });
        }
        
        const purchase = await prisma.purchase.create({
            data: { buyerWalletAddress: buyerWallet, postId, transactionSignature },
        });

        res.status(201).json({ success: true, purchase });
    } catch (error : any  ) {
        console.error(error);
        if (error.code === 'P2002') return res.status(409).json({ error: 'This item has already been purchased.' });
        res.status(500).json({ error: 'Transaction verification failed.' });
    }
};