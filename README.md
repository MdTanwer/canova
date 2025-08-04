# Canova - Advanced Form Builder Platform

Canova is a comprehensive, full-stack form builder application that enables users to create, manage, and analyze dynamic forms with advanced features like conditional logic, real-time analytics, and collaborative project management.

## 🚀 Features

### Core Functionality
- **Multi-page Form Creation**: Build complex forms with multiple pages and sections
- **Rich Question Types**: Support for text, multiple choice, checkboxes, dropdowns, date/time, rating scales, linear scales, and file uploads
- **Reference Media**: Add images and videos to questions for better context
- **Conditional Logic**: Create dynamic forms that adapt based on user responses
- **Project Organization**: Group forms into projects for better management
- **Real-time Analytics**: Track form views, responses, and performance metrics
- **Public/Private Sharing**: Share forms publicly or keep them private
- **Collaborative Workspaces**: Multi-user project collaboration

### Advanced Features
- **Form View Tracking**: Automatic tracking of form access and engagement
- **Dynamic Analytics Dashboard**: Comprehensive project and form analytics
- **Form Response Management**: Collect, store, and analyze form submissions
- **User Authentication**: Secure JWT-based authentication system
- **File Upload Support**: Cloudinary integration for media uploads
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, bcrypt

**Frontend:**
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Custom components with React Icons
- **Charts**: Recharts for analytics visualization
- **Notifications**: React Toastify

## 📁 Project Structure

```
canova/
├── backend/                 # Node.js/Express backend
│   ├── app.ts              # Main application entry point
│   ├── controllesr/        # Business logic controllers
│   ├── middlewares/        # Custom middleware functions
│   ├── models/             # MongoDB/Mongoose models
│   ├── routers/            # API route definitions
│   ├── utils/              # Utility functions
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API integration layer
│   │   ├── context/        # React context providers
│   │   ├── features/       # Feature-specific components
│   │   ├── styles/         # CSS styles
│   │   └── types/          # TypeScript type definitions
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 🔧 Backend Documentation

### Core Components

#### Models
The backend uses MongoDB with Mongoose for data modeling:

- **User.ts**: User authentication and profile management
- **Project.ts**: Project organization and collaboration
- **formbuilderForm.ts**: Main form structure and configuration
- **Question.ts**: Individual question definitions and types
- **FormResponse.ts**: User responses and submissions
- **Page.ts**: Multi-page form structure
- **Section.ts**: Form section organization
- **condition.ts**: Conditional logic rules
- **Reference.ts**: Media references for questions
- **DailyViews.ts**: Analytics and view tracking

#### Controllers
Business logic is organized into controllers:

- **User Controller**: Authentication, registration, profile management
- **Project Controller**: Project CRUD operations, analytics
- **Form Controller**: Form creation, editing, publishing, sharing
- **Question Controller**: Question management and validation
- **Response Controller**: Form submission handling
- **Analytics Controller**: View tracking and statistics

#### API Routes

**User Routes** (`/api/users`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

**Project Routes** (`/api/project`)
- `GET /` - Get user projects
- `POST /` - Create new project
- `PUT /rename/:id` - Rename project
- `DELETE /:id` - Delete project
- `GET /analytics/:projectId` - Get project analytics

**Form Routes** (`/api/form`)
- `GET /` - Get user forms
- `POST /` - Create new form
- `PUT /rename/:id` - Rename form
- `DELETE /:id` - Delete form
- `GET /share/:formId` - Get shareable form URL
- `POST /views/:uniqueUrl` - Increment form views
- `GET /public/:uniqueUrl` - Public form access

**Question Routes** (`/api/question`)
- `POST /` - Create question
- `PUT /:id` - Update question
- `DELETE /:id` - Delete question
- `GET /form/:formId` - Get form questions

#### Middleware
- **Authentication**: JWT token validation
- **Error Handling**: Centralized error management
- **CORS**: Cross-origin resource sharing configuration
- **Security**: Helmet for security headers
- **Logging**: Morgan for request logging

#### Database Schema

**Key Relationships:**
- Users can have multiple Projects
- Projects can contain multiple Forms
- Forms can have multiple Pages
- Pages can have multiple Sections
- Sections can have multiple Questions
- Questions can have Reference media
- Forms can have Conditions for logic
- Forms track Views and Responses

### Environment Configuration
Required environment variables:
```env
MONGO_URI=mongodb://localhost:27017/canova
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## 🎨 Frontend Documentation

### Core Architecture

#### Pages
- **Home**: Dashboard with projects and forms overview
- **ProjectPage**: Individual project management
- **FormBuilderPage**: Form creation and editing interface
- **AnalyticsPage**: Form and project analytics
- **FormAnalysis**: Detailed form performance analysis
- **PublicAccess**: Public form viewing and submission
- **Authentication**: Login and registration pages

#### Components

**Core Components:**
- **ProjectCard**: Display project/form cards with actions
- **FormBuilder**: Drag-and-drop form creation interface
- **QuestionEditor**: Individual question editing
- **ShareLink**: Form sharing functionality
- **Analytics Dashboard**: Charts and metrics display
- **Sidebar**: Navigation and project organization

**UI Components:**
- **Modal**: Reusable modal dialogs
- **Tooltip**: Interactive tooltips
- **Toast**: Notification system
- **Loading**: Loading states and spinners
- **Forms**: Input components and validation

#### State Management
- **AuthContext**: User authentication state
- **ProjectContext**: Project and form data management
- **Local State**: Component-level state with React hooks

#### API Integration
- **formBuilderApi.ts**: Centralized API calls
- **Axios Configuration**: HTTP client setup
- **Error Handling**: Consistent error management
- **Authentication**: JWT token management

### Key Features Implementation

#### Form Builder
- **Drag & Drop Interface**: Intuitive form creation
- **Real-time Preview**: Live form preview
- **Question Types**: Support for 10+ question types
- **Conditional Logic**: Dynamic form behavior
- **Multi-page Support**: Complex form structures

#### Analytics Dashboard
- **View Tracking**: Automatic form view counting
- **Response Analytics**: Submission statistics
- **Performance Metrics**: Form engagement data
- **Visual Charts**: Recharts integration
- **Export Capabilities**: Data export functionality

#### Project Management
- **Project Organization**: Group forms by project
- **Collaboration**: Multi-user project access
- **Permissions**: Role-based access control
- **Sharing**: Public and private form sharing

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd canova
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with required variables
   cp .env.example .env
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

### Development Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 API Documentation

### Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **CORS Protection**: Configured cross-origin policies
- **Helmet Security**: Security headers and protection
- **Input Validation**: Server-side validation
- **Rate Limiting**: API rate limiting (configurable)

## 📈 Analytics & Tracking

- **Form Views**: Automatic view tracking
- **Response Analytics**: Submission statistics
- **User Engagement**: Interaction metrics
- **Performance Monitoring**: Form performance data
- **Export Capabilities**: Data export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using modern web technologies**
