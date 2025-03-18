# 📂 Project Structure Overview

This document provides an overview of the project structure, detailing key modules and components.

## 📁 `src/`
The main source folder containing the application code.

### 📌 `app/`
Contains the core application features and shared functionalities.

#### 🔹 `features/`
##### ✅ **Authentication**
- `auth/` → Authentication module
  - `login/` → User login functionality
  - `registration/` → User signup functionality
  - `password-reset/` → Password recovery
  - `social-login/` → OAuth integration (Google, GitHub, LinkedIn)
  - `two-factor-authentication/` → Enhanced security option
  - `email-verification/` → Account verification process
  - `session-management/` → Handling user sessions and timeouts
  - `permission-system/` → Role-based access controls

##### 📊 **Dashboard**
- `dashboard/`
  - `dashboard.component` → Main dashboard layout
  - `welcome-banner/` → Welcome section at the top of the dashboard
  - `course-catalog/` → Browse available courses
  - `enrolled-courses/` → User's enrolled courses
  - `progress-tracker/` → Learning progress visualization
  - `recommendation-engine/` → Personalized course suggestions
  - `learning-path-visualization/` → Visual learning roadmap
  - `activity-feed/` → Recent platform activities
  - `achievements/` → User badges and accomplishments
  - `deadlines-calendar/` → Upcoming assignment due dates
  - `skill-graph/` → Visual representation of skill development
  - `learning-streaks/` → Consecutive days of learning
  - `career-path-tracker/` → Career progress visualization
  - `course-completion-stats/` → Statistics on course completion

##### 🎓 **Course Management**
- `course/` → Course viewing feature
  - `course.module`
  - `course-details/` → Overview page for a specific course
  - `course-syllabus/` → Course outline and structure
  - `lesson-player/` → Video lesson player with controls
    - `speed-control/` → Video playback speed options
    - `transcript/` → Text version of video content
    - `download-options/` → Materials download functionality
    - `interactive-timestamp/` → Interactive timeline markers
    - `picture-in-picture/` → Detachable video player
    - `annotation-tools/` → Mark and annotate video content
  - `quiz/` → Quiz component
    - `quiz-timer/` → Timed quiz functionality
    - `quiz-results/` → Performance analytics
    - `retry-mechanism/` → Option to retake quizzes
  - `assignment/` → Assignment submission component
    - `submission-history/` → Track previous submissions
    - `plagiarism-checker/` → Academic integrity tool
    - `file-management/` → Upload and organize files
  - `discussion/` → Discussion/comment section
    - `threaded-comments/` → Nested conversation structure
    - `mention-system/` → Tag users in discussions
  - `resources/` → Additional resources section
  - `note-taking/` → In-course note system
  - `bookmark-system/` → Save important course sections
  - `feedback-system/` → Course rating and review
  - `peer-review/` → Student evaluation of assignments
  - `code-editor/` → Interactive coding environment
    - `auto-save/` → Automatic code saving
    - `version-control/` → Track code changes
    - `environment-selector/` → Choose coding environment
    - `code-snippets/` → Reusable code templates
    - `linting-tools/` → Code quality checking
  - `project-submission/` → Project upload and submission
  - `grading-system/` → Assessment and grading interface
  - `knowledge-check/` → Periodic understanding verification
  - `interactive-exercises/` → Hands-on practice activities
  - `content-accessibility/` → Accessible learning materials

##### 👤 **User Profile**
- `profile/`
  - `profile.module`
  - `user-info/` → Basic user information
  - `account-settings/` → Account preferences
  - `notifications/` → Notification settings
  - `certificates/` → Earned certificates
  - `learning-history/` → Past course activities
  - `skills-assessment/` → Skill evaluation tools
  - `resume-builder/` → CV generation based on completed courses
  - `social-links/` → Connect social media accounts
  - `privacy-settings/` → Data sharing preferences
  - `subscription-management/` → Manage subscriptions
  - `payment-methods/` → Billing options
  - `billing-history/` → Payment records
  - `goal-tracking/` → Personal learning objectives
  - `portfolio-builder/` → Showcase completed projects
  - `preference-center/` → Personalization options
  - `device-management/` → Manage connected devices

##### 🌍 **Community**
- `community/` → Community features
  - `community.module`
  - `forum/` → Discussion forum
  - `mentorship/` → Mentor connection
  - `study-groups/` → Collaborative learning
  - `live-events/` → Webinars and workshops
  - `expert-qa/` → Q&A with industry professionals
  - `student-projects-showcase/` → Portfolio display
  - `networking/` → Connect with peers
  - `job-board/` → Career opportunities
  - `peer-matching/` → Find study partners
  - `hackathons/` → Competitive coding events
  - `community-challenges/` → Group learning activities
  - `success-stories/` → Graduate testimonials
  - `resource-sharing/` → Exchange learning materials
  - `alumni-network/` → Graduate community

##### 👨‍🏫 **Instructor Features**
- `instructor/` → Tools for course creators
  - `instructor.module`
  - `course-creation/` → Course building tools
    - `content-editor/` → Rich text editing
    - `media-manager/` → Video and image management
    - `curriculum-designer/` → Structure course content
    - `assessment-creator/` → Create tests and quizzes
  - `student-management/` → Learner tracking
  - `analytics-dashboard/` → Performance metrics
  - `content-management/` → Lesson and resource manager
  - `announcement-system/` → Class-wide notifications
  - `grading-interface/` → Assignment evaluation
  - `feedback-collection/` → Gather student input
  - `office-hours/` → Virtual meeting scheduler
  - `plagiarism-detection/` → Academic integrity tools
  - `co-instructor-management/` → Team teaching tools
  - `teaching-assistant-system/` → TA management

##### 🔧 **Admin Panel**
- `admin/` → Administrative controls
  - `admin.module`
  - `user-management/` → User account administration
  - `content-moderation/` → Review and approve content
  - `system-settings/` → Platform configuration
  - `analytics-reporting/` → Usage statistics
  - `promotion-management/` → Marketing campaigns
  - `course-approval-system/` → Quality control for new courses
  - `support-ticket-management/` → Handle user issues
  - `fraud-detection/` → Identify suspicious activities
  - `platform-health-monitoring/` → System performance tracking
  - `feature-flag-management/` → Control feature rollout
  - `bulk-operations/` → Mass actions on users/content

##### 🔔 **Notifications**
- `notifications/` → User alerts system
  - `notifications.module`
  - `in-app-notifications/` → Platform alerts
  - `email-notifications/` → Email alert management
  - `push-notifications/` → Mobile device alerts
  - `notification-preferences/` → Alert settings
  - `notification-center/` → Centralized alert hub
  - `scheduled-reminders/` → Planned notifications

##### 🔍 **Search & Discovery**
- `search/` → Content discovery tools
  - `search.module`
  - `advanced-search/` → Detailed filtering
  - `search-history/` → Previous searches
  - `saved-searches/` → Bookmark queries
  - `category-browser/` → Topic exploration
  - `trending-content/` → Popular courses
  - `search-suggestions/` → Smart autocomplete
  - `voice-search/` → Audio query capability

##### 📊 **Analytics & Reporting**
- `analytics/` → Data insights
  - `analytics.module`
  - `learning-analytics/` → Education progress
  - `performance-dashboards/` → Metric visualizations
  - `custom-reports/` → Personalized data exports
  - `goal-tracking/` → Progress toward objectives
  - `comparative-analytics/` → Peer benchmarking
  - `predictive-insights/` → Future performance forecasting

##### 📱 **Mobile App Integration**
- `mobile-integration/` → Mobile platform connection
  - `mobile-integration.module`
  - `sync-service/` → Cross-device synchronization
  - `offline-content/` → Downloaded course management
  - `mobile-notifications/` → Phone/tablet alerts
  - `deep-linking/` → Direct content navigation
  - `responsive-adaptations/` → Layout adjustments

#### 🔹 `shared/` *(Shared components across the app)*
##### 📦 **Components**
- `header/`, `footer/`, `course-card/`, `dropdown-menu/` *(Already exists, some need implementation)*
- `pagination/`, `search-bar/`, `loader/`, `modal/`, `progress-bar/`, `rating/`, `tabs/`, `tooltip/`, `breadcrumbs/`
- `expandable-panel/` → Collapsible content sections
- `file-uploader/` → Multi-file upload component
- `rich-text-editor/` → Formatted text input
- `date-picker/` → Calendar selection
- `image-carousel/` → Rotating image display
- `notification-badge/` → Alert indicators
- `countdown-timer/` → Time remaining display
- `tag-selector/` → Multi-select tagging interface
- `feedback-widget/` → User feedback collection
- `empty-state/` → Zero-content displays
- `cookie-consent/` → GDPR compliance
- `theme-switcher/` → Light/dark mode toggle

##### ⚙️ **Directives**
- `click-outside/` → Detect clicks outside element
- `lazy-load/` → Lazy load images
- `responsive-display/` → Mobile-responsive elements
- `drag-drop/` → Drag and drop functionality
- `infinite-scroll/` → Continuous content loading
- `tooltip-trigger/` → Show explanatory tooltips
- `copy-to-clipboard/` → Text copying
- `auto-resize/` → Dynamic element sizing
- `focus-trap/` → Accessibility for modals
- `debounce/` → Prevent rapid-fire events

##### ⏳ **Pipes**
- `time.pipe.ts` → Time formatting *(Already used)*
- `duration.pipe.ts` → Format course durations
- `safe-html.pipe.ts` → Sanitize HTML
- `localization.pipe.ts` → Internationalization
- `file-size.pipe.ts` → Human-readable file sizes
- `truncate.pipe.ts` → Text shortening
- `search-highlight.pipe.ts` → Highlight search terms
- `sort.pipe.ts` → List ordering
- `filter.pipe.ts` → List filtering
- `date-relative.pipe.ts` → Relative time display

##### 🔐 **Guards & Interceptors**
- `auth.guard.ts` *(Implemented)*
- `auth.interceptor.ts` *(Implemented)*
- `role.guard.ts` → Role-based access control
- `subscription.guard.ts` → Premium content protection
- `unsaved-changes.guard.ts` → Prevent accidental navigation
- `maintenance.guard.ts` → System downtime handling
- `feature-flag.guard.ts` → Feature access control
- `rate-limit.interceptor.ts` → API request throttling
- `cache.interceptor.ts` → Response caching
- `error-handler.interceptor.ts` → Global error handling

##### 📄 **Models & Services**
- Data models: `user.model.ts`, `course.model.ts`, `lesson.model.ts`, `payment.model.ts`, `subscription.model.ts`
- Services: 
  - `auth.service.ts`, `http.service.ts`, `course.service.ts`, `user.service.ts`
  - `lesson.service.ts`, `notification.service.ts`, `storage.service.ts`
  - `payment.service.ts`, `subscription.service.ts`, `analytics.service.ts`
  - `recommendation.service.ts`, `search.service.ts`, `localization.service.ts`
  - `progress.service.ts` → Track learning advancement
  - `feedback.service.ts` → User opinion collection
  - `theme.service.ts` → UI appearance control
  - `offline.service.ts` → Disconnected functionality
  - `error.service.ts` → Error handling and reporting
  - `logging.service.ts` → Activity logging
  - `feature-flag.service.ts` → Feature toggling
  - `device-detection.service.ts` → Platform identification

### 🔹 `core/`
Singleton services and configurations.
- `core.module.ts`
- `error-handler/` → Global error handling
- `analytics/` → Analytics tracking
- `config/` → App configuration
- `state-management/` → Application state control
- `event-bus/` → Cross-component communication
- `performance-monitoring/` → App speed tracking
- `authentication-flow/` → Login process management
- `api-client/` → Backend communication layer
- `local-storage/` → Browser storage management
- `cookie-manager/` → Cookie handling
- `caching-strategy/` → Data caching policies

#### 📱 **Mobile Responsiveness**
- `mobile/`
  - `mobile-specific-components/` → Mobile-optimized UI
  - `offline-access/` → Offline content availability
  - `responsive-video-player/` → Mobile-friendly video player

#### ♿ **Accessibility**
- `accessibility/`
  - `screen-reader-support/` → Screen reader compatibility
  - `keyboard-navigation/` → Keyboard shortcuts
  - `text-size-adjustment/` → Font scaling
  - `high-contrast-mode/` → Visual accessibility

#### 🔌 **Additional Services**
- `services/`
  - `career-services/` → Career guidance
  - `mentor-matching/` → Find a mentor
  - `enterprise-solutions/` → Business offerings
  - `api-integrations/` → Third-party connections
  - `chatbot-support/` → AI assistance

#### 🌍 `environments/`
- `environment.ts`, `environment.prod.ts` → Environment configurations