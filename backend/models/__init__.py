from datetime import datetime
from typing import Optional, List

class User:
    def __init__(self, id: int, email: str, username: str, full_name: str, 
                 hashed_password: str, bio: str = "", avatar_url: str = "", 
                 is_verified: bool = False, is_private: bool = False):
        self.id = id
        self.email = email
        self.username = username
        self.full_name = full_name
        self.hashed_password = hashed_password
        self.bio = bio
        self.avatar_url = avatar_url
        self.is_verified = is_verified
        self.is_private = is_private
        self.created_at = datetime.now().isoformat()

class Post:
    def __init__(self, id: int, caption: str, media_url: str, media_type: str, author_id: int):
        self.id = id
        self.caption = caption
        self.media_url = media_url
        self.media_type = media_type
        self.author_id = author_id
        self.created_at = datetime.now().isoformat()

class Comment:
    def __init__(self, id: int, content: str, author_id: int, post_id: int, parent_id: Optional[int] = None):
        self.id = id
        self.content = content
        self.author_id = author_id
        self.post_id = post_id
        self.parent_id = parent_id
        self.created_at = datetime.now().isoformat()