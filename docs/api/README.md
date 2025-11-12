# API Documentation

This directory contains API integration guides and documentation.

## 📋 Contents

### Integration Guides
- **[V2 Integration Summary](./V2_INTEGRATION_SUMMARY.md)** - Complete overview of V2 API integration
- **[V2 Migration Guide](./V2_MIGRATION_GUIDE.md)** - Step-by-step migration from V1 to V2

### API Specifications
- **[Backend Requirements](./BACKEND_REQUIREMENTS.md)** - Complete backend API specification with database schema, endpoints, and requirements

## 🔗 External Documentation

### Swagger/OpenAPI Docs
Your backend Swagger documentation is available at:
**https://your-api-url.com/api/docs**

This provides:
- Interactive API testing
- Request/response schemas
- Authentication examples
- Endpoint documentation

## 📚 Quick Reference

### V2 API Endpoints

**Authentication:**
- `POST /v2/auth/signup` - User registration
- `POST /v2/auth/signin` - User login
- `POST /v2/auth/logout` - Logout
- `POST /v2/auth/refresh` - Refresh token

**Passcode:**
- `POST /v2/auth/passcode/setup` - Setup 6-digit passcode
- `POST /v2/auth/passcode/verify` - Verify passcode
- `PUT /v2/auth/passcode/change` - Change passcode

**PIN:**
- `POST /v2/auth/pin/setup` - Setup 4-digit PIN
- `POST /v2/auth/pin/verify` - Verify PIN
- `PUT /v2/auth/pin/change` - Change PIN
- `GET /v2/auth/pin/status` - Check PIN status

### V1 API Endpoints

**Wallet:**
- `GET /v1/wallet/balance` - Get wallet balance
- `GET /v1/wallet/history` - Get transaction history
- `GET /v1/wallet/banks` - Get bank list
- `POST /v1/wallet/resolve-bank-account` - Resolve bank account
- `POST /v1/wallet/withdraw/request` - Request withdrawal

**Account:**
- `GET /v1/account/profile` - Get user profile
- `PUT /v1/account/profile` - Update profile
- `POST /v1/account/bvn-update` - Update BVN
- `POST /v1/account/nin-update` - Update NIN

See [Backend Requirements](./BACKEND_REQUIREMENTS.md) for complete API documentation.

---

**Last Updated**: November 11, 2025

