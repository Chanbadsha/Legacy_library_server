# Legacy Library Server

## Overview
Legacy Library is an online platform that allows users to explore, borrow, and manage books efficiently. The backend server is built using Node.js, Express, and MongoDB to provide a seamless experience for managing book-related data and user interactions.

## Features
- User authentication and management
- Book catalog retrieval and filtering
- Borrowing and returning books
- Managing user borrowing history
- Secure database interactions with MongoDB

## Tech Stack
```txt
- Backend: Node.js, Express.js
- Database: MongoDB
- Environment Variables: dotenv
- Security & CORS Handling: cors
```

## Installation
### Prerequisites
Ensure you have the following installed on your system:
```txt
- Node.js
- MongoDB
```

### Steps
```sh
# Clone the repository
git clone https://github.com/yourusername/legacy-library-server.git

# Navigate to the project directory
cd legacy-library-server

# Install dependencies
npm install

# Create a .env file in the root directory and configure it
```

#### .env File Example
```env
PORT=5000
DB_USER=your_mongodb_user
DB_PASS=your_mongodb_password
```

## Running the Server
```sh
npm start
```
The server will run on `http://localhost:5000` by default.

## API Endpoints
### Base URL: `http://localhost:5000`
#### Book Routes
```http
POST   /books               # Add a new book
GET    /books               # Retrieve all books
GET    /books/:id           # Retrieve book details by ID
DELETE /books/:id           # Delete a book by ID
```

#### User Routes
```http
POST   /user/signup         # Register a new user
POST   /user/login          # Authenticate a user
GET    /user/:id            # Retrieve user details by ID
```

#### Borrowing Routes
```http
POST   /borrow              # Borrow a book
GET    /borrow/:userId      # Get user's borrowed books
PUT    /return/:id          # Return a borrowed book
```

## Deployment
You can deploy this project on cloud platforms like:
```txt
- Vercel
- Render
- Railway
- Heroku
```

## License
```txt
This project is licensed under the ISC License.
```

## Contributors
```txt
- Chan Badsha Bhuiyan (Developer)
```

## Contact
For any inquiries or issues, feel free to reach out.

