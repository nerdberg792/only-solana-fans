// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nacl from 'tweetnacl';
import jwt from 'jsonwebtoken';
import { PublicKey } from '@solana/web3.js';

const prisma = new PrismaClient();
const nonceStore = new Map<string, string>();

export const getChallenge = async (req: Request, res: Response) => {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'Wallet address required' });

    // Get or create user in DB
    await prisma.user.upsert({
        where: { walletAddress },
        update: {},
        create: { walletAddress },
    });

    const nonce = Math.random().toString(36).substring(2);
    const message = `Sign this message to log in: ${nonce}`;
    nonceStore.set(walletAddress, nonce);
    res.json({ message });
};

export const verifySignature = async (req: Request, res: Response) => {
    const { walletAddress, signature } = req.body;
    const nonce = nonceStore.get(walletAddress);
    if (!nonce) return res.status(400).json({ error: 'Invalid or expired nonce.' });

    nonceStore.delete(walletAddress); // Nonce can only be used once

    const message = `Sign this message to log in: ${nonce}`;
    const messageBytes = new TextEncoder().encode(message);
    const publicKeyBytes = new PublicKey(walletAddress).toBytes();
    const signatureBytes = new Uint8Array(Object.values(signature));

    const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    if (!isVerified) return res.status(401).json({ error: 'Signature verification failed.' });
    
    const token = jwt.sign({ walletAddress }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.json({ token });
};