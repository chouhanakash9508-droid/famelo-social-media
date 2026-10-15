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

@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    posts = load_json("posts.json")
    follows = load_json("follows.json")
    
    user_posts = [p for p in posts if p["author_id"] == current_user["id"]]
    followers_count = len([f for f in follows if f["following_id"] == current_user["id"]])
    following_count = len([f for f in follows if f["follower_id"] == current_user["id"]])
    
    return {
        **current_user,
        "posts_count": len(user_posts),
        "followers_count": followers_count,
        "following_count": following_count,
        "posts": sorted(user_posts, key=lambda x: x["created_at"], reverse=True)
    }

@router.get("/{user_id}")
async def get_user_profile(user_id: int, current_user: dict = Depends(get_current_user)):
    users = load_json("users.json")
    posts = load_json("posts.json")
    follows = load_json("follows.json")
    
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_posts = [p for p in posts if p["author_id"] == user_id]
    followers_count = len([f for f in follows if f["following_id"] == user_id])
    following_count = len([f for f in follows if f["follower_id"] == user_id])
    is_following = any(f["follower_id"] == current_user["id"] and f["following_id"] == user_id for f in follows)
    
    return {
        **user,
        "posts_count": len(user_posts),
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following,
        "posts": sorted(user_posts, key=lambda x: x["created_at"], reverse=True)
    }

@router.post("/{user_id}/follow")
async def toggle_follow(user_id: int, current_user: dict = Depends(get_current_user)):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    users = load_json("users.json")
    follows = load_json("follows.json")
    
    target_user = next((u for u in users if u["id"] == user_id), None)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing_follow = next((f for f in follows if f["follower_id"] == current_user["id"] and f["following_id"] == user_id), None)
    
    if existing_follow:
        follows.remove(existing_follow)
        action = "unfollowed"
    else:
        follows.append({
            "id": max([f["id"] for f in follows], default=0) + 1,
            "follower_id": current_user["id"],
            "following_id": user_id,
            "created_at": datetime.now().isoformat()
        })
        action = "followed"
    
    save_json("follows.json", follows)
    
    followers_count = len([f for f in follows if f["following_id"] == user_id])
    
    return {
        "action": action,
        "is_following": action == "followed",
        "followers_count": followers_count
    }

@router.put("/me")
async def update_profile(
    full_name: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    avatar_url: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    users = load_json("users.json")
    
    for i, user in enumerate(users):
        if user["id"] == current_user["id"]:
            if full_name is not None:
                users[i]["full_name"] = full_name
            if bio is not None:
                users[i]["bio"] = bio
            if avatar_url is not None:
                users[i]["avatar_url"] = avatar_url
            users[i]["updated_at"] = datetime.now().isoformat()
            break
    
    save_json("users.json", users)
    
    updated_user = next((u for u in users if u["id"] == current_user["id"]), None)
    return updated_user

@router.get("/search")
async def search_users(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    users = load_json("users.json")
    follows = load_json("follows.json")
    
    # Search by username or full name
    search_results = []
    for user in users:
        if (q.lower() in user["username"].lower() or 
            q.lower() in user.get("full_name", "").lower()):
            
            if user["id"] != current_user["id"]:  # Exclude current user
                followers_count = len([f for f in follows if f["following_id"] == user["id"]])
                is_following = any(f["follower_id"] == current_user["id"] and f["following_id"] == user["id"] for f in follows)
                
                search_results.append({
                    "id": user["id"],
                    "username": user["username"],
                    "full_name": user.get("full_name", ""),
                    "avatar_url": user.get("avatar_url", ""),
                    "bio": user.get("bio", ""),
                    "followers_count": followers_count,
                    "is_following": is_following
                })
    
    # Sort by followers count
    search_results.sort(key=lambda x: x["followers_count"], reverse=True)
    
    return search_results[:limit]

@router.get("/suggestions")
async def get_user_suggestions(
    limit: int = Query(10, ge=1, le=20),
    current_user: dict = Depends(get_current_user)
):
    users = load_json("users.json")
    follows = load_json("follows.json")
    
    # Get users not followed by current user
    following_ids = [f["following_id"] for f in follows if f["follower_id"] == current_user["id"]]
    following_ids.append(current_user["id"])  # Exclude self
    
    suggestions = []
    for user in users:
        if user["id"] not in following_ids:
            followers_count = len([f for f in follows if f["following_id"] == user["id"]])
            
            suggestions.append({
                "id": user["id"],
                "username": user["username"],
                "full_name": user.get("full_name", ""),
                "avatar_url": user.get("avatar_url", ""),
                "bio": user.get("bio", ""),
                "followers_count": followers_count,
                "is_following": False
            })
    
    # Sort by followers count
    suggestions.sort(key=lambda x: x["followers_count"], reverse=True)
    
    return suggestions[:limit]