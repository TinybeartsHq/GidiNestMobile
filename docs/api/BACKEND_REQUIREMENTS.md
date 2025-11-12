# GidiNest Mobile App - Backend Requirements & API Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Authentication & User Management](#authentication--user-management)
4. [Dashboard & Wallet APIs](#dashboard--wallet-apis)
5. [Savings & Goals APIs](#savings--goals-apis)
6. [Transactions APIs](#transactions-apis)
7. [Community APIs](#community-apis)
8. [Profile & Settings APIs](#profile--settings-apis)
9. [KYC Verification APIs](#kyc-verification-apis)
10. [Notifications & Alerts](#notifications--alerts)
11. [Third-Party Integrations](#third-party-integrations)
12. [Infrastructure & DevOps](#infrastructure--devops)
13. [Security Requirements](#security-requirements)

---

## System Architecture

### Technology Stack Recommendations

**Backend Framework:**
- Node.js with Express/NestJS OR
- Python with Django/FastAPI OR
- Go with Gin/Echo

**Database:**
- Primary: PostgreSQL (for transactional data)
- Cache: Redis (for sessions, rate limiting, real-time data)
- Document Store: MongoDB (for logs, analytics - optional)

**Message Queue:**
- RabbitMQ or Apache Kafka (for async processing)
- Bull (if using Node.js with Redis)

**Storage:**
- AWS S3 or Cloudinary (for user profile images, documents)

**Real-time:**
- WebSocket server (Socket.io or native WebSocket)
- Firebase Cloud Messaging (for push notifications)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    address TEXT,
    profile_image_url TEXT,

    -- Auth providers
    google_id VARCHAR(255) UNIQUE,
    apple_id VARCHAR(255) UNIQUE,

    -- Security
    passcode_hash VARCHAR(255), -- 6-digit login passcode
    pin_hash VARCHAR(255), -- 4-digit withdrawal PIN
    biometric_enabled BOOLEAN DEFAULT false,

    -- KYC/Verification
    is_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(10), -- 'bvn' or 'nin'
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    bvn VARCHAR(11),
    nin VARCHAR(11),

    -- Transaction limits (in kobo/smallest unit)
    daily_limit BIGINT DEFAULT 5000000, -- ₦50,000 default
    per_transaction_limit BIGINT DEFAULT 1000000, -- ₦10,000 default
    monthly_limit BIGINT DEFAULT 50000000, -- ₦500,000 default

    -- Security measures
    limit_restricted_until TIMESTAMP, -- For 24hr restriction after passcode/PIN change
    restricted_limit BIGINT DEFAULT 1000000, -- ₦10,000 temporary limit

    -- Timestamps
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,

    -- Soft delete
    deleted_at TIMESTAMP
);
```

### Wallets Table
```sql
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT DEFAULT 0, -- Amount in kobo (1 Naira = 100 kobo)
    currency VARCHAR(3) DEFAULT 'NGN',

    -- Account details
    account_number VARCHAR(10) UNIQUE, -- Virtual account number
    bank_name VARCHAR(100),

    -- Ledger balance tracking
    ledger_balance BIGINT DEFAULT 0,
    available_balance BIGINT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast user wallet lookup
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
```

### Savings Goals Table
```sql
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Material icon name
    target_amount BIGINT NOT NULL,
    current_amount BIGINT DEFAULT 0,

    -- Auto-save settings
    auto_save_enabled BOOLEAN DEFAULT false,
    auto_save_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly'
    auto_save_amount BIGINT,
    next_auto_save_date TIMESTAMP,

    -- Goal details
    target_date DATE,
    category VARCHAR(50), -- 'delivery', 'baby-essentials', 'emergency', etc.
    priority INT DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    completed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_status ON savings_goals(status);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id),

    -- Transaction details
    type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'transfer', 'savings', 'goal_funding'
    amount BIGINT NOT NULL,
    fee BIGINT DEFAULT 0,
    net_amount BIGINT NOT NULL, -- amount - fee
    currency VARCHAR(3) DEFAULT 'NGN',

    -- Status and processing
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, reversed
    payment_method VARCHAR(50), -- 'bank_transfer', 'card', 'wallet'
    payment_reference VARCHAR(100) UNIQUE,
    external_reference VARCHAR(100), -- Reference from payment provider

    -- Related entities
    savings_goal_id UUID REFERENCES savings_goals(id),
    recipient_user_id UUID REFERENCES users(id),

    -- Metadata
    description TEXT,
    metadata JSONB, -- Additional flexible data

    -- Bank details (for deposits/withdrawals)
    bank_name VARCHAR(100),
    account_number VARCHAR(20),
    account_name VARCHAR(255),

    -- Settlement
    settled_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_payment_reference ON transactions(payment_reference);
```

### Community Posts Table
```sql
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    image_urls TEXT[], -- Array of image URLs

    -- Categories/Tags
    category VARCHAR(50), -- 'tips', 'milestone', 'question', 'story'
    tags TEXT[],

    -- Engagement
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,

    -- Moderation
    is_flagged BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    moderation_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
```

### Community Post Likes Table
```sql
CREATE TABLE community_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON community_post_likes(user_id);
```

### Community Comments Table
```sql
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES community_comments(id), -- For nested replies

    content TEXT NOT NULL,

    -- Engagement
    likes_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_comments_user_id ON community_comments(user_id);
```

### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL, -- 'transaction', 'goal_milestone', 'community', 'security', 'system'
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    -- Action/Deep link
    action_type VARCHAR(50), -- 'navigate', 'open_url'
    action_data JSONB, -- { screen: 'TransactionDetails', params: { id: '...' } }

    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Bank Accounts Table (User's linked banks)
```sql
CREATE TABLE user_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,

    -- Verification
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,

    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_bank_accounts_user_id ON user_bank_accounts(user_id);
```

### Sessions Table (For security tracking)
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    device_name VARCHAR(255),
    device_type VARCHAR(50), -- 'ios', 'android'
    device_id VARCHAR(255),

    ip_address INET,
    location VARCHAR(255), -- e.g., "Lagos, Nigeria"

    -- Token info
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP,

    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

---

## Authentication & User Management

### Screens: AuthLandingScreen, SignInScreen, SignUpScreen, PasscodeSetupScreen, PINSetupScreen

### APIs Required:

#### 1. POST `/api/v1/auth/signup`
**Purpose:** Register new user with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "08012345678",
  "referral_code": "ABC123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_verified": false
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 3600
    }
  }
}
```

**Backend Logic:**
- Validate email format and uniqueness
- Hash password with bcrypt (salt rounds: 10-12)
- Create user record
- Create wallet with virtual account number (via payment provider)
- Generate JWT tokens
- Send email verification email
- Create initial notification (welcome message)

---

#### 2. POST `/api/v1/auth/signin`
**Purpose:** Login with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "has_passcode": true,
      "has_pin": true,
      "is_verified": true
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 3600
    }
  }
}
```

**Backend Logic:**
- Verify email exists
- Compare password hash
- Update last_login_at
- Generate JWT tokens
- Create session record
- Send login alert notification (if enabled)

---

#### 3. POST `/api/v1/auth/oauth/google`
**Purpose:** Sign in/up with Google OAuth

**Request:**
```json
{
  "id_token": "google_id_token",
  "device_info": {
    "device_name": "iPhone 14 Pro",
    "device_type": "ios"
  }
}
```

**Response:** Same as signup/signin

**Backend Logic:**
- Verify Google ID token with Google API
- Check if user exists by google_id or email
- If new user, create account with OAuth data
- If existing user, update google_id
- Generate JWT tokens

**Google OAuth Setup:**
- Create project in Google Cloud Console
- Enable Google Sign-In API
- Get OAuth 2.0 client IDs for iOS and Android
- Configure consent screen

---

#### 4. POST `/api/v1/auth/oauth/apple`
**Purpose:** Sign in/up with Apple Sign In

**Request:**
```json
{
  "id_token": "apple_id_token",
  "authorization_code": "apple_auth_code",
  "user_data": {
    "email": "user@privaterelay.appleid.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Response:** Same as signup/signin

**Backend Logic:**
- Verify Apple ID token with Apple's public keys
- Extract user info from token
- Check if user exists by apple_id or email
- Handle Apple's privacy relay emails
- Generate JWT tokens

**Apple Sign In Setup:**
- Register app in Apple Developer portal
- Configure Sign in with Apple capability
- Get Service ID and Key ID
- Download and configure private key

---

#### 5. POST `/api/v1/auth/refresh`
**Purpose:** Refresh access token

**Request:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_access_token",
    "expires_in": 3600
  }
}
```

---

#### 6. POST `/api/v1/auth/passcode/setup`
**Purpose:** Set or change login passcode

**Request:**
```json
{
  "passcode": "123456",
  "old_passcode": "654321" // Only required when changing
}
```

**Response:**
```json
{
  "success": true,
  "message": "Passcode set successfully"
}
```

**Backend Logic:**
- If changing, verify old_passcode first
- Hash new passcode with bcrypt
- Update user record
- If changing (not initial setup), apply 24-hour transaction restrictions
- Send notification about passcode change

---

#### 7. POST `/api/v1/auth/pin/setup`
**Purpose:** Set or change withdrawal PIN

**Request:**
```json
{
  "pin": "1234",
  "old_pin": "4321" // Only required when changing
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN set successfully"
}
```

**Backend Logic:**
- If changing, verify old_pin first
- Hash new PIN with bcrypt
- Update user record
- If changing, apply 24-hour transaction restrictions
- Send notification about PIN change

---

#### 8. POST `/api/v1/auth/passcode/verify`
**Purpose:** Verify passcode for authentication

**Request:**
```json
{
  "passcode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Passcode verified"
}
```

---

#### 9. POST `/api/v1/auth/pin/verify`
**Purpose:** Verify PIN before withdrawal/sensitive operations

**Request:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PIN verified"
}
```

---

#### 10. POST `/api/v1/auth/logout`
**Purpose:** Logout user and invalidate tokens

**Request:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Backend Logic:**
- Invalidate refresh token (add to blacklist or delete from sessions)
- Delete session record

---

## Dashboard & Wallet APIs

### Screens: DashboardScreen

### APIs Required:

#### 1. GET `/api/v1/dashboard`
**Purpose:** Get all dashboard data in one request

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "is_verified": false
    },
    "wallet": {
      "id": "uuid",
      "balance": 85000000, // ₦850,000 in kobo
      "account_number": "1234567890",
      "bank_name": "Providus Bank"
    },
    "quick_stats": {
      "total_saved": 25000000, // ₦250,000
      "active_goals": 3,
      "transactions_this_month": 12
    },
    "recent_transactions": [
      {
        "id": "uuid",
        "type": "deposit",
        "amount": 5000000,
        "status": "completed",
        "description": "Bank transfer",
        "created_at": "2025-11-10T14:30:00Z"
      }
    ],
    "savings_goals": [
      {
        "id": "uuid",
        "name": "Hospital Delivery Bills",
        "target_amount": 50000000,
        "current_amount": 25000000,
        "progress": 50.0
      }
    ]
  }
}
```

**Backend Logic:**
- Fetch user details
- Get wallet balance
- Calculate stats from transactions and goals
- Get last 5 transactions
- Get all active savings goals
- Cache response in Redis for 30 seconds

---

#### 2. GET `/api/v1/wallet`
**Purpose:** Get wallet details

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "balance": 85000000,
    "available_balance": 85000000,
    "ledger_balance": 85000000,
    "currency": "NGN",
    "account_number": "1234567890",
    "bank_name": "Providus Bank",
    "account_name": "John Doe"
  }
}
```

---

#### 3. POST `/api/v1/wallet/deposit`
**Purpose:** Initiate deposit via bank transfer

**Request:**
```json
{
  "amount": 10000000, // ₦100,000 in kobo
  "payment_method": "bank_transfer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "payment_reference": "GN_1234567890",
    "account_details": {
      "account_number": "1234567890",
      "bank_name": "Providus Bank",
      "account_name": "John Doe"
    },
    "amount": 10000000,
    "expires_at": "2025-11-11T14:30:00Z"
  }
}
```

**Backend Logic:**
- Create pending transaction record
- Generate unique payment reference
- Return virtual account details
- Set up webhook listener for payment confirmation
- Transaction expires after 24 hours if not completed

---

#### 4. POST `/api/v1/wallet/withdraw`
**Purpose:** Withdraw funds to user's bank account

**Request:**
```json
{
  "amount": 5000000, // ₦50,000
  "bank_account_id": "uuid",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "amount": 5000000,
    "fee": 10000, // ₦100 fee
    "net_amount": 4990000,
    "status": "processing",
    "estimated_completion": "2025-11-10T15:00:00Z"
  }
}
```

**Backend Logic:**
- Verify PIN
- Check sufficient balance
- Check transaction limits (daily, per-transaction)
- Check if user is under 24-hour restriction
- Create withdrawal transaction
- Deduct amount + fee from wallet
- Process withdrawal via payment provider (Paystack, Flutterwave)
- Update transaction status based on provider response
- Send notification

---

## Savings & Goals APIs

### Screens: SavingsScreen, CreateGoalScreen, FundGoalScreen, GoalDetailsScreen

### APIs Required:

#### 1. GET `/api/v1/savings/goals`
**Purpose:** Get all user's savings goals

**Response:**
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "uuid",
        "name": "Hospital Delivery Bills",
        "description": "Funds for delivery day",
        "icon": "hospital-building",
        "target_amount": 50000000,
        "current_amount": 25000000,
        "progress": 50.0,
        "target_date": "2025-12-01",
        "category": "delivery",
        "auto_save_enabled": true,
        "auto_save_amount": 500000,
        "auto_save_frequency": "weekly",
        "next_auto_save_date": "2025-11-17",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "total_saved": 25000000,
    "total_goals": 4
  }
}
```

---

#### 2. POST `/api/v1/savings/goals`
**Purpose:** Create new savings goal

**Request:**
```json
{
  "name": "Hospital Delivery Bills",
  "description": "Funds for delivery day",
  "icon": "hospital-building",
  "target_amount": 50000000,
  "target_date": "2025-12-01",
  "category": "delivery",
  "auto_save_enabled": true,
  "auto_save_frequency": "weekly",
  "auto_save_amount": 500000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "goal": {
      "id": "uuid",
      "name": "Hospital Delivery Bills",
      // ... other fields
    }
  }
}
```

**Backend Logic:**
- Validate target_amount > 0
- Validate target_date is in future
- Create goal record
- If auto_save_enabled, calculate next_auto_save_date
- Create notification
- Return created goal

---

#### 3. POST `/api/v1/savings/goals/:goalId/fund`
**Purpose:** Add money to a savings goal

**Request:**
```json
{
  "amount": 5000000,
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid",
    "goal": {
      "id": "uuid",
      "current_amount": 30000000,
      "progress": 60.0
    }
  }
}
```

**Backend Logic:**
- Verify PIN
- Check wallet has sufficient balance
- Create transaction record (type: 'goal_funding')
- Deduct from wallet balance
- Add to goal's current_amount
- Check if goal is completed (current >= target)
- If completed, mark goal as completed and send celebration notification
- Send transaction confirmation

---

#### 4. PUT `/api/v1/savings/goals/:goalId`
**Purpose:** Update savings goal

**Request:**
```json
{
  "name": "Updated Goal Name",
  "target_amount": 60000000,
  "auto_save_enabled": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "goal": {
      // updated goal data
    }
  }
}
```

---

#### 5. DELETE `/api/v1/savings/goals/:goalId`
**Purpose:** Cancel/delete a savings goal

**Request:**
```json
{
  "withdraw_funds": true, // Return funds to wallet
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refunded_amount": 25000000,
    "wallet_balance": 110000000
  }
}
```

**Backend Logic:**
- Verify PIN
- If withdraw_funds is true, transfer goal balance to wallet
- Mark goal as cancelled
- Create transaction records
- Send notification

---

#### 6. GET `/api/v1/savings/goals/:goalId/transactions`
**Purpose:** Get transaction history for a specific goal

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "amount": 5000000,
        "type": "goal_funding",
        "created_at": "2025-11-10T14:30:00Z"
      }
    ],
    "total_contributed": 25000000
  }
}
```

---

## Transactions APIs

### Screens: TransactionsScreen, TransactionDetailsScreen

### APIs Required:

#### 1. GET `/api/v1/transactions`
**Purpose:** Get paginated transaction history

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)
- `type`: string (optional filter: 'deposit', 'withdrawal', etc.)
- `status`: string (optional filter: 'completed', 'pending', etc.)
- `from_date`: ISO date string (optional)
- `to_date`: ISO date string (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "deposit",
        "amount": 5000000,
        "fee": 0,
        "net_amount": 5000000,
        "status": "completed",
        "description": "Bank transfer deposit",
        "payment_reference": "GN_1234567890",
        "created_at": "2025-11-10T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

---

#### 2. GET `/api/v1/transactions/:transactionId`
**Purpose:** Get detailed transaction information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "withdrawal",
    "amount": 5000000,
    "fee": 10000,
    "net_amount": 4990000,
    "status": "completed",
    "description": "Withdrawal to bank account",
    "payment_reference": "GN_9876543210",
    "bank_details": {
      "bank_name": "Access Bank",
      "account_number": "0123456789",
      "account_name": "John Doe"
    },
    "metadata": {
      "session_id": "uuid",
      "ip_address": "192.168.1.1"
    },
    "created_at": "2025-11-10T14:30:00Z",
    "settled_at": "2025-11-10T14:35:00Z"
  }
}
```

---

## Community APIs

### Screens: CommunityScreen, CreatePostScreen

### APIs Required:

#### 1. GET `/api/v1/community/posts`
**Purpose:** Get community feed with pagination

**Query Parameters:**
- `page`: number
- `limit`: number
- `category`: string (optional filter)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "first_name": "Jane",
          "last_name": "Doe",
          "profile_image_url": "https://..."
        },
        "content": "Just hit my first savings goal! 🎉",
        "image_urls": ["https://..."],
        "category": "milestone",
        "tags": ["savings", "achievement"],
        "likes_count": 45,
        "comments_count": 12,
        "is_liked": false,
        "created_at": "2025-11-10T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 234,
      "total_pages": 12
    }
  }
}
```

**Backend Logic:**
- Fetch posts with user info (JOIN)
- Check if current user has liked each post
- Order by created_at DESC
- Cache popular posts in Redis

---

#### 2. POST `/api/v1/community/posts`
**Purpose:** Create new community post

**Request:**
```json
{
  "content": "Just hit my first savings goal! 🎉",
  "category": "milestone",
  "tags": ["savings", "achievement"],
  "image_urls": ["https://cloudinary.com/..."] // Pre-uploaded images
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      // ... post data
    }
  }
}
```

**Backend Logic:**
- Validate content length (max 2000 chars)
- Validate image URLs belong to user
- Create post record
- Send notifications to followers (if feature exists)
- Return created post

---

#### 3. POST `/api/v1/community/posts/:postId/like`
**Purpose:** Like/unlike a post

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likes_count": 46
  }
}
```

**Backend Logic:**
- Check if user already liked (toggle)
- Create or delete like record
- Update post likes_count
- Send notification to post author

---

#### 4. POST `/api/v1/community/posts/:postId/comments`
**Purpose:** Add comment to post

**Request:**
```json
{
  "content": "Congratulations! 🎊",
  "parent_comment_id": "uuid" // optional for replies
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "uuid",
      "content": "Congratulations! 🎊",
      "user": {
        "id": "uuid",
        "first_name": "John"
      },
      "created_at": "2025-11-10T14:35:00Z"
    }
  }
}
```

---

#### 5. GET `/api/v1/community/posts/:postId/comments`
**Purpose:** Get comments for a post

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "Congratulations!",
        "user": {
          "id": "uuid",
          "first_name": "John"
        },
        "likes_count": 5,
        "replies_count": 2,
        "created_at": "2025-11-10T14:35:00Z"
      }
    ]
  }
}
```

---

#### 6. POST `/api/v1/uploads/image`
**Purpose:** Upload image for community posts or profile

**Request:** multipart/form-data
- `file`: image file
- `type`: 'post' | 'profile'

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/...",
    "width": 1920,
    "height": 1080,
    "format": "jpg"
  }
}
```

**Backend Logic:**
- Validate file type (jpg, png, webp)
- Validate file size (max 5MB)
- Upload to S3/Cloudinary
- Resize/optimize image
- Return URL

---

## Profile & Settings APIs

### Screens: ProfileScreen, EditProfileScreen, EditProfileDetailsScreen, SecuritySettingsScreen, PaymentMethodsScreen

### APIs Required:

#### 1. GET `/api/v1/profile`
**Purpose:** Get user profile details

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "phone": "08012345678",
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-15",
      "address": "123 Main St, Lagos",
      "profile_image_url": "https://...",
      "is_verified": true,
      "verification_method": "bvn",
      "email_verified_at": "2025-01-01T00:00:00Z",
      "phone_verified_at": "2025-01-01T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "limits": {
      "daily_limit": 100000000,
      "per_transaction_limit": 50000000,
      "monthly_limit": 1000000000,
      "is_restricted": false,
      "restricted_until": null
    },
    "security": {
      "has_passcode": true,
      "has_pin": true,
      "biometric_enabled": true,
      "two_factor_enabled": false
    }
  }
}
```

---

#### 2. PUT `/api/v1/profile`
**Purpose:** Update user profile

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "08087654321",
  "date_of_birth": "1990-01-15",
  "address": "456 New St, Lagos"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      // updated user data
    }
  }
}
```

---

#### 3. POST `/api/v1/profile/avatar`
**Purpose:** Update profile picture

**Request:** multipart/form-data
- `file`: image file

**Response:**
```json
{
  "success": true,
  "data": {
    "profile_image_url": "https://cloudinary.com/..."
  }
}
```

---

#### 4. GET `/api/v1/security/sessions`
**Purpose:** Get active login sessions

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "device_name": "iPhone 14 Pro",
        "device_type": "ios",
        "location": "Lagos, Nigeria",
        "ip_address": "192.168.1.1",
        "is_current": true,
        "last_active_at": "2025-11-10T14:30:00Z",
        "created_at": "2025-11-10T10:00:00Z"
      }
    ]
  }
}
```

---

#### 5. DELETE `/api/v1/security/sessions/:sessionId`
**Purpose:** End a login session

**Response:**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

---

#### 6. GET `/api/v1/bank-accounts`
**Purpose:** Get user's linked bank accounts

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": "uuid",
        "bank_name": "Access Bank",
        "bank_code": "044",
        "account_number": "0123456789",
        "account_name": "John Doe",
        "is_verified": true,
        "is_default": true
      }
    ]
  }
}
```

---

#### 7. POST `/api/v1/bank-accounts`
**Purpose:** Add new bank account

**Request:**
```json
{
  "bank_code": "044",
  "account_number": "0123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": "uuid",
      "bank_name": "Access Bank",
      "account_number": "0123456789",
      "account_name": "John Doe", // Resolved from bank
      "is_verified": true
    }
  }
}
```

**Backend Logic:**
- Call Paystack/Flutterwave account verification API
- Verify account name matches user's name
- Create bank account record
- Return verified account details

---

## KYC Verification APIs

### Screens: SelectVerificationMethodScreen, BVNVerificationScreen, NINVerificationScreen

### APIs Required:

#### 1. POST `/api/v1/kyc/bvn/verify`
**Purpose:** Verify user with BVN

**Request:**
```json
{
  "bvn": "12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "details": {
      "first_name": "John",
      "last_name": "Doe",
      "middle_name": "William",
      "date_of_birth": "15-Jan-1990",
      "phone_number": "08012345678",
      "email": "john.doe@example.com"
    }
  }
}
```

**Backend Logic:**
- Call BVN verification API (e.g., Mono, Okra, Smile Identity)
- Return user details for confirmation
- Don't save BVN yet (wait for user confirmation)

---

#### 2. POST `/api/v1/kyc/bvn/confirm`
**Purpose:** Confirm and save BVN verification

**Request:**
```json
{
  "bvn": "12345678901",
  "confirmed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_verified": true,
    "verification_method": "bvn",
    "limits": {
      "daily_limit": 100000000,
      "per_transaction_limit": 50000000,
      "monthly_limit": 1000000000
    }
  }
}
```

**Backend Logic:**
- Save BVN to user record
- Update is_verified to true
- Update verification_method to 'bvn'
- Increase transaction limits
- Send verification success notification

---

#### 3. POST `/api/v1/kyc/nin/verify`
**Purpose:** Verify user with NIN

**Request:**
```json
{
  "nin": "12345678901"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "details": {
      "first_name": "John",
      "last_name": "Doe",
      "middle_name": "William",
      "date_of_birth": "15-Jan-1990",
      "gender": "Male",
      "state_of_origin": "Lagos",
      "lga": "Ikeja",
      "address": "123 Main Street, Ikeja, Lagos"
    }
  }
}
```

**Backend Logic:**
- Call NIN verification API (e.g., Verified Africa, Youverify)
- Return user details for confirmation

---

#### 4. POST `/api/v1/kyc/nin/confirm`
**Purpose:** Confirm and save NIN verification

**Request:**
```json
{
  "nin": "12345678901",
  "confirmed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_verified": true,
    "verification_method": "nin",
    "limits": {
      "daily_limit": 100000000,
      "per_transaction_limit": 50000000,
      "monthly_limit": 1000000000
    }
  }
}
```

---

## Notifications & Alerts

### Screens: NotificationsScreen

### APIs Required:

#### 1. GET `/api/v1/notifications`
**Purpose:** Get user notifications

**Query Parameters:**
- `page`: number
- `limit`: number
- `unread_only`: boolean

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "transaction",
        "title": "Deposit Successful",
        "body": "Your deposit of ₦50,000 has been credited",
        "action_type": "navigate",
        "action_data": {
          "screen": "TransactionDetails",
          "params": {
            "id": "transaction_uuid"
          }
        },
        "read": false,
        "created_at": "2025-11-10T14:30:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 89
    }
  }
}
```

---

#### 2. PUT `/api/v1/notifications/:notificationId/read`
**Purpose:** Mark notification as read

**Response:**
```json
{
  "success": true
}
```

---

#### 3. PUT `/api/v1/notifications/read-all`
**Purpose:** Mark all notifications as read

**Response:**
```json
{
  "success": true,
  "marked_read": 12
}
```

---

#### 4. POST `/api/v1/notifications/register-device`
**Purpose:** Register device for push notifications

**Request:**
```json
{
  "device_token": "fcm_device_token",
  "platform": "ios"
}
```

**Response:**
```json
{
  "success": true
}
```

**Backend Logic:**
- Save device token to user's device tokens table
- Use for sending push notifications via FCM

---

## Third-Party Integrations

### Payment Provider Integration (Paystack or Flutterwave)

**Required Setup:**
1. **Virtual Account Creation**
   - When user signs up, create dedicated virtual account
   - API: Paystack Dedicated Virtual Account or Flutterwave Virtual Account

2. **Webhook Handlers**
   - Listen for payment confirmations
   - Update transaction status
   - Credit user wallet

   **Webhook URL:** `POST /api/v1/webhooks/paystack`

   **Payload:**
   ```json
   {
     "event": "charge.success",
     "data": {
       "reference": "GN_1234567890",
       "amount": 5000000,
       "customer": {
         "email": "user@example.com"
       },
       "status": "success"
     }
   }
   ```

3. **Transfer/Payout**
   - For withdrawals, use Transfer API
   - Paystack: Transfer API
   - Flutterwave: Transfer API

4. **Account Verification**
   - Resolve account number to verify bank accounts
   - API: Paystack Bank Account Verification

---

### KYC Verification Providers

**Options:**
1. **Mono** (https://mono.co)
   - BVN verification
   - NIN verification

2. **Smile Identity** (https://smileidentity.com)
   - BVN verification
   - NIN verification
   - Document verification

3. **Youverify** (https://youverify.co)
   - Comprehensive KYC
   - BVN, NIN, Driver's License

**Setup:**
- Get API keys
- Implement verification endpoints
- Handle webhooks for async verification

---

### Email Service

**Provider:** SendGrid, AWS SES, or Mailgun

**Email Templates:**
1. Welcome email
2. Email verification
3. Password reset
4. Transaction receipts
5. Goal milestone celebrations
6. Security alerts

---

### SMS Service (Optional)

**Provider:** Twilio or Termii

**Use Cases:**
- Phone verification OTP
- Transaction alerts
- Security alerts

---

### Cloud Storage

**Provider:** AWS S3 or Cloudinary

**Use Cases:**
- Profile images
- Community post images
- KYC documents

---

## Infrastructure & DevOps

### Hosting

**Recommended Stack:**
- **Application:** AWS EC2, Google Cloud Run, or DigitalOcean Droplets
- **Database:** AWS RDS (PostgreSQL) or managed PostgreSQL
- **Cache:** AWS ElastiCache (Redis) or Redis Cloud
- **File Storage:** AWS S3 or Cloudinary
- **CDN:** CloudFront or Cloudflare

### CI/CD Pipeline

1. **GitHub Actions or GitLab CI**
   - Run tests on push
   - Build Docker images
   - Deploy to staging/production

2. **Environments:**
   - Development
   - Staging
   - Production

### Monitoring & Logging

1. **Application Monitoring:**
   - Sentry (error tracking)
   - New Relic or DataDog (performance)

2. **Logging:**
   - CloudWatch Logs (AWS)
   - Loggly or Papertrail

3. **Uptime Monitoring:**
   - Pingdom
   - UptimeRobot

---

## Security Requirements

### API Security

1. **Authentication:**
   - JWT with RS256 (asymmetric keys)
   - Access token expiry: 1 hour
   - Refresh token expiry: 30 days
   - Refresh token rotation

2. **Rate Limiting:**
   - Per IP: 100 requests/minute
   - Per user: 1000 requests/hour
   - Login attempts: 5 attempts per 15 minutes
   - Implement with Redis

3. **Request Validation:**
   - Input sanitization
   - Schema validation (Joi, Yup, or Zod)
   - SQL injection prevention (use ORMs)
   - XSS prevention

4. **HTTPS Only:**
   - SSL/TLS certificate (Let's Encrypt)
   - HSTS headers
   - Redirect HTTP to HTTPS

5. **CORS Configuration:**
   - Allow only mobile app origins
   - Proper headers configuration

### Data Security

1. **Encryption:**
   - Passwords: bcrypt (salt rounds: 12)
   - Sensitive data at rest: AES-256
   - Database encryption
   - Encrypted backups

2. **PCI DSS Compliance:**
   - Never store full card details
   - Use payment provider tokenization
   - Comply with PCI DSS requirements

3. **Data Privacy:**
   - NDPR (Nigeria Data Protection Regulation) compliance
   - User data export functionality
   - Account deletion functionality
   - Privacy policy and terms

4. **Audit Logs:**
   - Log all sensitive operations
   - Track PIN/passcode changes
   - Log admin actions
   - Retention: 1 year minimum

### Transaction Security

1. **Idempotency:**
   - Use idempotency keys for transactions
   - Prevent duplicate charges

2. **Two-Factor Authentication:**
   - PIN verification for withdrawals
   - Passcode verification for sensitive changes

3. **Fraud Detection:**
   - Unusual transaction patterns
   - Multiple failed PIN attempts
   - Geographic anomalies
   - Velocity checks

4. **Transaction Limits:**
   - Daily limits
   - Per-transaction limits
   - Monthly limits
   - Temporary restrictions after security changes

---

## Scheduled Jobs / Cron Tasks

### Daily Jobs

1. **Auto-Save Processing** (6:00 AM)
   - Find goals with auto_save_enabled
   - Check if next_auto_save_date is today
   - Process auto-save transactions
   - Update next_auto_save_date

2. **Transaction Limit Reset** (12:00 AM)
   - Reset daily transaction counters
   - Remove expired restrictions

3. **Expired Transactions Cleanup** (2:00 AM)
   - Mark pending deposits older than 24 hours as expired
   - Send notifications for expired transactions

### Weekly Jobs

1. **Account Summary Email** (Monday 9:00 AM)
   - Send weekly summary to users
   - Total saved, active goals, recent activity

### Monthly Jobs

1. **Monthly Report** (1st day, 9:00 AM)
   - Generate monthly savings report
   - Send to users via email

2. **Transaction Limit Reset** (1st day, 12:00 AM)
   - Reset monthly transaction counters

---

## Testing Requirements

### Unit Tests
- All API endpoints
- Business logic functions
- Utility functions
- Target: 80% code coverage

### Integration Tests
- Database operations
- Payment provider integrations
- KYC provider integrations
- Email/SMS sending

### End-to-End Tests
- User registration flow
- Deposit flow
- Withdrawal flow
- Goal creation and funding

### Load Testing
- Simulate concurrent users
- Test API performance under load
- Database query optimization
- Target: 1000+ concurrent users

---

## API Documentation

**Tool:** Swagger/OpenAPI

**Setup:**
- Generate API documentation from code
- Host at `/api/docs`
- Include all endpoints, request/response schemas
- Provide example requests

---

## Deployment Checklist

### Pre-launch
- [ ] All APIs tested and working
- [ ] Database migrations ready
- [ ] Payment provider configured (test mode)
- [ ] KYC provider configured (test mode)
- [ ] Email templates created
- [ ] Push notifications configured (FCM)
- [ ] SSL certificate installed
- [ ] Environment variables secured
- [ ] Monitoring tools configured
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] CORS configured
- [ ] Terms of Service finalized
- [ ] Privacy Policy finalized

### Launch
- [ ] Switch to production payment provider
- [ ] Switch to production KYC provider
- [ ] Enable production monitoring
- [ ] Set up on-call rotation
- [ ] Prepare incident response plan
- [ ] Marketing materials ready
- [ ] Customer support ready

### Post-launch
- [ ] Monitor error rates
- [ ] Monitor API response times
- [ ] Track user signups
- [ ] Track transaction volumes
- [ ] Collect user feedback
- [ ] Plan feature iterations

---

## Cost Estimates (Monthly)

### Infrastructure
- **Server Hosting (AWS/DO):** $50 - $200
- **Database (Managed PostgreSQL):** $50 - $150
- **Redis Cache:** $20 - $50
- **File Storage (S3/Cloudinary):** $10 - $50
- **CDN:** $10 - $30

### Third-Party Services
- **Payment Provider (Paystack):** Transaction fees (1.5% + ₦100)
- **KYC Verification:** ₦50 - ₦200 per verification
- **Email Service (SendGrid):** $15 - $80
- **SMS Service (Twilio):** Pay per message
- **Push Notifications (FCM):** Free
- **Monitoring (Sentry):** $26 - $80
- **Error Tracking:** $0 - $50

### Total Estimated Monthly Cost: $200 - $700 (excluding transaction fees)

---

## Future Enhancements

### Phase 2 Features
1. **Investment Options**
   - Treasury bills
   - Mutual funds
   - Fixed deposits

2. **Social Features**
   - Follow other users
   - Share goals publicly
   - Goal challenges/competitions

3. **Referral Program**
   - Invite friends
   - Earn rewards
   - Referral leaderboard

4. **Advanced Analytics**
   - Spending insights
   - Savings trends
   - Goal projections

5. **Gamification**
   - Badges and achievements
   - Savings streaks
   - Milestone rewards

### Phase 3 Features
1. **Marketplace Integration**
   - Buy baby products
   - Book hospital appointments
   - Hire postpartum support

2. **Financial Education**
   - Articles and tips
   - Video tutorials
   - Webinars

3. **Multi-currency Support**
   - USD, GBP, EUR
   - Forex rates
   - International transfers

---

## Conclusion

This document provides a comprehensive overview of all backend requirements for the GidiNest mobile app. Each API endpoint should be implemented with proper error handling, validation, logging, and security measures.

**Next Steps:**
1. Set up development environment
2. Initialize database with migrations
3. Implement authentication APIs first
4. Then wallet and transaction APIs
5. Integrate payment provider
6. Implement remaining features iteratively
7. Test thoroughly before launch

For questions or clarifications, refer to this document and update as needed during development.
