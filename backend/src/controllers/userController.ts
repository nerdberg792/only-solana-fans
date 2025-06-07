// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
    const { walletAddress } = req.params;
    const viewerWallet = req.query.viewerWallet as string | undefined;

    const user = await prisma.user.findUnique({
        where: { walletAddress },
        include: { posts: { orderBy: { createdAt: 'desc' } } },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check purchase status for each post
    const postsWithPurchaseStatus = await Promise.all(
        user.posts.map(async (post) => {
            const isPurchased = viewerWallet
                ? !!(await prisma.purchase.findUnique({
                      where: {
                          buyerWalletAddress_postId: {
                              buyerWalletAddress: viewerWallet,
                              postId: post.id,
                          },
                      },
                  }))
                : false;
            return { ...post, isPurchased };
        })
    );
    
    res.json({ ...user, posts: postsWithPurchaseStatus });
};