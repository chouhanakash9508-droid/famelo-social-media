from fastapi import APIRouter, Depends, HTTPException, Query, Form
from typing import List, Optional
import json
import os
from datetime import datetime
from routers.auth import get_current_user

router = APIRouter()

DATA_DIR = "data"

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

def save_json(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

@router.get("/feed")
async def get_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    posts = load_json("posts.json")
    follows = load_json("follows.json")
    likes = load_json("likes.json")
    saves = load_json("saves.json")
    users = load_json("users.json")
    
    # Get following user IDs
    following_ids = [f["following_id"] for f in follows if f["follower_id"] == current_user["id"]]
    following_ids.append(current_user["id"])  # Include own posts
    
    # Filter posts from followed users
    feed_posts = [p for p in posts if p["author_id"] in following_ids]
    feed_posts.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    page_posts = feed_posts[start:end]
    has_more = len(feed_posts) > end
    
    # Enrich posts with interaction data
    result_posts = []
    for post in page_posts:
        author = next((u for u in users if u["id"] == post["author_id"]), None)
        likes_count = len([l for l in likes if l["post_id"] == post["id"]])
        is_liked = any(l["user_id"] == current_user["id"] and l["post_id"] == post["id"] for l in likes)
        is_saved = any(s["user_id"] == current_user["id"] and s["post_id"] == post["id"] for s in saves)
        
        result_posts.append({
            **post,
            "author": {
                "id": author["id"],
                "username": author["username"],
                "full_name": author["full_name"],
                "avatar_url": author.get("avatar_url", "")
            },
            "likes_count": likes_count,
            "is_liked": is_liked,
            "is_saved": is_saved
        })
    
    return {
        "posts": result_posts,
        "has_more": has_more,
        "next_page": page + 1 if has_more else None
    }

@router.post("/")
async def create_post(
    caption: str = Form(...),
    media_url: str = Form(...),
    media_type: str = Form("image"),
    current_user: dict = Depends(get_current_user)
):
    posts = load_json("posts.json")
    
    new_post = {
        "id": max([p["id"] for p in posts], default=0) + 1,
        "caption": caption,
        "media_url": media_url,
        "media_type": media_type,
        "author_id": current_user["id"],
        "created_at": datetime.now().isoformat()
    }
    
    posts.append(new_post)
    save_json("posts.json", posts)
    
    return {
        **new_post,
        "author": {
            "id": current_user["id"],
            "username": current_user["username"],
            "full_name": current_user["full_name"],
            "avatar_url": current_user.get("avatar_url", "")
        },
        "likes_count": 0,
        "is_liked": False,
        "is_saved": False
    }

@router.post("/{post_id}/like")
async def toggle_like(post_id: int, current_user: dict = Depends(get_current_user)):
    likes = load_json("likes.json")
    
    existing_like = next((l for l in likes if l["user_id"] == current_user["id"] and l["post_id"] == post_id), None)
    
    if existing_like:
        likes.remove(existing_like)
        action = "unliked"
    else:
        likes.append({
            "id": max([l["id"] for l in likes], default=0) + 1,
            "user_id": current_user["id"],
            "post_id": post_id,
            "created_at": datetime.now().isoformat()
        })
        action = "liked"
    
    save_json("likes.json", likes)
    
    likes_count = len([l for l in likes if l["post_id"] == post_id])
    is_liked = action == "liked"
    
    return {
        "action": action,
        "likes_count": likes_count,
        "is_liked": is_liked
    }

@router.post("/{post_id}/save")
async def toggle_save(post_id: int, current_user: dict = Depends(get_current_user)):
    saves = load_json("saves.json")
    
    existing_save = next((s for s in saves if s["user_id"] == current_user["id"] and s["post_id"] == post_id), None)
    
    if existing_save:
        saves.remove(existing_save)
        action = "unsaved"
    else:
        saves.append({
            "id": max([s["id"] for s in saves], default=0) + 1,
            "user_id": current_user["id"],
            "post_id": post_id,
            "created_at": datetime.now().isoformat()
        })
        action = "saved"
    
    save_json("saves.json", saves)
    
    return {
        "action": action,
        "is_saved": action == "saved"
    }

@router.post("/{post_id}/comments")
async def add_comment(
    post_id: int,
    content: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    comments = load_json("comments.json")
    
    new_comment = {
        "id": max([c["id"] for c in comments], default=0) + 1,
        "content": content,
        "author_id": current_user["id"],
        "post_id": post_id,
        "created_at": datetime.now().isoformat()
    }
    
    comments.append(new_comment)
    save_json("comments.json", comments)
    
    return {
        **new_comment,
        "author": {
            "id": current_user["id"],
            "username": current_user["username"],
            "full_name": current_user["full_name"],
            "avatar_url": current_user.get("avatar_url", "")
        }
    }

@router.get("/{post_id}/comments")
async def get_comments(
    post_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    comments = load_json("comments.json")
    users = load_json("users.json")
    
    post_comments = [c for c in comments if c["post_id"] == post_id]
    post_comments.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    page_comments = post_comments[start:end]
    
    # Enrich with author data
    result_comments = []
    for comment in page_comments:
        author = next((u for u in users if u["id"] == comment["author_id"]), None)
        result_comments.append({
            **comment,
            "author": {
                "id": author["id"],
                "username": author["username"],
                "full_name": author["full_name"],
                "avatar_url": author.get("avatar_url", "")
            }
        })
    
    return result_comments

@router.get("/discover")
async def get_discover_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    posts = load_json("posts.json")
    likes = load_json("likes.json")
    users = load_json("users.json")
    
    # Sort by likes count for discovery
    posts_with_likes = []
    for post in posts:
        likes_count = len([l for l in likes if l["post_id"] == post["id"]])
        posts_with_likes.append((post, likes_count))
    
    posts_with_likes.sort(key=lambda x: x[1], reverse=True)
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    page_posts = [p[0] for p in posts_with_likes[start:end]]
    
    # Enrich posts
    result_posts = []
    for post in page_posts:
        author = next((u for u in users if u["id"] == post["author_id"]), None)
        likes_count = len([l for l in likes if l["post_id"] == post["id"]])
        
        result_posts.append({
            **post,
            "author": {
                "id": author["id"],
                "username": author["username"],
                "full_name": author["full_name"],
                "avatar_url": author.get("avatar_url", "")
            },
            "likes_count": likes_count
        })
    
    return {
        "posts": result_posts,
        "has_more": len(posts) > end
    }