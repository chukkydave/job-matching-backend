# Job Matching Platform - Backend API

A robust Node.js backend API for the Instollar Jobs platform that connects talents with job opportunities based on skills and location matching.

## Features

### Authentication & User Management
- **User Registration & Login** with JWT-based authentication
- **Email Verification** with OTP codes sent via Brevo SMTP
- **Password Reset** with secure token-based flow
- **Role-based Access Control** (Talent/Admin)
- **Profile Management** with skills and location tracking

### Job Management
- **Admin-only Job Creation** with detailed job postings
- **Public Job Listing** accessible to all users
- **Job Search & Filtering** by skills, location, and keywords
- **Job Updates & Deletion** (Admin only)

### Matching System
- **Intelligent Matching** of talents to jobs based on skills and location
- **Admin Match Management** with detailed match tracking
- **Talent Match Viewing** with personalized dashboard
- **Match Status Tracking** (Active, Completed, etc.)

### Analytics & Statistics
- **Admin Dashboard** with comprehensive system statistics
- **Talent Dashboard** with personalized metrics
- **Match Analytics** and success tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer with Brevo SMTP
- **Environment Management**: dotenv
- **Development**: nodemon for hot reloading

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Brevo SMTP account for email services

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chukkydave/job-matching-backend.git
   cd job-matching-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here

   # Email Configuration (Brevo SMTP)
   EMAIL_USER=your-brevo-email@domain.com
   EMAIL_PASS=your-brevo-smtp-password
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:3000

   # SMTP Configuration
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Talent",
  "skills": ["JavaScript", "React", "Node.js"],
  "location": "New York, USA"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "verificationCode": "123456"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

### Job Endpoints

#### Get All Jobs (Public)
```http
GET /jobs
```

#### Get Job by ID (Public)
```http
GET /jobs/:id
```

#### Create Job (Admin Only)
```http
POST /jobs
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Senior React Developer",
  "description": "We are looking for an experienced React developer...",
  "requiredSkills": ["React", "JavaScript", "TypeScript"],
  "location": "San Francisco, CA"
}
```

#### Update Job (Admin Only)
```http
PUT /jobs/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Updated Job Title",
  "description": "Updated job description...",
  "requiredSkills": ["React", "Node.js"],
  "location": "Remote"
}
```

#### Delete Job (Admin Only)
```http
DELETE /jobs/:id
Authorization: Bearer <admin-token>
```

### Matching Endpoints

#### Create Match (Admin Only)
```http
POST /matching
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "jobId": "job-id-here",
  "userId": "user-id-here"
}
```

#### Get User Matches (Talent)
```http
GET /matching/my-jobs
Authorization: Bearer <talent-token>
```

#### Get All Matches (Admin)
```http
GET /matching
Authorization: Bearer <admin-token>
```

### Admin Endpoints

#### Get Admin Statistics
```http
GET /admin/stats
Authorization: Bearer <admin-token>
```

#### Get All Users (Admin)
```http
GET /users
Authorization: Bearer <admin-token>
```

### Talent Endpoints

#### Get Talent Statistics
```http
GET /talent/stats
Authorization: Bearer <talent-token>
```

#### Get Talent Matches
```http
GET /talent/matches
Authorization: Bearer <talent-token>
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['Talent', 'Admin']),
  skills: [String],
  location: String,
  isEmailVerified: Boolean,
  emailVerificationCode: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model
```javascript
{
  title: String,
  description: String,
  requiredSkills: [String],
  location: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Matching Model
```javascript
{
  jobId: ObjectId (ref: Job),
  userId: ObjectId (ref: User),
  matchedBy: ObjectId (ref: User),
  status: String (enum: ['Active', 'Completed', 'Cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcryptjs with salt rounds
- **Email Verification** to prevent fake accounts
- **Password Reset** with time-limited tokens
- **Role-based Access Control** for admin functions
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://production-connection-string
JWT_SECRET=production-jwt-secret
EMAIL_USER=production-email@domain.com
EMAIL_PASS=production-email-password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://your-frontend-domain.com
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Deployment Steps
1. Set up production MongoDB database
2. Configure environment variables
3. Install dependencies: `npm install --production`
4. Start the server: `npm start`

## Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@domain.com]

## Version History

- **v1.0.0** - Initial release with core functionality
  - User authentication and management
  - Job CRUD operations
  - Matching system
  - Admin and talent dashboards
  - Email verification and password reset

---