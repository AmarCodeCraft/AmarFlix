# AmarFlix Backend

Beginner-friendly backend for a streaming web app using Node.js, Express, and MongoDB.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- dotenv
- cors

## Folder Structure

```text
backend/
  config/
    db.js
  controllers/
    videoController.js
  models/
    Video.js
  routes/
    videoRoutes.js
  utils/
    validators.js
  env.example
  index.js
  package.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `env.example` and fill values.

3. Start development server:

```bash
npm run dev
```

4. Start production server:

```bash
npm start
```

## API Endpoints

### Health

- `GET /`

### Add Video (Admin)

- `POST /api/videos`
- Body:

```json
{
  "title": "Avengers: Trailer",
  "description": "Official trailer",
  "thumbnail": "https://example.com/thumb.jpg",
  "videoUrl": "https://res.cloudinary.com/.../video.mp4",
  "category": "action"
}
```

### Get All Videos

- `GET /api/videos`
- Filter by category:
  - `GET /api/videos?category=action`

### Get Single Video

- `GET /api/videos/:id`

## Video Streaming Notes

- Videos are not streamed through this backend to avoid lag and save server bandwidth.
- Instead, the frontend streams directly from the provided `videoUrl` natively via HTML5 `<video>`.
- We recommend hosting your videos on professional CDNs like AWS S3 or Cloudinary, which automatically support HTTP Range Requests for smooth playback and seeking.
