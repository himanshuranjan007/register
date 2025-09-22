# Saros Limit Orders

A sophisticated limit order system built on top of Saros Finance's Dynamic Liquidity Market Maker (DLMM) protocol. This application enables users to place limit orders, stop-loss orders, and take-profit orders using DLMM's unique bin-based architecture.

## Features

- **Limit Orders**: Place buy/sell orders at specific price targets
- **Real-time Monitoring**: Automatic order execution when price targets are hit
- **Order Management**: View, modify, and cancel orders
- **Pool Selection**: Choose from available DLMM pools
- **Wallet Integration**: Connect with Phantom, Solflare, and other Solana wallets
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Solana, @saros-finance/dlmm-sdk
- **Database**: SQLite with Prisma ORM
- **Wallet**: Solana Wallet Adapter
- **UI Components**: Custom components with Tailwind CSS
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd saros-limit-orders
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with wallet provider
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── OrderForm.tsx      # Order placement form
│   ├── OrderBook.tsx      # Order management interface
│   └── PoolSelector.tsx   # Pool selection component
├── contexts/              # React contexts
│   └── WalletContext.tsx  # Wallet connection context
├── services/              # Business logic services
│   ├── dlmm.ts           # DLMM SDK wrapper
│   └── orderManager.ts   # Order management service
└── types/                 # TypeScript type definitions
    └── order.ts          # Order-related types
```

## How It Works

### 1. Order Placement
- Users select a DLMM pool and specify order parameters
- The system calculates the target bin ID based on the desired price
- Orders are stored in the database with "pending" status

### 2. Price Monitoring
- The system continuously monitors pool prices
- When the active bin ID crosses the target bin ID, orders are triggered
- Orders are automatically executed via the DLMM SDK

### 3. Order Execution
- Triggered orders are executed as swap transactions
- Execution details are recorded in the database
- Users receive notifications about order status changes

## Key Components

### DLMMService
Wrapper around the Saros DLMM SDK that provides:
- Pool information retrieval
- Price calculations
- Swap execution
- User position management

### OrderManager
Handles all order-related operations:
- Order placement and validation
- Order status tracking
- Order execution logic
- Database operations

### OrderForm
React component for placing new orders:
- Order type selection (buy/sell)
- Amount and price input
- Expiration date setting
- Form validation

### OrderBook
Displays user's orders with:
- Order status indicators
- Order details and history
- Cancel order functionality
- Real-time updates

## Database Schema

The application uses SQLite with the following main tables:

- **User**: User information and wallet addresses
- **Order**: Limit orders with all parameters and status
- **OrderExecution**: Execution history for orders
- **PoolMonitoring**: Pool monitoring configuration
- **UserPreferences**: User-specific settings

## API Endpoints

The application uses Next.js API routes for:
- Order management operations
- Pool information retrieval
- User data management

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- Netlify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:
- Check the [Saros Finance documentation](https://docs.saros.finance)
- Join the [Saros Discord](https://discord.gg/saros)
- Open an issue in this repository

## Roadmap

- [ ] Stop-loss and take-profit orders
- [ ] Advanced order types (trailing stops)
- [ ] Order book visualization
- [ ] Price charts with order lines
- [ ] Mobile app
- [ ] API for external integrations
- [ ] Multi-pool order management
- [ ] Order analytics and reporting