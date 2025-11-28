# EnvVault – Secure .env File Sharing Platform

🔒 **Zero-knowledge secure .env file sharing with client-side encryption**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Frontend                                         │ │
│  │  - WebCrypto API (AES-GCM 256)                         │ │
│  │  - Key generation & encryption (client-side only)      │ │
│  │  - Never sends plaintext or keys to server             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │ (encrypted blob only)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (NestJS)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   Files      │  │   Shares     │      │
│  │   (JWT)      │  │   (S3)       │  │   (Tokens)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Metadata)                   │   │
│  │  - Users, Files, Shares, AuditLogs                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MinIO/S3 (Encrypted Blobs)              │   │
│  │  - Only encrypted data, never plaintext              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Cryptography Flow

### Upload Flow
1. **Client**: User uploads `.env` file
2. **Client**: Generate random AES-GCM 256-bit key using `crypto.getRandomValues()`
3. **Client**: Encrypt file content with AES-GCM (IV + ciphertext)
4. **Client**: Export key as base64 (for user to save/download)
5. **Client**: Send to server:
   - `encryptedBlob` (base64)
   - `iv` (base64)
   - `filenameMasked`
   - `expiresAt`, `singleUse` flags
6. **Server**: Store encrypted blob in S3, metadata in PostgreSQL
7. **Server**: Never sees plaintext or encryption key

### Download Flow
1. **Client**: User provides share token (from URL)
2. **Server**: Hash token, validate share, check expiry/usage limits
3. **Server**: Return encrypted blob + metadata (no key)
4. **Client**: User provides decryption key
5. **Client**: Decrypt blob locally using WebCrypto
6. **Client**: Download decrypted `.env` file

## Security Features

- ✅ **Zero-knowledge architecture**: Server never sees plaintext or keys
- ✅ **Client-side encryption**: All crypto happens in browser using WebCrypto API
- ✅ **Token hashing**: Share tokens hashed with SHA-256 + HMAC server secret
- ✅ **Rate limiting**: Protection against brute force
- ✅ **Helmet**: Security headers
- ✅ **CORS**: Properly configured
- ✅ **Audit logging**: Track all share accesses
- ✅ **Single-use shares**: Optional one-time download links
- ✅ **Expiration**: Time-based access control

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS + Shadcn UI
- Axios
- React Router
- WebCrypto API

### Backend
- NestJS + TypeScript
- PostgreSQL (Prisma ORM)
- MinIO (S3-compatible storage)
- JWT authentication
- Helmet, CORS, Rate Limiting

## Setup & Run

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Quick Start

1. **Clone and navigate to project**
   ```bash
   cd envvault
   ```

2. **Start infrastructure**
   ```bash
   docker-compose up -d postgres minio
   ```

3. **Setup backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your settings
   npx prisma migrate dev
   npm run start:dev
   ```

4. **Setup frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

5. **Access**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/envvault"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="envvault"
S3_REGION="us-east-1"
PORT=3000
NODE_ENV=development
TOKEN_HMAC_SECRET="your-hmac-secret-change-in-production"
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

## API Reference

### Authentication

#### POST /auth/register
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
Response: `{ "accessToken": "jwt-token", "user": {...} }`

#### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
Response: `{ "accessToken": "jwt-token", "user": {...} }`

### Files

#### POST /files/upload
Headers: `Authorization: Bearer <token>`
```json
{
  "encryptedBlob": "base64-encrypted-data",
  "iv": "base64-iv",
  "filenameMasked": "env.example",
  "expiresAt": "2024-12-31T23:59:59Z",
  "singleUse": false
}
```
Response: `{ "id": "file-id", "filenameMasked": "...", "createdAt": "..." }`

#### GET /files/:id/metadata
Headers: `Authorization: Bearer <token>`
Response: File metadata (no encrypted blob)

### Shares

#### POST /shares/create
Headers: `Authorization: Bearer <token>`
```json
{
  "fileId": "file-id",
  "expiresAt": "2024-12-31T23:59:59Z",
  "usageLimit": 10
}
```
Response: `{ "token": "share-token", "shareId": "share-id" }`

#### GET /shares/:token/download
Returns encrypted blob + metadata (no decryption key)

#### POST /shares/:id/revoke
Headers: `Authorization: Bearer <token>`
Revokes a share token

### Audit

#### GET /audit/file/:fileId
Headers: `Authorization: Bearer <token>`
Returns access logs for a file

## Security Considerations

1. **Encryption Keys**: Never stored server-side. Users must save keys separately.
2. **Share Tokens**: Hashed with SHA-256 + HMAC before storage. Plaintext token shown only once.
3. **Rate Limiting**: Applied to share download endpoints to prevent abuse.
4. **HTTPS Required**: In production, always use HTTPS to protect encrypted blobs in transit.
5. **Key Management**: Users are responsible for securely storing their encryption keys.
6. **Token Expiration**: Shares can have expiration dates and usage limits.
7. **Audit Trail**: All share accesses are logged with IP addresses and timestamps.

## Development

### Database Migrations
```bash
cd backend
npx prisma migrate dev
npx prisma studio  # GUI for database
```

### Running Tests
```bash
cd backend
npm test
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## License

MIT
