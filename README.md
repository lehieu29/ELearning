# 📂 Project Structure Overview

This document provides an overview of the project structure, detailing key modules and components.

## 📁 `src/`
The main source folder containing the application code.

### 📌 `app/`
Contains the core application features and shared functionalities.

#### 🔹 `features/`
##### ✅ **Authentication**
- `auth/` → Already implemented
  - `login/` → User login functionality

##### 📊 **Dashboard** *(Needs Expansion)*
- `dashboard/`
  - `dashboard.component` → Main dashboard layout
  - `welcome-banner/` → Welcome section at the top of the dashboard
  - `course-catalog/` → Browse available courses
  - `enrolled-courses/` → User's enrolled courses
  - `progress-tracker/` → Learning progress visualization

##### 🎓 **Course Management**
- `course/` → Course viewing feature
  - `course.module`
  - `course-details/` → Overview page for a specific course
  - `course-syllabus/` → Course outline and structure
  - `lesson-player/` → Video lesson player with controls
  - `quiz/` → Quiz component
  - `assignment/` → Assignment submission component
  - `discussion/` → Discussion/comment section
  - `resources/` → Additional resources section

##### 👤 **User Profile**
- `profile/`
  - `profile.module`
  - `user-info/` → Basic user information
  - `account-settings/` → Account preferences
  - `notifications/` → Notification settings
  - `certificates/` → Earned certificates

##### 🌍 **Community**
- `community/` → Community features
  - `community.module`
  - `forum/` → Discussion forum
  - `mentorship/` → Mentor connection

#### 🔹 `shared/` *(Shared components across the app)*
##### 📦 **Components**
- `header/`, `footer/`, `course-card/`, `dropdown-menu/` *(Already exists, some need implementation)*
- `pagination/`, `search-bar/`, `loader/`, `modal/`, `progress-bar/`, `rating/`, `tabs/`, `tooltip/`, `breadcrumbs/`

##### ⚙️ **Directives**
- `click-outside/` → Detect clicks outside element
- `lazy-load/` → Lazy load images

##### ⏳ **Pipes**
- `time.pipe.ts` → Time formatting *(Already used)*
- `duration.pipe.ts` → Format course durations
- `safe-html.pipe.ts` → Sanitize HTML

##### 🔐 **Guards & Interceptors**
- `auth.guard.ts` *(Implemented)*
- `auth.interceptor.ts` *(Implemented)*

##### 📄 **Models & Services**
- Data models: `user.model.ts`, `course.model.ts`, `lesson.model.ts`
- Services: `auth.service.ts`, `http.service.ts`, `course.service.ts`, `user.service.ts`, `lesson.service.ts`, `notification.service.ts`, `storage.service.ts`

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

#### 🌍 `environments/`
- `environment.ts`, `environment.prod.ts` → Environment configurations

---

This structure ensures a modular and scalable application architecture, making maintenance and feature expansion easier.

