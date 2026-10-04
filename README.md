# Campaign Management System with Social Media Integrations

A comprehensive influencer marketing campaign management system with social media platform integrations for TikTok, Twitter/X, Facebook, and Instagram.

## Features

- **Campaign Management**: Create, track, and manage influencer marketing campaigns
- **Creator Management**: Maintain a roster of content creators with platform profiles
- **Deliverable Tracking**: Monitor content assignments through workflow stages
- **Performance Analytics**: Track metrics, engagement rates, and campaign KPIs
- **Social Media Integrations**: Connect accounts from TikTok, Twitter/X, Facebook, and Instagram
- **Automatic Metric Syncing**: Fetch real-time metrics from connected platforms
- **Profile Data Synchronization**: Keep creator profiles updated with latest platform data

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **State Management**: React Context API with useReducer
- **Charts**: Recharts
- **Backend**: Node.js + Express + Passport.js
- **Authentication**: OAuth 2.0 for all platforms

## Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

### Backend Setup

The backend server handles OAuth authentication and API integrations. See [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md) for detailed setup instructions.

```bash
# Install backend dependencies
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API credentials from each platform

# Start backend server
npm run dev
```

## Social Media Integration Setup

Detailed instructions for setting up social media integrations are available in [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md).

### Supported Platforms

- **Instagram**: Profile data, metrics, and recent posts
- **TikTok**: Profile data, metrics, and recent videos  
- **Twitter/X**: Profile data, metrics, and recent tweets
- **Facebook**: Profile data, pages, page metrics, and page posts

### Integration Features

- OAuth authentication flow for each platform
- Automatic token refresh and management
- Real-time metric fetching
- Profile data synchronization
- Connection management UI

## Application Structure

```
src/
├── components/
│   ├── campaigns/        # Campaign management components
│   ├── creators/         # Creator management components
│   ├── reports/          # Analytics and reporting
│   ├── settings/         # Settings and integrations
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   └── shared/          # Shared UI components
├── data/
│   ├── types.ts         # TypeScript type definitions
│   └── seed.ts          # Demo data
├── store/
│   ├── AppContext.tsx   # React Context setup
│   ├── reducer.ts       # State reducer
│   └── selectors.ts    # State selectors
├── utils/
│   ├── api.ts           # API service client
│   ├── platformSync.ts  # Platform sync utilities
│   └── excelExporter.ts # Excel export utilities
└── App.tsx              # Main application component

server/
├── src/
│   ├── config/          # Configuration (Passport, etc.)
│   ├── routes/          # API routes
│   ├── services/        # Platform API services
│   └── middleware/      # Express middleware
├── package.json
└── README.md            # Backend-specific documentation
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start backend server in development mode
- `npm run build` - Build backend TypeScript
- `npm start` - Start production backend server

## Getting Platform API Credentials

To use the social media integrations, you'll need API credentials from each platform:

1. **Instagram**: [Facebook Developers](https://developers.facebook.com/) - Instagram Basic Display
2. **TikTok**: [TikTok for Developers](https://developers.tiktok.com/)
3. **Twitter/X**: [Twitter Developer Portal](https://developer.twitter.com/)
4. **Facebook**: [Facebook Developers](https://developers.facebook.com/)

See [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md) for detailed instructions.

## Development

### Frontend Development

The frontend uses Vite for fast development with HMR. The React template uses Oxlint for linting.

### Backend Development

The backend uses TypeScript with `tsx` for development mode with hot-reload.

## Security Notes

- Never commit `.env` files to version control
- Use strong session secrets in production
- Implement proper token encryption for production
- Use HTTPS for all OAuth flows in production
- Consider using a real database instead of in-memory storage

## Documentation

- [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md) - Social media integration setup guide
- [server/README.md](./server/README.md) - Backend-specific documentation

## License

This project is for demonstration purposes.
