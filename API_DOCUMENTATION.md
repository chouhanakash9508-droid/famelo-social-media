# FRAMELO API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=securepass&full_name=John Doe
```

**Response:**
```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=securepass
```

**Response:**
```json
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "bio": "Photographer",
  "avatar_url": "https://..."
}
```

### Users

#### Get User Profile
```http
GET /users/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "full_name": "John Doe",
  "bio": "Photographer",
  "avatar_url": "https://...",
  "followers_count": 150,
  "following_count": 200,
  "posts_count": 45,
  "is_following": false
}
```

#### Follow User
```http
POST /users/{user_id}/follow
Authorization: Bearer <token>
```

#### Unfollow User
```http
DELETE /users/{user_id}/follow
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "bio": "Updated bio",
  "avatar_url": "https://..."
}
```

### Posts

#### Get Feed
```http
GET /posts/feed?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "caption": "Beautiful sunset!",
      "media_url": "https://...",
      "media_type": "image",
      "author_id": 1,
      "created_at": "2024-01-01T12:00:00Z",
      "author": {
        "id": 1,
        "username": "johndoe",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "likes_count": 25,
      "is_liked": true,
      "is_saved": false
    }
  ],
  "has_more": true,
  "next_page": 2
}
```

#### Create Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/x-www-form-urlencoded

caption=My awesome post&media_url=https://...&media_type=image
```

#### Get Post
```http
GET /posts/{post_id}
Authorization: Bearer <token>
```

#### Like Post
```http
POST /posts/{post_id}/like
Authorization: Bearer <token>
```

#### Unlike Post
```http
DELETE /posts/{post_id}/like
Authorization: Bearer <token>
```

#### Save Post
```http
POST /posts/{post_id}/save
Authorization: Bearer <token>
```

#### Unsave Post
```http
DELETE /posts/{post_id}/save
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /posts/{post_id}/comments
Authorization: Bearer <token>
Content-Type: application/x-www-form-urlencoded

content=Great post!&parent_id=123
```

#### Get Comments
```http
GET /posts/{post_id}/comments?page=1&limit=20
Authorization: Bearer <token>
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message"
}