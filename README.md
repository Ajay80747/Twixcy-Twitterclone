# 🐦 Twixcy – Twitter Clone

Twixcy is a full-stack social media platform inspired by Twitter/X, developed using **Angular** for the frontend and **Java Spring Boot Microservices** for the backend.

The application allows users to create posts, interact with other users, like and comment on posts, and manage their social profiles through a modern responsive interface.

---

## 🚀 Features

### 👤 User Management
- User registration and login
- User profile management
- Profile information and posts
- Follow/Unfollow users

### 📝 Posts
- Create text posts
- Create posts with images
- View posts in the feed
- Delete your own posts
- Like and unlike posts
- Real-time like count updates
- Comment on posts
- Comment count updates

### 💬 Comments
- Add comments to posts
- View comments
- Delete comments
- Like comments
- Automatic comment count updates

### 📰 Feed
- Personalized user feed
- Latest posts displayed first
- Post interaction buttons
- Like and comment counters

### 🔐 Authentication
- Secure user authentication
- Login and registration
- Protected API endpoints
- Role-based access where required

---

## 🏗️ System Architecture

Twixcy follows a **Microservices Architecture**.

```text
                    ┌─────────────────────┐
                    │      Angular UI     │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     API Gateway     │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      ┌────────────┐    ┌────────────┐    ┌────────────┐
      │ User       │    │ Post       │    │ Comment    │
      │ Service    │    │ Service    │    │ Service    │
      └────────────┘    └────────────┘    └────────────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │       MySQL         │
                    │      Database       │
                    └─────────────────────┘
