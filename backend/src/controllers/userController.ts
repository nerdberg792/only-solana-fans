// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---> NEW FUNCTION: Check if a username is available <---
export const checkUsername = async (req: Request, res: Response) => {
    const { username } = req.query;
    if (typeof username !== 'string' || username.length < 3) {
        return res.status(400).json({ error: 'Invalid username. Must be at least 3 characters.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (user) {
            return res.status(409).json({ error: 'Username is taken' });
        }
        res.status(200).json({ message: 'Username is available' });
    } catch (error) {
        res.status(500).json({ error: 'Error checking username.' });
    }
};

// ---> NEW FUNCTION: Update a user's profile after setup <---
export const updateProfile = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;
    const { username, bio, profileImage } = req.body;

    // Basic validation
    if (username && (typeof username !== 'string' || username.length < 3)) {
        return res.status(400).json({ error: 'Username must be at least 3 characters.' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { walletAddress },
            data: {
                // Only update fields that are provided
                username: username || undefined,
                bio: bio || undefined,
                profileImage: profileImage || undefined,
            },
        });
        res.status(200).json(updatedUser);
    } catch (error: any) {
        // Handle the case where the username is already taken by someone else (race condition)
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
            return res.status(409).json({ error: 'This username has just been taken.' });
        }
        console.error("Profile update error:", error);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
};

// ---> MODIFIED FUNCTION: Find a profile by username OR wallet address <---
export const getProfile = async (req: Request, res: Response) => {
    const { id } = req.params; // The 'id' can be a username or a wallet address
    const viewerWallet = req.query.viewerWallet as string | undefined;

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { walletAddress: id },
                    { username: id }
                ]
            },
            include: { 
                posts: { 
                    orderBy: { createdAt: 'desc' } 
                } 
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

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

                // Only include imageUrl if the post is purchased by the viewer
                // or if the viewer is the creator of the post
                const isCreator = viewerWallet === post.creatorWallet;
                const shouldIncludeImage = isPurchased || isCreator;

                return {
                    id: post.id,
                    description: post.description,
                    price: post.price,
                    creatorWallet: post.creatorWallet,
                    createdAt: post.createdAt,
                    isPurchased,
                    ...(shouldIncludeImage && { imageUrl: post.imageUrl })
                };
            })
        );
        
        res.json({ ...user, posts: postsWithPurchaseStatus });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: 'Could not fetch profile.' });
    }
};