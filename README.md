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

##### 🎓 **Course Management**
- `course/` → Course viewing feature
  - `course.module`
  - `course-details/` → Overview page for a specific course
  - `course-syllabus/` → Course outline and structure
  - `lesson-player/` → Video lesson player with controls
    - `speed-control/` → Video playback speed options
    - `transcript/` → Text version of video content
    - `download-options/` → Materials download functionality
  - `quiz/` → Quiz component
  - `assignment/` → Assignment submission component
  - `discussion/` → Discussion/comment section
  - `resources/` → Additional resources section
  - `note-taking/` → In-course note system
  - `bookmark-system/` → Save important course sections
  - `feedback-system/` → Course rating and review
  - `peer-review/` → Student evaluation of assignments
  - `code-editor/` → Interactive coding environment
  - `project-submission/` → Project upload and submission
  - `grading-system/` → Assessment and grading interface

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

##### 👨‍🏫 **Instructor Features**
- `instructor/` → Tools for course creators
  - `instructor.module`
  - `course-creation/` → Course building tools
  - `student-management/` → Learner tracking
  - `analytics-dashboard/` → Performance metrics
  - `content-management/` → Lesson and resource manager
  - `announcement-system/` → Class-wide notifications
  - `grading-interface/` → Assignment evaluation

##### 🔧 **Admin Panel**
- `admin/` → Administrative controls
  - `admin.module`
  - `user-management/` → User account administration
  - `content-moderation/` → Review and approve content
  - `system-settings/` → Platform configuration
  - `analytics-reporting/` → Usage statistics
  - `promotion-management/` → Marketing campaigns

##### 💳 **Payment & Subscription**
- `payment/` → Payment processing
  - `payment.module`
  - `payment-processing/` → Transaction handling
  - `subscription-plans/` → Membership tiers
  - `coupon-system/` → Discount management
  - `refund-processing/` → Return policies
  - `invoice-generation/` → Billing documentation

#### 🔹 `shared/` *(Shared components across the app)*
##### 📦 **Components**
- `header/`, `footer/`, `course-card/`, `dropdown-menu/` *(Already exists, some need implementation)*
- `pagination/`, `search-bar/`, `loader/`, `modal/`, `progress-bar/`, `rating/`, `tabs/`, `tooltip/`, `breadcrumbs/`

##### ⚙️ **Directives**
- `click-outside/` → Detect clicks outside element
- `lazy-load/` → Lazy load images
- `responsive-display/` → Mobile-responsive elements

##### ⏳ **Pipes**
- `time.pipe.ts` → Time formatting *(Already used)*
- `duration.pipe.ts` → Format course durations
- `safe-html.pipe.ts` → Sanitize HTML
- `localization.pipe.ts` → Internationalization

##### 🔐 **Guards & Interceptors**
- `auth.guard.ts` *(Implemented)*
- `auth.interceptor.ts` *(Implemented)*
- `role.guard.ts` → Role-based access control
- `subscription.guard.ts` → Premium content protection

##### 📄 **Models & Services**
- Data models: `user.model.ts`, `course.model.ts`, `lesson.model.ts`, `payment.model.ts`, `subscription.model.ts`
- Services: 
  - `auth.service.ts`, `http.service.ts`, `course.service.ts`, `user.service.ts`
  - `lesson.service.ts`, `notification.service.ts`, `storage.service.ts`
  - `payment.service.ts`, `subscription.service.ts`, `analytics.service.ts`
  - `recommendation.service.ts`, `search.service.ts`, `localization.service.ts`

### 🔹 `core/`
Singleton services and configurations.
- `core.module.ts`
- `error-handler/` → Global error handling
- `analytics/` → Analytics tracking
- `config/` → App configuration

### 📌 **Other Key Directories**
#### 📂 `assets/`
- `images/`, `fonts/`, `styles/` *(Contains global styling configurations)*
- `themes/` → Theme variants
- `i18n/` → Internationalization resources

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

#### 🌐 **Internationalization**
- `i18n/`
  - `language-selector/` → Language options
  - `content-translation/` → Multi-language support
  - `regional-pricing/` → Localized pricing

#### 🔌 **Additional Services**
- `services/`
  - `career-services/` → Career guidance
  - `mentor-matching/` → Find a mentor
  - `enterprise-solutions/` → Business offerings
  - `api-integrations/` → Third-party connections
  - `chatbot-support/` → AI assistance

#### 🌍 `environments/`
- `environment.ts`, `environment.prod.ts` → Environment configurations
