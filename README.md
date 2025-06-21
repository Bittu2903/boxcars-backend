# BoxCars Backend API

A comprehensive REST API for the BoxCars automotive dealership platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Vehicle Management**: CRUD operations for vehicle listings with advanced filtering
- **User Management**: User profiles, and dealer accounts
- **Contact System**: Contact form submissions and inquiry management
- **Security**: Rate limiting, input validation, and security headers
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Deployment**: Vercel

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filtering & pagination)
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle (Dealer/Admin)
- `PUT /api/vehicles/:id` - Update vehicle (Owner/Admin)
- `DELETE /api/vehicles/:id` - Delete vehicle (Owner/Admin)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (Admin)
- `PUT /api/contact/:id/status` - Update contact status (Admin)


## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boxcars?retryWrites=true&w=majority

# JWT
JWT_SECRET=my-secret-jwt
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 2. MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster (free tier available)
3. Create a database user with read/write permissions
4. Get your connection string and add it to `.env`
5. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Database Models

### User
- Authentication and profile information
- Role-based access (user, dealer, admin)
- Favorites system

### Vehicle
- Complete vehicle information
- Image management
- Dealer association
- Status tracking

### Contact
- Contact form submissions
- Inquiry management
- Status tracking


## Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive validation using express-validator
- **Authentication**: JWT-based with secure password hashing
- **Authorization**: Role-based access control
- **CORS**: Configured for frontend domain
- **Security Headers**: Helmet.js for security headers

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database errors
- Generic server errors
