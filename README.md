# Real-Time Task Manager - Frontend (Expo)

This is the frontend for the Full-Stack Challenge, built with Expo (React Native), TypeScript, and Redux. It provides a seamless, real-time user experience for task management, complete with an optional offline-first capability.

## Features

- **Public Task View**: Anyone can view the list of tasks without authentication.
- **JWT Authentication**: Secure login, registration, and session management with access and rotating refresh tokens.
- **Full CRUD Operations**: Authenticated users can create, read, update, and delete tasks.
- **Real-Time Task Locking**: Utilizes Socket.IO to show when a task is being edited by another user, disabling the edit button for others to prevent concurrent edits.
- **API Integration**: Uses RTK Query for efficient data fetching, caching, and state management, including automatic token refresh logic.
- **(Bonus) Offline Synchronization**:
  - Caches all tasks for offline viewing.
  - Queues any create, update, or delete operations made while offline.
  - Automatically syncs queued actions with the server once the connection is restored.

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Data Persistence**: Redux Persist with AsyncStorage
- **Real-time**: Socket.IO Client
- **Navigation**: Expo Router

---

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo Go app on your Android device for testing

### Setup & Run Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mtahmed2x/task-management-app.git
    cd task-management-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npx expo start
    ```
    Scan the QR code with the Expo Go app on your Android device.

---

## Live Demo & Credentials

- **Download APK:** `https://expo.dev/accounts/mir2x/projects/task-management/builds/5fe568ef-e5f6-4de5-8aca-a80dc1857b9b`
- **API Base URL:** `https://task-management-backend-pavs.onrender.com/api/v1/`
- **Demo Credentials:**
  - **Email:** `tanim@gmail.com`
  - **Password:** `xyT12@ha`
