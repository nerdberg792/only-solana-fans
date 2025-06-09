# SolanaFans MVP

**SolanaFans** is a proof-of-concept, decentralized creator platform built on the Solana blockchain. This MVP allows creators to monetize their content (images) by setting a price in SOL, which users can pay directly from their wallets to get access.

The project demonstrates a hybrid on-chain/off-chain architecture, using Solana for payments and a traditional web stack for data management and content delivery.

[#LIVE (https://only-solana-fans-zbzp.vercel.app/)](https://only-solana-fans-zbzp.vercel.app/)

## Table of Contents

-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Setup Cloudflare R2 (or S3)](#setup-cloudflare-r2-or-s3)
    -   [Backend Setup](#backend-setup)
    -   [Frontend Setup](#frontend-setup)
-   [Core Concepts](#core-concepts)
    -   [Wallet-Based Authentication](#wallet-based-authentication)
    -   [On-Chain Payment Verification](#on-chain-payment-verification)
-   [Next Steps & Future Improvements](#next-steps--future-improvements)

## Features

-   👤 **Wallet Login**: Securely log in using a Solana wallet (Phantom, Solflare, etc.) via message signing.
-   🖼️ **Content Upload**: Creators can upload images and set a viewing price in SOL.
-   💳 **Solana Payments**: Users can pay for content directly with SOL.
-   🔐 **On-Chain Verification**: The backend verifies each payment transaction on the Solana Devnet before unlocking content.
-   🔍 **User Search**: Find creator profiles by searching for their wallet address.
-   👁️ **Blurred Previews**: All paid content is blurred until a successful payment is made.

## Tech Stack

This project uses a modern, type-safe stack:

-   **Frontend**: [Next.js](https://nextjs.org/) (bootstrapped with `create-solana-dapp`)
    -   **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [daisyUI](https://daisyui.com/)
    -   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
    -   **Solana Integration**: `@solana/wallet-adapter`
-   **Backend**: [Express.js](https://expressjs.com/)
    -   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
    -   **ORM**: [Prisma](https://www.prisma.io/)
-   **File Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible API)
-   **Deployment**: (TBD - e.g., Vercel for Frontend, Railway/Fly.io for Backend)

## Project Structure

The project is a monorepo with two main packages: `frontend` and `backend`.

```
/
├── backend/              # Express.js, Prisma, and all API logic
│   ├── prisma/
│   ├── src/
│   └── ...
└── my-solana-fans/       # Next.js frontend application (rename as needed)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
└── README.md
```

## Getting Started

Follow these steps to get the project running locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [pnpm](https://pnpm.io/installation) (recommended) or npm/yarn
-   [PostgreSQL](https://www.postgresql.org/download/) installed and running
-   A Solana wallet extension (e.g., [Phantom](https://phantom.app/)) set to **Devnet**
-   A [Cloudflare](https://www.cloudflare.com/) account (for R2 storage)

### Setup Cloudflare R2 (or S3)

This project uses Cloudflare R2 for free, S3-compatible file storage.

1.  **Create an R2 Bucket**: In your Cloudflare dashboard, navigate to R2 and create a new bucket.
2.  **Enable Public Access**: In the bucket's settings, enable public access by connecting a custom domain or using the public `r2.dev` URL.
3.  **Create API Token**: Go to "Manage R2 API Tokens", create a new token with "Object Read & Write" permissions.
4.  **Copy Credentials**: Securely copy the **Account ID**, **Access Key ID**, and **Secret Access Key**.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    -   Copy the example environment file: `cp .env.example .env`
    -   Fill in the `backend/.env` file with your credentials:
        ```env
        # PostgreSQL
        DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/solana_fans_mvp?schema=public"

        # JWT Secret for Auth
        JWT_SECRET="generate-a-super-long-random-secret-string"

        # Cloudflare R2 Credentials
        AWS_ACCESS_KEY_ID="YOUR_R2_ACCESS_KEY_ID"
        AWS_SECRET_ACCESS_KEY="YOUR_R2_SECRET_ACCESS_KEY"
        AWS_S3_BUCKET_NAME="YOUR_R2_BUCKET_NAME"
        CLOUDFLARE_ACCOUNT_ID="YOUR_CLOUDFLARE_ACCOUNT_ID"
        ```

4.  **Run database migrations:**
    This command will create the necessary tables in your PostgreSQL database.
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the backend server:**
    ```bash
    pnpm run dev
    ```
    The server will be running on `http://localhost:3001`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd my-solana-fans # or your frontend folder name
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    -   Create a new file: `touch .env.local`
    -   Add the backend API URL to `.env.local`:
        ```env
        NEXT_PUBLIC_API_URL=http://localhost:3001/api
        ```

4.  **Start the frontend development server:**
    ```bash
    pnpm run dev
    ```
    The app will be available at `http://localhost:3000`.

## Core Concepts

### Wallet-Based Authentication

Authentication is handled without traditional passwords.
1.  **Challenge**: The frontend requests a unique, single-use message from the backend.
2.  **Sign**: The user signs this message with their wallet's private key, proving ownership. This does not create a transaction.
3.  **Verify**: The backend verifies the signature against the user's public key.
4.  **Session**: If verification is successful, the backend issues a JSON Web Token (JWT) for traditional session management.

### On-Chain Payment Verification

The backend is the single source of truth for content access.
1.  **Transaction**: The frontend constructs and sends a `SystemProgram.transfer` transaction to the Solana network.
2.  **Signature**: Upon confirmation, the frontend receives a transaction signature.
3.  **Verification**: The frontend sends this signature to a protected backend endpoint.
4.  **Unlock**: The backend fetches the transaction from the Solana Devnet RPC, validates its details (sender, receiver, amount), and if everything matches, creates a `Purchase` record in the database, granting the user access to the content.

## Next Steps & Future Improvements

This MVP provides a solid foundation. Future enhancements could include:
-   [ ] **Production Deployment**: Deploy the frontend to Vercel and the backend/DB to Railway or Fly.io.
-   [ ] **Username/Profile Editing**: Allow users to set a username and profile picture.
-   [ ] **Video Content**: Support for uploading and viewing video content.
-   [ ] **SPL-Token Payments**: Allow payments with other tokens like USDC.
-   [ ] **Subscriptions**: Implement a subscription model using token streams or on-chain programs.
-   [ ] **Decentralized Storage**: Move content storage to a fully decentralized solution like Arweave.
-   [ ] **Program-Owned Vaults**: Use a Solana program with Program-Derived Addresses (PDAs) to act as escrow vaults for payments, enabling more complex logic.
