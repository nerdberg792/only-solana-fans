# only-solana-fans


frontend/
├── public/
│   └── favicon.ico
└── src/
    ├── app/  <-- ROUTING LIVES HERE (Next.js App Router)
    │   ├── layout.tsx         // Root layout (providers, header, footer)
    │   ├── page.tsx           // Your homepage
    │   ├── profile/
    │   │   └── [id]/
    │   │       └── page.tsx   // The dynamic profile page
    │   └── upload/
    │       └── page.tsx       // The protected upload page
    │
    ├── components/ <-- ALL REUSABLE COMPONENTS
    │   ├── ui/                // Generic, "dumb" components (buttons, modals, etc.)
    │   │   ├── Spinner.tsx
    │   │   └── ...
    │   ├── layout/            // Major layout pieces
    │   │   ├── AppBar.tsx
    │   │   └── Footer.tsx
    │   └── features/          // Complex components tied to a specific feature
    │       ├── CreatorSetupForm.tsx
    │       └── PostCard.tsx
    │
    ├── lib/ <-- "LIBRARY" CODE & HELPERS
    │   ├── api.ts             // Your pre-configured Axios instance
    │   └── utils.ts           // Helper functions (e.g., debounce, formatWallet)
    │
    ├── hooks/ <-- CUSTOM REACT HOOKS
    │   └── useDebounce.ts     // Example: a hook for username checking
    │
    ├── stores/ <-- GLOBAL STATE MANAGEMENT
    │   └── useAuthStore.ts    // Your Zustand store for auth
    │
    ├── styles/
    │   └── globals.css
    │
    └── types/ <-- TYPESCRIPT TYPE DEFINITIONS
        └── index.ts           // Define your `User`, `Post`, `Purchase` types here


        Runtime Error


http://localhost:3000/

https://52hv1tvm-3000.inc1.devtunnels.ms/



https://52hv1tvm-3001.inc1.devtunnels.ms/