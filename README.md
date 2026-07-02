# AI Roadmap Tracker - AlgoMentor

An intelligent competitive programming learning platform that generates personalized learning roadmaps, tracks progress, identifies weaknesses, and recommends optimal practice problems from multiple platforms.

## 🎯 Overview

AlgoMentor is a full-stack MERN application designed to help competitive programmers improve systematically. It combines:
- **AI-powered roadmap generation** for personalized learning paths
- **Multi-platform problem integration** (LeetCode, Codeforces)
- **Smart revision scheduling** using spaced repetition
- **Performance analytics** with weakness detection
- **Competitive leaderboards** for motivation
- **Admin dashboard** for system management

## ✨ Key Features

### For Users
- 📊 **Personalized Dashboards** - Real-time progress tracking and statistics
- 🎓 **Intelligent Roadmaps** - AI-generated learning paths based on skill level
- 💪 **Practice Engine** - Smart problem recommendations based on performance
- 🔄 **Revision System** - Spaced repetition-based revision scheduling
- 📈 **Progress Tracking** - Monitor improvements across topics and difficulty levels
- 🏆 **Leaderboards** - Compete globally and locally
- 🎯 **Weakness Analysis** - Identify weak areas and target them
- 📱 **Contest Integration** - Track contest submissions and performance

### For Admins
- ⚙️ **System Settings** - Manage platform configuration
- 👥 **User Management** - Monitor and manage users
- 📊 **Analytics Dashboard** - View platform-wide statistics

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Vue/React Router** - Navigation

### External APIs
- **LeetCode API** - Problem data
- **Codeforces API** - Contests and problems
- **CodeChef API** - Additional problem source

## 📁 Project Structure

```
.
├── backend/
│   ├── config/              # Database configuration
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── practiceController.js
│   │   ├── roadmapController.js
│   │   ├── leaderboardController.js
│   │   └── ...
│   ├── engines/             # Core algorithms
│   │   ├── practiceEngine.js
│   │   ├── revisionEngine.js
│   │   ├── roadmapEngine.js
│   │   ├── weaknessEngine.js
│   │   └── unlockEngine.js
│   ├── middleware/          # Authentication & custom middleware
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Topic.js
│   │   ├── UserProgress.js
│   │   ├── RevisionSnapshot.js
│   │   └── ...
│   ├── platforms/           # Problem platform integrations
│   │   ├── leetcode.js
│   │   ├── codeforces.js
│   │   └── simulatedPlatforms.js
│   ├── routes/              # API route definitions
│   ├── utils/               # Helper utilities
│   ├── seeders/             # Database seeders
│   ├── server.js            # Main server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Frontend utilities
│   │   └── App.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Dhrub404/algomentor.git
cd algomentor
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
# Create a .env file with:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=5000
# LEETCODE_API_URL=https://leetcode.com/api
# CODEFORCES_API_URL=https://codeforces.com/api

npm run seed        # Seed initial data
npm start          # Start the server
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables if needed
# Create a .env.local file with:
# VITE_API_URL=http://localhost:5000

npm run dev        # Start development server
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Dashboard
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/progress` - Get progress overview

### Practice
- `GET /api/practice/recommend` - Get recommended problems
- `POST /api/practice/submit` - Submit solution
- `GET /api/practice/history` - Get practice history

### Roadmap
- `GET /api/roadmap/current` - Get current roadmap
- `POST /api/roadmap/generate` - Generate new roadmap

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id` - Get topic details
- `GET /api/topics/:id/performance` - Get topic performance

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/regional` - Regional leaderboard

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## 🎮 Usage

### For New Users
1. **Register** an account with your email
2. **Complete profile** with your programming experience level
3. **Generate roadmap** to get your personalized learning path
4. **Start practicing** with recommended problems
5. **Track progress** on your dashboard

### For Returning Users
1. **Login** to your account
2. **View dashboard** for quick stats and progress
3. **Practice** recommended problems
4. **Review** weaker topics from weakness analysis
5. **Revise** previously solved problems using spaced repetition

## 🔧 Configuration

### Database Models

**User Model**
- Stores user profile, statistics, and account information
- Links to user progress, revision snapshots, and performance data

**Topic Model**
- Defines programming topics (Data Structures, Algorithms, etc.)
- Contains topic hierarchy and prerequisites

**UserProgress Model**
- Tracks progress on individual topics
- Stores solved problems and performance metrics

**RevisionSnapshot Model**
- Records problem revisions for spaced repetition
- Manages revision scheduling

**ProblemMapping Model**
- Maps problems from external platforms to internal topics

## 🧪 Testing

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:cover   # Generate coverage report
```

### Debug Mode
```bash
# Backend
npm run debug

# Check specific data
node backend/scratch/check_user.js
node backend/scratch/inspect_data.js
```

## 📊 Data Sources

- **LeetCode** - Over 3000+ problems with detailed difficulty ratings
- **Codeforces** - Contest problems and archives
- **CodeChef** - Additional practice problems
- **GeeksForGeeks** - Educational content and problems

## 🔐 Security

- JWT-based authentication
- Role-based access control (User/Admin)
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration for frontend

## 📈 Performance & Scaling

- MongoDB indexing for fast queries
- Efficient problem recommendation algorithms
- Spaced repetition system for optimal revision
- Caching strategies for frequently accessed data

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB URI in .env
# Ensure MongoDB is running
# For MongoDB Atlas, whitelist IP address
```

### API Errors
- Check console for detailed error messages
- Review API response in browser DevTools
- Verify authentication token is valid

### Problem Platform Integration
- Verify API endpoints are accessible
- Check rate limiting from external APIs
- Review platform documentation

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**AlgoMentor Team**

## 🙏 Acknowledgments

- LeetCode for problem data
- Codeforces for contest problems
- MongoDB for database
- React community for excellent libraries

## 📞 Support

For support, email dhurvmahajan983@gmail.com or open an issue on GitHub.

## 🎓 Educational Purpose

This project is designed for educational purposes to help competitive programmers improve their skills systematically through personalized learning paths and intelligent practice recommendations.
