# FRAMELO Social Media App Design Document

## Frontend Architecture

### Tech Stack
- **Node.js**: Runtime environment
- **Vite**: Build tool for fast development
- **React**: UI library for component-based development
- **JavaScript or TypeScript**: Programming language (recommend TypeScript for type safety)
- **CSS / Tailwind / custom styles**: Styling approach
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing

### Frontend Structure

```
src/
├── components/          # Reusable UI components (buttons, modals, cards)
├── pages/              # Page-level components (Home, Profile, etc.)
├── layouts/            # Layout components (header, sidebar, footer)
├── context/            # React context for global state (auth, theme)
├── hooks/              # Custom React hooks (useAuth, usePosts)
├── services/           # API service functions (axios instances, endpoints)
├── styles/             # Global styles, Tailwind config, theme variables
└── main.jsx            # App entry point, router setup
```

#### Folder Purposes
- **components/**: Contains atomic and molecular UI components that can be reused across pages
- **pages/**: Top-level components representing entire screens/routes
- **layouts/**: Wrapper components that provide consistent structure (navigation, footer)
- **context/**: Global state management using React Context API
- **hooks/**: Custom hooks for logic reuse (API calls, local storage)
- **services/**: Centralized API communication logic
- **styles/**: CSS files, utility classes, design tokens
- **main.jsx**: Root component with router configuration

## UI/UX Flow

### Auth Screens

#### Login Page UX
- Clean form with email/password fields
- "Remember me" checkbox
- "Forgot password" link
- Social login options (Google, etc.)
- Form validation: Real-time feedback on invalid inputs
- Error handling: Inline error messages for wrong credentials
- Loading states: Disabled form during submission with spinner
- Success: Redirect to home feed with welcome message

#### Signup Page UX
- Multi-step form: Basic info → Profile setup → Verification
- Email verification flow with OTP
- Password strength indicator
- Terms & conditions checkbox
- Validation: Client-side validation with clear error messages
- Loading: Progress bar for multi-step process
- Error: Highlight invalid fields, show server errors

### Home Feed

#### Infinite Scrolling
- Load initial 20 posts
- Trigger next page when user scrolls to bottom (intersection observer)
- Loading indicator at bottom during fetch
- Error handling: Retry button if load fails

#### Feed Card Layout
- User avatar, name, timestamp
- Media content (image/video) with aspect ratio preservation
- Caption text with hashtag/link parsing
- Action buttons: Like, comment, share, save
- Engagement metrics: Like count, comment count

#### Interactions
- Like: Heart icon animation (fill/unfill with bounce)
- Comment: Expand comment section with smooth transition
- Save: Bookmark icon toggle with feedback
- Share: Modal with copy link, social share options

#### Animations
- Post entrance: Fade in from bottom
- Like animation: Scale and color transition
- Skeleton loading: Shimmer effect on placeholders

### Create Post

#### Media Selection
- Drag & drop or click to upload
- Support multiple files (up to 10)
- File type validation (images/videos only)
- Preview grid for selected files

#### Preview & Edit
- Full-screen preview with crop/rotate tools
- Caption input with character counter (2200 limit)
- Hashtag suggestions as user types
- Location tagging with autocomplete

#### Upload Flow
- Progress bar showing upload percentage
- Cancel option during upload
- Success: Redirect to post with confirmation
- Error: Retry with exponential backoff

### Profile Page

#### Header Layout
- Profile picture (clickable for zoom)
- Bio, follower/following counts
- Edit profile button (own profile) or follow button
- Settings gear icon

#### Posts Grid
- Masonry layout for mixed media
- Infinite scroll within profile
- Filter tabs: Posts, Tagged, Saved

#### Follow/Unfollow
- Button states: Follow, Following, Requested
- Confirmation modal for unfollow
- Real-time count updates

#### Edit Profile
- Modal with form fields
- Avatar upload with crop
- Bio text area with counter
- Privacy settings toggle

### Stories UI

#### Story Bar
- Horizontal scrollable list of story circles
- User's story first, then following users
- Unseen stories highlighted with gradient border
- Add story button (+) for own story

#### Story Viewer Modal
- Full-screen overlay
- Progress bar at top (segments per story)
- Tap left/right to navigate stories
- Swipe up for user profile
- Auto-advance after 5 seconds

#### Navigation
- Tap zones: Left half previous, right half next
- Long press to pause
- Close button (X) in top-right

### Discover Page

#### Trending Content Grid
- Grid layout with featured posts
- Category tabs: For You, Trending, Following
- Refresh button with pull-to-refresh

#### Search UI
- Search bar with magnifying glass icon
- Real-time suggestions as user types
- Recent searches dropdown
- Voice search option

#### Search Results
- Filter tabs: Accounts, Tags, Places
- Sort options: Relevance, Recent, Popular
- Load more button for pagination

### Chat UI

#### Chat List Screen
- List of conversations sorted by last message
- Unread count badges
- Online status indicators
- Search conversations bar

#### Message Bubbles
- Sent messages: Right-aligned, blue background
- Received: Left-aligned, gray background
- Timestamp on hover/tap
- Delivery/read status icons

#### Typing Indicator
- "Typing..." text with animated dots
- Shows for 3 seconds after last keystroke

#### Read Receipts
- Double checkmark for delivered
- Blue checkmarks for read
- Timestamp for last seen

### Settings

#### Account Settings
- Profile information form
- Password change with confirmation
- Email preferences toggles
- Account deactivation option

#### Privacy Toggles
- Private account switch
- Story visibility controls
- Comment controls (everyone/following/off)
- Tagged post approval

#### Logout Modal
- Confirmation dialog: "Are you sure?"
- Cancel/Logout buttons
- Clear local data option

## Animated Background Design

### Overview
FRAMELO's animated background creates a living, immersive atmosphere that enhances the social media experience without distracting from content. The design focuses on subtle motion, premium aesthetics, and performance optimization for long-term viewing.

### Design Philosophy
- **Living Atmosphere**: Background feels alive and dynamic, not static
- **Subtle Motion**: Calm, meditative animations that don't compete for attention
- **Premium Feel**: Elegant, cinematic depth with smooth transitions
- **Accessibility-First**: Respects reduced motion preferences and ensures readability

### Color Palette
- **Base Colors**: Deep charcoal (#1a1a1a), dark navy (#0f1419)
- **Accent Colors**: Muted purple (#2d1b69), cool blue (#1e3a5f), soft pink (#e6a8c7)
- **Rules**: No neon, smooth blending, works in light/dark/bw themes

### Layered Structure

#### Layer 1: Atmospheric Foundation
- **Visual**: Full-screen gradient with slow directional shifts
- **Animation**: 120s gradient shift cycle
- **Purpose**: Sets emotional tone and depth

#### Layer 2: Orbital Motion Elements
- **Visual**: Blurred geometric shapes (circles, ellipses) in low-opacity gradients
- **Animation**: Orbital paths with rotation, translation, and scaling (45-95s cycles)
- **Purpose**: Adds life and premium feel through subtle floating elements

#### Layer 3: Particle Drift System
- **Visual**: Small particles drifting upward with rotation
- **Animation**: Linear drift with opacity fade (25-35s cycles)
- **Purpose**: Enhances atmospheric depth

#### Layer 4: Depth Parallax Enhancement
- **Visual**: Multi-speed motion layers creating parallax effect
- **Animation**: Foreground/background elements at different speeds (60-105s cycles)
- **Purpose**: Cinematic immersion with soft depth

#### Layer 5: Focus Zone Protection
- **Visual**: Calmer animation areas behind UI elements
- **Animation**: Reduced opacity and motion near forms/cards
- **Purpose**: Perfect readability and visual hierarchy

### Animation Behavior
- **Easing**: Cubic-bezier curves for smooth, natural motion
- **Speed**: Very slow (45-120s cycles) for meditative viewing
- **No Loops**: Endless, non-repeating feel
- **Responsiveness**: Adapts to scroll and user interactions subtly

### Accessibility & UX Safety
- **Reduced Motion**: Static fallback when `prefers-reduced-motion` enabled
- **Focus Zones**: Animation calms behind text inputs and forms
- **High Contrast**: Text remains readable with proper contrast ratios
- **Device Adaptation**: Reduced motion on mobile for battery efficiency

### Performance Strategy
- **GPU-Friendly**: CSS transforms and opacity changes
- **Lightweight**: Limited to 20-50 elements per screen
- **Graceful Degradation**: Falls back to static gradient on low-end devices
- **Battery-Safe**: No video backgrounds, optimized for mobile

### Implementation Notes
- **CSS-Based**: Pure CSS animations with keyframes
- **Theme Integration**: Adapts to light/dark/bw modes
- **Mobile Optimization**: Slower animations on smaller screens
- **Respect Preferences**: Honors system accessibility settings

## UI/UX Rules

- **Mobile-first**: Design for mobile, enhance for desktop
- **Responsive**: Breakpoints at 768px, 1024px, 1440px
- **Transitions**: 200ms ease-in-out for all state changes
- **Minimal Layout**: White space, clean typography, subtle shadows
- **Themes**: Light/dark mode toggle with smooth transition
- **Components**: Design system with consistent spacing, colors, typography

## Frontend Security Logic

- **Token Storage**: HTTP-only cookies for access tokens, localStorage for refresh
- **Protected Routes**: Route guards checking auth state
- **Auto-logout**: On token expiry or 401 responses
- **Error Boundaries**: Catch React errors, show fallback UI

## Backend Architecture

### Tech Stack
- **Python**: Programming language
- **FastAPI**: Web framework for APIs
- **Uvicorn**: ASGI server
- **PostgreSQL**: Database
- **SQLAlchemy**: ORM
- **Alembic**: Database migrations
- **Firebase Auth**: Authentication service

### Backend Structure

```
backend/
├── main.py              # FastAPI app instance, route includes
├── database.py          # Database connection, session management
├── models/              # SQLAlchemy models (User, Post, etc.)
├── schemas/             # Pydantic schemas for request/response validation
├── routers/             # API route handlers (auth, users, posts)
├── services/            # Business logic layer (email, notifications)
├── utils/               # Helper functions (password hashing, file upload)
└── .env                 # Environment variables
```

#### Layer Purposes
- **main.py**: Application entry point, middleware setup
- **database.py**: Database configuration and connection
- **models/**: Database table definitions
- **schemas/**: Data validation and serialization
- **routers/**: HTTP endpoint definitions
- **services/**: Complex business logic
- **utils/**: Utility functions
- **.env**: Configuration secrets

## Database Design

### Tables and Relationships

#### Users
- id (PK)
- email (unique)
- username (unique)
- password_hash
- full_name
- bio
- profile_pic_url
- is_private
- created_at

#### Posts
- id (PK)
- user_id (FK to Users)
- media_urls (JSON array)
- caption
- location
- created_at
- is_deleted

#### Stories
- id (PK)
- user_id (FK to Users)
- media_url
- expires_at
- created_at

#### Comments
- id (PK)
- post_id (FK to Posts)
- user_id (FK to Users)
- parent_id (FK to Comments, nullable)
- content
- created_at

#### Likes
- id (PK)
- user_id (FK to Users)
- post_id (FK to Posts, nullable)
- comment_id (FK to Comments, nullable)
- created_at

#### Followers
- id (PK)
- follower_id (FK to Users)
- following_id (FK to Users)
- status (pending/accepted)
- created_at

#### SavedPosts
- id (PK)
- user_id (FK to Users)
- post_id (FK to Posts)
- created_at

#### Messages
- id (PK)
- sender_id (FK to Users)
- receiver_id (FK to Users)
- content
- is_read
- created_at

#### Notifications
- id (PK)
- user_id (FK to Users)
- type (like, comment, follow, etc.)
- reference_id (FK to relevant table)
- is_read
- created_at

### Database Rules
- **Primary Keys**: Auto-incrementing integers
- **Foreign Keys**: With CASCADE on delete for relationships
- **Indexing**: On frequently queried fields (user_id, created_at, etc.)
- **Constraints**: Unique constraints on emails/usernames

## API Module Design

### Auth
- **Token Verification**: Validate Firebase tokens on each request
- **User Creation**: Create user record on first login
- **Secure Validation**: Input sanitization, rate limiting

### Users
- **Profile Fetch/Update**: GET/PUT endpoints with ownership checks
- **Follow/Unfollow**: Toggle relationship with notification trigger
- **Privacy**: Filter content based on follow status

### Posts
- **Creation**: Upload media to cloud storage, create post record
- **Feed Generation**: Algorithmic sorting (recent + engagement)
- **Like/Save**: Toggle actions with real-time updates

### Stories
- **Upload**: Store media, set 24h expiry
- **Auto-expiry**: Background job to delete expired stories
- **Viewer Tracking**: Log views for analytics

### Comments
- **Nested Comments**: Support threaded replies
- **Like/Unlike**: Toggle on comments
- **Deletion**: Soft delete with cascade to replies

### Chat
- **Conversation Creation**: Auto-create on first message
- **Message Flow**: Real-time via WebSockets
- **Read Receipts**: Update on message fetch

### Notifications
- **Triggers**: Events create notification records
- **Fetch**: Paginated list with unread count
- **Mark as Read**: Bulk update endpoint

## Backend Security

- **Token Validation**: Firebase JWT verification on protected routes
- **RBAC**: User roles (admin, moderator) for admin endpoints
- **Rate Limiting**: Per-user limits on API calls
- **Input Validation**: Pydantic schemas prevent malicious data
- **Error Handling**: Generic error responses, no sensitive data leaks

## Performance & Scalability

- **Pagination**: Cursor-based pagination for feeds
- **Caching**: Redis for user sessions, post metadata
- **Query Optimization**: Indexes, select only needed fields
- **Media Handling**: CDN for static assets, compression

## Component Responsibility Breakdown

### Atomic Components
- **Button**: Variants (primary, secondary, icon), loading states, disabled
- **Input**: Text, email, password with validation feedback
- **Modal**: Overlay, close handlers, backdrop click
- **Avatar**: Circular images with fallback initials
- **Icon**: SVG icons with theme support

### Molecular Components
- **FeedCard**: Post display with media, actions, engagement
- **CommentSection**: Nested comments with replies
- **StoryCircle**: Profile avatar with seen/unseen states
- **MessageBubble**: Sent/received styling with timestamps

### Page Components
- **HomeFeed**: Infinite scroll container, post list
- **Profile**: Header + grid layout
- **CreatePost**: Multi-step wizard
- **Chat**: Conversation list + message view

## State Management Strategy

### Global State (Context)
- **AuthContext**: User session, login/logout
- **ThemeContext**: Light/dark mode toggle
- **NotificationContext**: Toast messages, alerts

### Local State (useState/useReducer)
- **Feed State**: Posts array, loading, pagination cursor
- **Form State**: Validation errors, submission status
- **Modal State**: Open/close, content data

### Server State (React Query)
- **Posts**: Caching, background refetch, optimistic updates
- **User Profile**: Stale-while-revalidate
- **Notifications**: Real-time updates via polling/WebSockets

## API Integration Strategy

### Axios Configuration
- **Base URL**: Environment-based API endpoint
- **Interceptors**: Request (auth headers), Response (error handling)
- **Timeout**: 10s for uploads, 5s for regular requests

### Error Handling
- **Network Errors**: Retry with exponential backoff
- **Auth Errors**: Auto-logout, redirect to login
- **Validation Errors**: Display field-specific messages

### Real-time Updates
- **WebSockets**: For chat, notifications
- **Polling**: Fallback for older browsers
- **Optimistic UI**: Update UI immediately, rollback on failure

## Build & Run Steps

### Development Setup
1. Install Node.js and npm
2. Clone repository
3. Run `npm install` to install dependencies
4. Create `.env` file with API base URL
5. Run `npm run dev` to start Vite dev server
6. Open http://localhost:5173 in browser

### Production Build
1. Run `npm run build` to create optimized bundle
2. Serve `dist/` folder with static server
3. Configure reverse proxy for API routes
4. Enable HTTPS with SSL certificate

## Deployment & Run Steps (Backend)

### Development Setup
1. Install Python 3.8+
2. Clone backend repository
3. Create virtual environment: `python -m venv venv`
4. Activate venv: `venv\Scripts\activate` (Windows)
5. Install dependencies: `pip install -r requirements.txt`
6. Set up PostgreSQL database
7. Run migrations: `alembic upgrade head`
8. Configure Firebase Auth credentials in `.env`
9. Run server: `uvicorn main:app --reload`
10. API available at http://localhost:8000

### Production Deployment
1. Use Docker for containerization
2. Deploy to cloud platform (AWS/GCP/Azure)
3. Set up PostgreSQL managed instance
4. Configure Redis for caching
5. Use reverse proxy (Nginx) with SSL
6. Set up monitoring and logging
7. Run with Gunicorn/Uvicorn workers