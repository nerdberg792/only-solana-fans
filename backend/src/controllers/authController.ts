// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nacl from 'tweetnacl';
import jwt from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';

const prisma = new PrismaClient();
// In a real app, use Redis or a DB for nonces to prevent replay attacks across server restarts.
const nonceStore = new Map<string, string>();

// GET or CREATE a user and return a challenge message
export const getChallenge = async (req: Request, res: Response) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }

    try {
        // Find or create the user in the database
        await prisma.user.upsert({
            where: { walletAddress },
            update: {},
            create: { walletAddress },
        });

        const nonce = Math.random().toString(36).substring(2, 15);
        const message = `Welcome to SolanaFans! Please sign this message to log in. Nonce: ${nonce}`;
        
        // Store the nonce for this user to verify it later
        nonceStore.set(walletAddress, message);

        res.json({ message });
    } catch (error) {
        console.error("Challenge error:", error);
        res.status(500).json({ error: "Failed to generate challenge." });
    }
};

// Verify the signature and issue a JWT
export const verifySignature = async (req: Request, res: Response) => {
    const { walletAddress, signature } = req.body;

    const originalMessage = nonceStore.get(walletAddress);

    if (!originalMessage) {
        return res.status(400).json({ error: 'Invalid or expired login challenge. Please try again.' });
    }

    // A nonce should only be used once. Delete it after use.
    nonceStore.delete(walletAddress);

    try {
        const messageBytes = new TextEncoder().encode(originalMessage);
        const publicKeyBytes = new PublicKey(walletAddress).toBytes();
        // The signature comes from the frontend as an object, so we convert it to a Uint8Array
        const signatureBytes = new Uint8Array(Object.values(signature));

        const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

        if (!isVerified) {
            return res.status(401).json({ error: 'Signature verification failed.' });
        }

        // Signature is valid, create a JWT
        const token = jwt.sign(
            { walletAddress: walletAddress },
            process.env.JWT_SECRET!, // Ensure JWT_SECRET is in your .env file
            { expiresIn: '1d' } // Token is valid for 1 day
        );

        res.json({ token });

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "Failed to verify signature." });
    }
};