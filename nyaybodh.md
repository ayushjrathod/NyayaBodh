# NyayBodh Client (Frontend) Documentation

This document provides a comprehensive overview of the `client2` directory, which contains the frontend application for the NyayBodh project. It is designed to assist LLMs in understanding the codebase structure, technologies, and key components to answer questions related to the frontend.

## 1. Project Overview

**NyayBodh Client** is a modern React-based web application built with Vite. It serves as the user interface for the NyayBodh legal tech platform, offering features such as legal search (keyword and semantic), document generation, chatbot assistance, and legal resource access.

### Key Technologies

*   **Framework**: [React](https://react.dev/) (v18)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: JavaScript (ES Modules)
*   **Styling**:
    *   [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
    *   [NextUI](https://nextui.org/) (UI Component Library)
    *   [Framer Motion](https://www.framer.com/motion/) (Animations)
    *   [Lucide React](https://lucide.dev/) (Icons)
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & React Redux
*   **Routing**: [React Router DOM](https://reactrouter.com/) (v7)
*   **HTTP Client**: [Axios](https://axios-http.com/)
*   **Authentication**:
    *   Custom JWT Authentication
    *   [Auth0](https://auth0.com/) (`@auth0/auth0-react`)
    *   Google OAuth (`@react-oauth/google`)
*   **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
*   **Internationalization**: [i18next](https://www.i18next.com/) & `react-i18next`
*   **PDF Handling**: `react-pdf`, `@react-pdf-viewer/core`

## 2. Project Structure

The project follows a modular structure within the `src` directory.

```
client2/
├── public/                 # Static assets (locales, JSON data)
├── src/
│   ├── api/                # API configuration and interceptors
│   ├── assets/             # Images, fonts, and other static files
│   ├── components/         # Reusable React components
│   │   ├── Auth/           # Authentication related components
│   │   ├── DocGen/         # Document generation forms and components
│   │   ├── Layout/         # Layout wrappers (Header, Footer, Sidebar)
│   │   ├── Navbar/         # Navigation bar component
│   │   ├── Results/        # Search result display components
│   │   ├── ScreenReader/   # Accessibility: Screen reader functionality
│   │   ├── SpeechToText/   # Accessibility: Speech-to-text functionality
│   │   └── ui/             # Generic UI components (Atoms, Molecules, Organisms)
│   ├── config/             # Configuration files
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components (Route targets)
│   │   ├── Auth/           # Login, Register, Forgot Password pages
│   │   ├── Chatbot/        # Chatbot interface page
│   │   ├── Dashboard/      # Admin dashboard
│   │   ├── DocGen/         # Document generation landing and selection
│   │   ├── Landing/        # Home/Landing pages (Search, Semantic Search)
│   │   ├── Result/         # Search results page
│   │   └── ...             # Other feature pages (Profile, Resources, etc.)
│   ├── services/           # Business logic and API service modules
│   ├── store/              # Redux store setup and slices
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main application component and routing
│   ├── AppContainer.jsx    # Wrapper for app-wide logic
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

## 3. Detailed File Reference

### 3.1. Core Files
*   **`src/main.jsx`**: The entry point. Wraps the app with `NextUIProvider`, Redux `Provider`, `AccessibilityProvider`, and `ToastProvider`.
*   **`src/App.jsx`**: Defines the application routing using `react-router-dom`. Implements lazy loading for performance and handles global error boundaries.
*   **`src/AppContainer.jsx`**: A wrapper component that likely handles app-wide initialization logic or layout constraints.

### 3.2. API (`src/api/`)
*   **`axios.js`**: Configures the global Axios instance.
    *   Sets the `baseURL` from environment variables or a default fallback.
    *   **Request Interceptor**: Attaches the JWT token from `localStorage` to the `Authorization` header.
    *   **Response Interceptor**: Handles global errors (e.g., redirects to login on 401) and logs responses.

### 3.3. Components (`src/components/`)

#### Auth (`src/components/Auth/`)
*   **`ProtectedRoute.jsx`**: A wrapper for routes that require authentication. Redirects unauthenticated users to `/login`.
*   **`PublicRoute.jsx`**: A wrapper for routes accessible only to unauthenticated users (like Login/Register). Redirects authenticated users to the dashboard or home.

#### DocGen (`src/components/DocGen/`)
Contains forms and logic for generating specific legal documents.
*   **`GenAIClause.jsx`**: A tool that allows users to upload a PDF and a custom clause, sending it to an external API (`whale-legal-api`) to generate a modified document.
*   **`AOS/`, `DOSF/`, `NDA/`, etc.**: Directories containing specific form components for different document types (Agreement of Sale, Deed of Sale, Non-Disclosure Agreement, etc.).

#### Layout (`src/components/Layout/`)
*   **`Layout.jsx`**: The main layout component used by most pages. It renders the `NewNavBar` and the page content via `<Outlet />`.

#### Navbar (`src/components/Navbar/`)
*   **`NewNavbar.jsx`**: The main navigation bar.
    *   Displays links based on authentication state.
    *   Includes the `GoogleTranslate` widget and `LanguageSwitcher`.
    *   Includes the Theme Toggle (Light/Dark mode).
    *   Handles User Logout.

#### Results (`src/components/Results/`)
*   **`EntityResult.jsx`**: Renders a single search result item for "Entity" search mode. Includes buttons to navigate to details, chat with the document, or view recommendations.
*   **`SemanticResults.jsx`**: Renders a single search result item for "Semantic" search mode. Similar functionality to `EntityResult` but tailored for semantic matches.
*   **`Filters.jsx`, `EntityFilters.jsx`, `SemanticFilters.jsx`**: Components for filtering search results (e.g., by date, court, judge).

#### UI (`src/components/ui/`)
A collection of reusable UI components, likely following Atomic Design principles or just grouped by complexity.
*   **`AccessibilityProvider.jsx`**: Manages accessibility context.
*   **`EnhancedLoader.jsx`**: A custom loading spinner component.
*   **`ToastProvider.jsx`**: Manages toast notifications.
*   **`ScreenReader/`**: Components related to text-to-speech functionality.

### 3.4. Pages (`src/pages/`)

#### Auth (`src/pages/Auth/`)
*   **`Login.jsx`**: User login page.
*   **`ForgotPassword.jsx`**: Password recovery page.
*   **`ResetPassword.jsx`**: Page to set a new password.

#### Chatbot (`src/pages/Chatbot/`)
*   **`Chatbot.jsx`**: The AI Chatbot interface.
    *   Allows users to chat with a specific legal document (`id` from URL).
    *   Handles message streaming and state (sending, preparing, ready).
    *   Renders responses using `ReactMarkdown`.

#### Dashboard (`src/pages/Dashboard/`)
*   **`AdminDashboard.jsx`**: A protected page for administrators.
    *   Lists all registered users.
    *   Allows creating, updating, and deleting users.
    *   Uses `adminSlice` for state management.

#### Landing (`src/pages/Landing/`)
*   **`LandingSearch.jsx`**: The main home page for authenticated users.
    *   Features a prominent search bar.
    *   Integrates Speech-to-Text (`useSpeechToText`).
    *   Navigates to `/results` on search.
*   **`LandingSearchSemantic.jsx`**: A variation of the landing page focused on semantic search.
*   **`PublicLanding.jsx`**: The landing page shown to unauthenticated users (`/welcome`).

#### Result (`src/pages/Result/`)
*   **`Results.jsx`**: The search results page.
    *   Parses query parameters (`q`, `type`) from the URL.
    *   Fetches results from the backend.
    *   Implements client-side caching (`searchCache`).
    *   Renders either `EntityResult` or `SemanticResult` components based on the search type.

### 3.5. Hooks (`src/hooks/`)
*   **`useAuth.js`**: A custom hook that simplifies access to authentication state. Returns `{ isAuthenticated, userRole, isAdmin, isUser }`.
*   **`useSpeechToText`**: (Inferred) Manages microphone access and speech recognition logic.
*   **`useToast.js`**: Provides access to toast notification functions.

### 3.6. Services (`src/services/`)
*   **`authService.js`**: Contains functions for API calls related to auth (`loginUser`, `registerUser`, `logoutUser`). Manages `localStorage` updates.

### 3.7. Store (`src/store/`)
*   **`store.js`**: Configures the Redux store, combining reducers.
*   **`slices/authSlice.js`**: Manages authentication state (`isAuthenticated`, `userRole`). Initializes state from `localStorage`.
*   **`slices/adminSlice.js`**: Manages admin-related state (user lists, CRUD operations).
*   **`slices/themeSlice.js`**: Manages the application theme (light/dark).
*   **`slices/userSlice.js`**: Manages current user profile data.

### 3.8. Utils (`src/utils/`)
*   **`utils.js`**: General utility functions. Includes `cn` (classnames helper using `clsx` and `tailwind-merge`) for conditional class merging.
*   **`themeUtils.js`**: Utilities related to theming.

## 4. Configuration

### Environment Variables
*   `VITE_API_BASE_URL`: URL of the backend API.

### Tailwind Configuration
Custom colors and extensions are defined in `tailwind.config.js` to match the NyayBodh branding.

### Auth0 Configuration
`src/auth_config.json` contains the Domain and Client ID for Auth0 integration.

## 5. Development Commands

*   `npm run dev`: Start the development server.
*   `npm run build`: Build the application for production.
*   `npm run preview`: Preview the production build locally.
*   `npm run lint`: Run ESLint to check for code quality issues.
