# Task Tracker Client

## Overview

Task Manager is a modern web application designed to streamline task management across teams with different roles. It features a role-based workflow where submitters can create tasks and approvers can review, approve, or reject them before they are marked as done. The application provides an intuitive drag-and-drop interface, real-time updates, and analytics to monitor task progress.

## Local Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Docker Setup

For containerized deployment with both frontend and backend, see our [task-tracker-orchestration](https://github.com/NireekshaHuns/EVident-Battery-Orchestration-Service) repository which contains the Docker Compose configuration.

### Local Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

That's it! The application will be available at http://localhost:3000

## Features

- **Role-based Access Control**: Different functionalities for submitters and approvers
- **Task Management**:
  - Create, edit, and delete tasks (submitters)
  - Approve, reject, and track tasks (approvers)
  - Drag-and-drop interface for status updates
- **Visual Status Indicators**: Color-coded status for quick identification
- **Activity Logging**: Complete audit trail of all task activities
- **Analytics Dashboard**: Visual insights into task status distribution and trends
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Support for user preference

## Technologies Used

### Core Framework

- **React**: Front-end UI library for building interactive interfaces
- **TypeScript**: For type safety and better development experience
- **Vite**: Next-generation frontend tooling for faster development

### State Management & Data Fetching

- **React Query**: For server state management, caching, and data fetching
- **Zustand**: Lightweight state management for authentication and user data

### UI Components & Styling

- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Component library built on Radix UI and Tailwind CSS
- **Recharts**: Composable charting library for data visualization

### Additional Tools

- **date-fns**: Modern JavaScript date utility library
- **Sonner**: Toast notifications for user feedback
- **Lucide React**: Icon set for consistent visual language
- **ESLint/Jest**: For code quality and testing

## Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── _tests_/            # Test files
│   ├── assets/             # Project assets (images, etc.)
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Library code and utilities
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── index.css           # Global CSS
│   ├── main.tsx            # Entry point
│   └── vite-env.d.ts       # Vite environment types
├── .dockerignore           # Docker ignore file
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── components.json         # shadcn/ui components config
├── Dockerfile.dev          # Development Docker configuration
├── Dockerfile.prod         # Production Docker configuration
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── jest.config.cjs         # Jest configuration
├── jest.setup.js           # Jest setup
├── package-lock.json       # Dependency lock file
├── package.json            # Project dependencies
├── README.md               # Project documentation
├── tailwind.config.tsx     # Tailwind CSS configuration
├── tsconfig.app.json       # TypeScript config for app
└── tsconfig.jest.json      # TypeScript config for tests
```

## Testing

Run the test suite with:

```bash
npm test
```

We use Jest for unit testing and React Testing Library for component tests.

## Deployment

The application can be built for production with:

```bash
npm run build
```

This will create an optimized build in the `dist` directory that can be deployed to any static hosting service.

## API Documentation

The application communicates with a REST API with the following endpoints:

### Task Endpoints

- `GET /tasks` - Retrieve tasks (filterable by status)
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

### Log Endpoints

- `GET /logs` - Retrieve activity logs (with filtering options)

### Authentication Endpoints

- `POST /auth/login` - Authenticate user and get JWT token
- `POST /auth/register` - Register a new user
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user information
- `POST /auth/logout` - Invalidate the current session

See the API documentation for detailed request/response formats.

## Security Considerations

- Authentication is implemented using JWT tokens
- Token refresh mechanism prevents frequent re-authentication
- Role-based access control (RBAC) restricts operations based on user roles
- Sensitive operations require appropriate role permissions
- Input validation is performed on both client and server

## Contributing

Please see CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
