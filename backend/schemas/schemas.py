from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    bio: Optional[str] = None
    is_private: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_private: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    is_verified: bool = False
    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Post schemas
class PostBase(BaseModel):
    caption: Optional[str] = None
    media_url: str
    media_type: str

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    caption: Optional[str] = None

class PostResponse(PostBase):
    id: int
    author: UserResponse
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    is_saved: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# Comment schemas
class CommentBase(BaseModel):
    content: str
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    author: UserResponse
    post_id: int
    replies_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Story schemas
class StoryBase(BaseModel):
    media_url: str
    media_type: str

class StoryCreate(StoryBase):
    pass

class StoryResponse(StoryBase):
    id: int
    author: UserResponse
    views_count: int = 0
    expires_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Feed response
class FeedResponse(BaseModel):
    posts: List[PostResponse]
    has_more: bool
    next_page: Optional[int] = None

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginRequest(BaseModel):
    email: str
    password: str