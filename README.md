# Facebook Ads Analytics Application

A comprehensive analytics platform for Facebook Ads, providing advanced insights, campaign management, and ad library search capabilities.

## Features

- **Authentication System**: Secure login with role-based access control
- **Facebook API Integration**: Connect multiple Facebook accounts and ad accounts
- **Analytics Dashboard**: Customizable dashboards with various visualization widgets
- **Campaign Management**: Create, monitor, and optimize Facebook ad campaigns
- **Ad Library Search**: Search and save ads from the Facebook Ad Library
- **Custom Reports**: Generate and schedule custom reports
- **Subscription Plans**: Multiple subscription tiers with Stripe payment integration
- **User Management**: Admin panel for managing users and permissions

## Technology Stack

### Frontend
- Next.js / React
- Redux Toolkit for state management
- Material UI component library
- Recharts for data visualization
- Formik and Yup for form validation
- Axios for API requests

### Backend
- Node.js / Express
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Facebook Marketing API integration
- Stripe API integration

### DevOps
- Docker containerization
- GitHub Actions for CI/CD
- Jest for testing

## Getting Started

### Prerequisites
- Node.js (v20 or later)
- npm (v9 or later)
- PostgreSQL (v14 or later)
- Facebook Developer Account
- Stripe Account

### Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fb-ads-analytics.git
   cd fb-ads-analytics
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration.

3. Install dependencies:
   ```
   # Install frontend dependencies
   cd frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

4. Set up the database:
   ```
   npx prisma migrate dev
   node src/utils/seedAuth.js
   ```

5. Start the development servers:
   ```
   # Start backend server
   cd backend
   npm run dev

   # In a new terminal, start frontend server
   cd frontend
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Testing

Run tests for the frontend:
```
cd frontend
npm test
```

Run tests for the backend:
```
cd backend
npm test
```

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
fb-ads-analytics/
├── frontend/                # Next.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Next.js pages
│   │   ├── redux/           # Redux state management
│   │   ├── services/        # API services
│   │   ├── styles/          # Global styles and theme
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom React hooks
│   ├── tests/               # Frontend tests
│   └── public/              # Static assets
│
├── backend/                 # Express.js backend application
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration files
│   ├── prisma/              # Prisma schema and migrations
│   └── tests/               # Backend tests
│
├── docker-compose.yml       # Docker Compose configuration
├── .github/                 # GitHub Actions workflows
├── .env.example             # Example environment variables
└── DEPLOYMENT.md            # Deployment documentation
```

## Documentation

- [API Documentation](backend/API.md)
- [User Guide](docs/USER_GUIDE.md)
- [Admin Guide](docs/ADMIN_GUIDE.md)
- [Facebook API Integration](docs/FACEBOOK_API.md)
- [Stripe Integration](docs/STRIPE.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact support@yourdomain.com or open an issue on GitHub.
