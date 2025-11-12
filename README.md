# GidiNest Mobile App

A React Native mobile application for managing savings goals, transactions, and financial planning.

## 📱 Features

- **Authentication**: Email/password, passcode, and biometric (Face ID/Touch ID/Fingerprint)
- **Wallet Management**: View balance, transaction history, deposits, and withdrawals
- **Savings Goals**: Create and manage savings goals with auto-save options
- **Transactions**: Track all financial transactions with detailed history
- **Security**: PIN and passcode protection with 24-hour restrictions on changes
- **Profile Management**: Update profile, manage security settings, KYC verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Physical device for testing biometric features

### Installation

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## 📚 Documentation

All documentation is organized in the [`docs/`](./docs/) directory:

- **[Getting Started](./docs/README.md)** - Setup guides and configuration
- **[API Documentation](./docs/api/)** - V2 API integration guides
- **[Checklists](./docs/checklists/)** - Integration progress and testing checklists
- **[Swagger API Docs](https://your-api-url.com/api/docs)** - Interactive API documentation

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── redux/           # State management (Redux Toolkit)
├── screens/         # Screen components
├── services/        # API service layers
├── theme/           # Theme configuration
└── utils/           # Utility functions
```

## 🔐 Authentication

The app uses V2 API for authentication with support for:
- Email/password login
- 6-digit passcode for quick login
- Biometric authentication (Face ID/Touch ID/Fingerprint)
- 4-digit PIN for transactions

See [Authentication Documentation](./docs/api/V2_INTEGRATION_SUMMARY.md) for details.

## 🛠️ Development

### Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=https://your-api-url.com/api
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting (if configured)

## 📦 Key Dependencies

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Redux Toolkit** - State management
- **React Navigation** - Navigation
- **Expo Secure Store** - Secure storage
- **Expo Local Authentication** - Biometric auth

## 🧪 Testing

See [Testing Checklist](./docs/checklists/V2_CHECKLIST.md) for comprehensive testing guide.

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Update documentation if needed
4. Submit a pull request

## 📄 License

[Your License Here]

## 🔗 Links

- **API Documentation**: [Swagger UI](https://your-api-url.com/api/docs)
- **Project Documentation**: [docs/](./docs/)
- **Backend Repository**: [Link if separate]

---

**Last Updated**: November 11, 2025

