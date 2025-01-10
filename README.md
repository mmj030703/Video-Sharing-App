# **Vidionix - Video Sharing Platform**

Welcome to **Vidionix**, a video-sharing platform where users can upload, manage, and watch videos. Built using the MERN stack, this application integrates a backend and an interactive frontend.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Project Structure](#project-structure)
7. [Technologies Used](#technologies-used)
8. [License](#license)

## Project Overview

Vidionix is a **MERN-based Video Sharing Platform** that allows users to upload videos, view videos, and manage their videos library. It delivers a user-friendly interface for viewing and organizing videos.

### Live Demo

_[Link to Demo](https://vidionix.vercel.app)_

---

## Features

- **Video Upload and Storage**: Upload videos to Cloudinary and store their metadata in MongoDB.
- **User Authentication**: Secure login and registration using JWT.
- **Browse and Manage Videos**: View, edit, and delete videos from the library.
- **Search Functionality**: Quickly find videos using the search bar.
  -- **Video Player Page**: A video player page where user can watch video, like or dislike, comment, watch similar videos list, etc.
  -- **Channel Page**: A channel page where user can see all videos and information about own channel. User can edit the information as well.
- **Responsive Design**: Optimized for devices of all sizes.

---

## Installation

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (local or hosted instance)
- A [Cloudinary Account](https://cloudinary.com/)

---

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/mmj030703/Video-Sharing-App.git
   cd Video-Sharing-App/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add the following:

   ```env
        PORT=5000
        DATABASE_NAME=<database_name>
        DATABASE_URI=<database_uri>
        CLOUDINARY_CLOUD_NAME=<cloud_name>
        CLOUDINARY_API_KEY=<cloudinary_api_key>
        CLOUDINARY_SECRET_KEY=<cloudinary_secret_key>
        JWT_SECRET_KEY=<jwt_secret_key>
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the frontend repository:

   ```bash
   git clone https://github.com/mmj030703/Video-Sharing-App.git
   cd Video-Sharing-App/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`.

---

## Usage

1. **Upload Videos**: Log in, then create your channel and then upload your videos through the "Upload" button.
2. **View Library**: In your channel page you can see your uploaded videos.
3. **Search**: Use the search bar to find videos quickly.
4. **Manage Videos**: Edit or delete videos from your channel page.
5. **Interact to Videos**: In video player page you can interact with video by a like or dislike, comment, etc.

---

## API Endpoints

#### Base URL

https://video-sharing-app-2n9p.onrender.com/api/v1

### Users

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| POST   | `/users/register`          | Register a new user     |
| POST   | `/users/login`             | Authenticate a user     |
| GET    | `/users/refresh-token/:id` | Return new access token |
| POST   | `/users/logout/:id`        | Logout a user           |
| GET    | `/users/user/:id`          | Get a user              |

### Videos

| Method | Endpoint                     | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/videos/category/:category` | Get all videos based on category     |
| GET    | `/videos/video/:id`          | Get video details by ID              |
| GET    | `/videos/channel/:channelId` | Get all videos by Channel ID         |
| GET    | `/videos/search/title`       | Get all videos based on search query |

### Comments

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| POST   | `/comments/add/:id`    | Add comment                  |
| PATCH  | `/comments/update/:id` | Update comment by ID         |
| DELETE | `/comments/delete/:id` | Delete comment by ID         |
| GET    | `/comments/all/:id`    | Get all comments by Video ID |

### Likes & Dislikes

| Method | Endpoint                                    | Description                                               |
| ------ | ------------------------------------------- | --------------------------------------------------------- |
| POST   | `/likes-dislikes/update-likes-dislikes/:id` | Update like dislike on a video by Video ID                |
| POST   | `/likes-dislikes/user-status/:id`           | Get user status for like & dislike on a video by Video Id |

### Channels

| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| GET    | `/channels/channel/:id`       | Get channel by Channel ID    |
| POST   | `/channels/create`            | Create a channel             |
| PATCH  | `/channels/update/:id`        | Update channel by Channel ID |
| POST   | `/channels/videos/upload`     | Upload a video               |
| PATCH  | `/channels/videos/update/:id` | Update a video by Video ID   |
| PATCH  | `/channels/videos/update/:id` | Update a video by Video ID   |
| DELETE | `/channels/videos/delete/:id` | Delete a video by Video ID   |

### Categories

| Method | Endpoint                                   | Description                                                                                                                                          |
| ------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/categories/videos/all?associatedWith=""` | Get all categories as per associatedWith parameter. It can be video, short anything but as of now under the scope of this project we have only video |
| POST   | `/categories/add`                          | Add category                                                                                                                                         |

---

## Project Structure

```plaintext
vidionix/
├── backend/
│   ├── public/            # Temporary files
│   ├── .env                   # Environment variables
│   ├── src/               # Source Directory
│       ├── config/            # Configuration files
│       ├── constants/       # Constant files
│       ├── controllers/       # Backend logic
│       ├── db/       # Database files
│       ├── middlewares/            # Backend API middlewares
│       ├── models/            # Mongoose models
│       ├── routes/            # Backend API routes
│       ├── utils/            # Utility files
│       ├── app.js          # Backend application file
│       └── index.js          # Backend entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/    # Utility files
│   │       ├── slices/    # Redux Slice
│   │   ├── pages/         # Pages for the app
│   │   ├── App.jsx        # Appliaction component to render all conponents and pages
│   │   └── main.jsx        # Frontend entry point
```

## Technologies Used

- **Backend**:

  - Node.js, Express, MongoDB, Mongoose, Cloudinary, Bcrypt, JSON Web Tokens (JWT).

- **Frontend**:
  - React, Tailwind CSS, Redux Toolkit, React Router, tailwind-scrollbar.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
