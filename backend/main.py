from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import firebase_admin
from firebase_admin import credentials, auth, firestore, storage
import os
import json
import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel, validator
import hashlib
import time
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Pydantic models for validation
class PostCreate(BaseModel):
    caption: str
    location: Optional[str] = None
    
    @validator('caption')
    def validate_caption(cls, v):
        if len(v) > 2200:
            raise ValueError('Caption too long')
        return v.strip()

class CommentCreate(BaseModel):
    text: str
    parent_id: Optional[str] = None
    
    @validator('text')
    def validate_text(cls, v):
        if len(v) > 500:
            raise ValueError('Comment too long')
        return v.strip()

class MessageCreate(BaseModel):
    recipient_id: str
    text: str
    
    @validator('text')
    def validate_text(cls, v):
        if len(v) > 1000:
            raise ValueError('Message too long')
        return v.strip()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except:
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        disconnected = []
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(user_id)
        
        for user_id in disconnected:
            self.disconnect(user_id)

manager = ConnectionManager()

# Initialize Firebase
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("\n" + "="*60)
    print("🚀 FAMELO API - Social Media Platform")
    print("="*60)
    print("📱 Version: 1.0.0")
    print("🌐 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("🔥 Firebase: Initializing...")
    print("="*60)
    
    try:
        if not firebase_admin._apps:
            # Initialize with project ID only for development
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred, {
                'projectId': 'famelosocialmedia',
                'storageBucket': 'famelosocialmedia.firebasestorage.app'
            })
        print("✅ Firebase initialized successfully")
        logger.info("Firebase initialized successfully")
    except Exception as e:
        print(f"⚠️  Firebase initialization failed: {e}")
        print("🔧 Running in development mode without Firebase")
        logger.warning(f"Firebase initialization failed: {e}")
        # Continue without Firebase for development
    
    print("🎉 FAMELO API is ready!")
    print("="*60 + "\n")
    
    yield
    
    # Shutdown
    print("\n🛑 FAMELO API shutting down...")
    logger.info("Application shutting down")

app = FastAPI(
    title="Famelo API",
    description="Social media platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware with security headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://famelo.vercel.app", "https://famelosocialmedia.web.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count"]
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Security
security = HTTPBearer()

# Initialize Firestore client safely
try:
    db = firestore.client()
except:
    db = None

# Enhanced auth dependency with better error handling
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        if not db:
            # If Firebase is not available, return a mock user for development
            return {
                "uid": "dev_user",
                "email": "dev@example.com"
            }
            
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        
        # Check if user exists in database
        user_ref = db.collection("users").document(decoded_token["uid"])
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            # Create user document if it doesn't exist
            user_data = {
                "uid": decoded_token["uid"],
                "email": decoded_token.get("email"),
                "username": decoded_token.get("email", "").split("@")[0],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "isVerified": False,
                "is_admin": False
            }
            user_ref.set(user_data)
        
        return decoded_token
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Auth error: {e}")
        # For development, return a mock user if auth fails
        if not db:
            return {
                "uid": "dev_user",
                "email": "dev@example.com"
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

# Admin-only dependency
async def get_admin_user(current_user: dict = Depends(get_current_user)):
    try:
        user_doc = db.collection("users").document(current_user["uid"]).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        user_data = user_doc.to_dict()
        if not user_data.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        return current_user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "typing":
                await manager.send_personal_message(
                    {"type": "typing", "user_id": user_id, "is_typing": message.get("is_typing")},
                    message.get("target_user_id")
                )
            elif message.get("type") == "comment_typing":
                # Broadcast typing indicator for comments
                await manager.broadcast({
                    "type": "comment_typing",
                    "post_id": message.get("post_id"),
                    "user_id": user_id,
                    "is_typing": message.get("is_typing")
                })
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "🚀 FAMELO API is running!",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
        "health": "/health",
        "api_prefix": "/api"
    }

# Simple stories endpoint for testing
@app.get("/api/stories/test")
async def get_stories_test():
    return {"stories": [], "message": "Stories endpoint working"}

# Posts endpoints
@app.post("/api/posts")
async def create_post(
    caption: str = "",
    location: str = "",
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Upload file to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"posts/{current_user['uid']}/{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        
        # Create post document
        post_data = {
            "user_id": current_user["uid"],
            "caption": caption,
            "location": location,
            "media_url": blob.public_url,
            "media_type": "image" if file.content_type.startswith("image") else "video",
            "likes_count": 0,
            "comments_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("posts").document()
        doc_ref.set(post_data)
        
        # Broadcast new post
        await manager.broadcast({"type": "new_post", "post": {**post_data, "id": doc_ref.id}})
        
        return {"success": True, "post_id": doc_ref.id}
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts/feed")
@limiter.limit("30/minute")
async def get_feed(
    request: Request,
    page: int = 1,
    limit: int = 10,
    cursor: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        if limit > 50:
            limit = 50  # Max limit for security
            
        posts_ref = db.collection("posts")
        query = posts_ref.order_by("created_at", direction=firestore.Query.DESCENDING)
        
        # Cursor-based pagination for better performance
        if cursor:
            cursor_doc = db.collection("posts").document(cursor).get()
            if cursor_doc.exists:
                query = query.start_after(cursor_doc)
        
        query = query.limit(limit + 1)  # Get one extra to check if there's more
        
        posts = []
        docs = list(query.stream())
        has_more = len(docs) > limit
        
        if has_more:
            docs = docs[:-1]  # Remove the extra doc
        
        for doc in docs:
            post_data = doc.to_dict()
            post_data["id"] = doc.id
            
            # Get user info efficiently
            user_doc = db.collection("users").document(post_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                post_data["user"] = {
                    "uid": post_data["user_id"],
                    "username": user_data.get("username", "Unknown"),
                    "photoURL": user_data.get("photoURL")
                }
            
            posts.append(post_data)
        
        next_cursor = posts[-1]["id"] if posts and has_more else None
        
        return {
            "posts": posts, 
            "has_more": has_more,
            "next_cursor": next_cursor,
            "total": len(posts)
        }
    except Exception as e:
        logger.error(f"Error getting feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load feed")

@app.post("/api/posts/{post_id}/like")
async def toggle_like(post_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        # Check if already liked
        likes_ref = db.collection("likes")
        existing_like = likes_ref.where("user_id", "==", user_id).where("post_id", "==", post_id)
        existing_docs = list(existing_like.stream())
        
        post_ref = db.collection("posts").document(post_id)
        
        if existing_docs:
            # Unlike
            for doc in existing_docs:
                doc.reference.delete()
            post_ref.update({"likes_count": firestore.Increment(-1)})
            is_liked = False
        else:
            # Like
            likes_ref.add({
                "user_id": user_id,
                "post_id": post_id,
                "created_at": datetime.utcnow().isoformat()
            })
            post_ref.update({"likes_count": firestore.Increment(1)})
            is_liked = True
        
        # Create notification for like
        if is_liked:
            post_doc = db.collection("posts").document(post_id).get()
            if post_doc.exists:
                post_data = post_doc.to_dict()
                await create_notification(post_data["user_id"], user_id, "like", post_id)
        
        return {"success": True, "is_liked": is_liked}
    except Exception as e:
        logger.error(f"Error toggling like: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts/{post_id}/comments")
async def get_comments(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        comments_ref = db.collection("comments")
        query = comments_ref.where("post_id", "==", post_id).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        comments = []
        for doc in query.stream():
            comment_data = doc.to_dict()
            comment_data["id"] = doc.id
            
            # Get user info
            user_doc = db.collection("users").document(comment_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                comment_data["user"] = {
                    "uid": comment_data["user_id"],
                    "username": user_data.get("username", "Unknown"),
                    "photoURL": user_data.get("photoURL")
                }
            
            # Check if current user liked this comment
            likes_query = db.collection("comment_likes").where("user_id", "==", current_user["uid"]).where("comment_id", "==", doc.id)
            comment_data["is_liked"] = len(list(likes_query.stream())) > 0
            
            # Get likes count
            likes_count = len(list(db.collection("comment_likes").where("comment_id", "==", doc.id).stream()))
            comment_data["likes_count"] = likes_count
            
            comments.append(comment_data)
        
        # Organize comments with replies
        organized_comments = []
        comment_map = {}
        
        for comment in comments:
            comment["replies"] = []
            comment_map[comment["id"]] = comment
            
            if comment.get("parent_id"):
                # This is a reply
                parent = comment_map.get(comment["parent_id"])
                if parent:
                    parent["replies"].append(comment)
            else:
                # This is a top-level comment
                organized_comments.append(comment)
        
        return {"comments": organized_comments}
    except Exception as e:
        logger.error(f"Error getting comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    text: str,
    parent_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        comment_data = {
            "post_id": post_id,
            "user_id": current_user["uid"],
            "text": text,
            "parent_id": parent_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("comments").document()
        doc_ref.set(comment_data)
        
        # Update post comment count
        post_ref = db.collection("posts").document(post_id)
        post_ref.update({"comments_count": firestore.Increment(1)})
        
        # Get user info for the response
        user_doc = db.collection("users").document(current_user["uid"]).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        comment_response = {
            **comment_data,
            "id": doc_ref.id,
            "user": {
                "uid": current_user["uid"],
                "username": user_data.get("username", "Unknown"),
                "photoURL": user_data.get("photoURL")
            },
            "is_liked": False,
            "likes_count": 0,
            "replies": []
        }
        
        # Broadcast new comment via WebSocket
        await manager.broadcast({
            "type": "new_comment",
            "post_id": post_id,
            "comment": comment_response
        })
        
        # Create notification for post owner
        post_doc = db.collection("posts").document(post_id).get()
        if post_doc.exists:
            post_data = post_doc.to_dict()
            await create_notification(post_data["user_id"], current_user["uid"], "comment", post_id)
        
        return {"success": True, "comment": comment_response}
    except Exception as e:
        logger.error(f"Error adding comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/comments/{comment_id}/like")
async def toggle_comment_like(comment_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        # Check if already liked
        likes_ref = db.collection("comment_likes")
        existing_like = likes_ref.where("user_id", "==", user_id).where("comment_id", "==", comment_id)
        existing_docs = list(existing_like.stream())
        
        if existing_docs:
            # Unlike
            for doc in existing_docs:
                doc.reference.delete()
            is_liked = False
        else:
            # Like
            likes_ref.add({
                "user_id": user_id,
                "comment_id": comment_id,
                "created_at": datetime.utcnow().isoformat()
            })
            is_liked = True
        
        # Get updated likes count
        likes_count = len(list(db.collection("comment_likes").where("comment_id", "==", comment_id).stream()))
        
        # Broadcast comment like update
        await manager.broadcast({
            "type": "comment_like_update",
            "comment_id": comment_id,
            "is_liked": is_liked,
            "likes_count": likes_count
        })
        
        return {"success": True, "is_liked": is_liked, "likes_count": likes_count}
    except Exception as e:
        logger.error(f"Error toggling comment like: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: str, current_user: dict = Depends(get_current_user)):
    try:
        comment_ref = db.collection("comments").document(comment_id)
        comment_doc = comment_ref.get()
        
        if not comment_doc.exists:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        comment_data = comment_doc.to_dict()
        
        # Check if user owns the comment
        if comment_data["user_id"] != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
        # Delete comment and its likes
        comment_ref.delete()
        
        # Delete comment likes
        likes_query = db.collection("comment_likes").where("comment_id", "==", comment_id)
        for doc in likes_query.stream():
            doc.reference.delete()
        
        # Update post comment count
        post_ref = db.collection("posts").document(comment_data["post_id"])
        post_ref.update({"comments_count": firestore.Increment(-1)})
        
        # Broadcast comment deletion
        await manager.broadcast({
            "type": "comment_deleted",
            "comment_id": comment_id,
            "post_id": comment_data["post_id"]
        })
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Messages endpoints
@app.get("/api/messages/chats")
async def get_chats(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        # Get all chats where user is participant
        chats_ref = db.collection("chats")
        query = chats_ref.where("participants", "array_contains", user_id).order_by("last_message_at", direction=firestore.Query.DESCENDING)
        
        chats = []
        for doc in query.stream():
            chat_data = doc.to_dict()
            chat_data["id"] = doc.id
            
            # Get other participant info
            other_user_id = next(p for p in chat_data["participants"] if p != user_id)
            user_doc = db.collection("users").document(other_user_id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                chat_data["other_user"] = {
                    "uid": other_user_id,
                    "username": user_data.get("username", "Unknown"),
                    "photoURL": user_data.get("photoURL")
                }
            
            # Check unread count
            unread_count = len(list(
                db.collection("messages")
                .where("chat_id", "==", doc.id)
                .where("sender_id", "!=", user_id)
                .where("seen", "==", False)
                .stream()
            ))
            chat_data["unread_count"] = unread_count
            
            chats.append(chat_data)
        
        return {"chats": chats}
    except Exception as e:
        logger.error(f"Error getting chats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages/chats/{chat_id}")
async def get_messages(chat_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Verify user is participant
        chat_doc = db.collection("chats").document(chat_id).get()
        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        chat_data = chat_doc.to_dict()
        if current_user["uid"] not in chat_data["participants"]:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Get messages
        messages_ref = db.collection("messages")
        query = messages_ref.where("chat_id", "==", chat_id).order_by("created_at", direction=firestore.Query.ASCENDING)
        
        messages = []
        for doc in query.stream():
            message_data = doc.to_dict()
            message_data["id"] = doc.id
            messages.append(message_data)
        
        return {"messages": messages}
    except Exception as e:
        logger.error(f"Error getting messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages/send")
async def send_message(
    recipient_id: str,
    text: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        sender_id = current_user["uid"]
        
        # Find or create chat
        chats_ref = db.collection("chats")
        participants = sorted([sender_id, recipient_id])
        
        # Check if chat exists
        existing_chat = chats_ref.where("participants", "==", participants).stream()
        chat_docs = list(existing_chat)
        
        if chat_docs:
            chat_id = chat_docs[0].id
        else:
            # Create new chat
            chat_data = {
                "participants": participants,
                "created_at": datetime.utcnow().isoformat(),
                "last_message_at": datetime.utcnow().isoformat(),
                "last_message": text[:50]
            }
            chat_ref = db.collection("chats").document()
            chat_ref.set(chat_data)
            chat_id = chat_ref.id
        
        # Create message
        message_data = {
            "chat_id": chat_id,
            "sender_id": sender_id,
            "text": text,
            "type": "text",
            "seen": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        message_ref = db.collection("messages").document()
        message_ref.set(message_data)
        
        # Update chat last message
        db.collection("chats").document(chat_id).update({
            "last_message_at": datetime.utcnow().isoformat(),
            "last_message": text[:50]
        })
        
        # Send real-time message
        await manager.send_personal_message({
            "type": "new_message",
            "message": {**message_data, "id": message_ref.id}
        }, recipient_id)
        
        return {"success": True, "message_id": message_ref.id}
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages/send-image")
async def send_image_message(
    recipient_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Upload image
        bucket = storage.bucket()
        blob = bucket.blob(f"messages/{current_user['uid']}/{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        
        # Send message with image
        sender_id = current_user["uid"]
        
        # Find or create chat (same logic as text message)
        chats_ref = db.collection("chats")
        participants = sorted([sender_id, recipient_id])
        
        existing_chat = chats_ref.where("participants", "==", participants).stream()
        chat_docs = list(existing_chat)
        
        if chat_docs:
            chat_id = chat_docs[0].id
        else:
            chat_data = {
                "participants": participants,
                "created_at": datetime.utcnow().isoformat(),
                "last_message_at": datetime.utcnow().isoformat(),
                "last_message": "📷 Photo"
            }
            chat_ref = db.collection("chats").document()
            chat_ref.set(chat_data)
            chat_id = chat_ref.id
        
        # Create message
        message_data = {
            "chat_id": chat_id,
            "sender_id": sender_id,
            "image_url": blob.public_url,
            "type": "image",
            "seen": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        message_ref = db.collection("messages").document()
        message_ref.set(message_data)
        
        # Update chat
        db.collection("chats").document(chat_id).update({
            "last_message_at": datetime.utcnow().isoformat(),
            "last_message": "📷 Photo"
        })
        
        # Send real-time message
        await manager.send_personal_message({
            "type": "new_message",
            "message": {**message_data, "id": message_ref.id}
        }, recipient_id)
        
        return {"success": True, "message_id": message_ref.id}
    except Exception as e:
        logger.error(f"Error sending image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/messages/chats/{chat_id}/seen")
async def mark_messages_seen(chat_id: str, current_user: dict = Depends(get_current_user)):
    try:
        # Mark all messages in chat as seen
        messages_ref = db.collection("messages")
        query = messages_ref.where("chat_id", "==", chat_id).where("sender_id", "!=", current_user["uid"]).where("seen", "==", False)
        
        for doc in query.stream():
            doc.reference.update({"seen": True})
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error marking messages as seen: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    try:
        notifications_ref = db.collection("notifications")
        query = notifications_ref.where("user_id", "==", current_user["uid"]).order_by("created_at", direction=firestore.Query.DESCENDING).limit(50)
        
        notifications = []
        for doc in query.stream():
            notification_data = doc.to_dict()
            notification_data["id"] = doc.id
            
            # Get actor user info
            if notification_data.get("actor_id"):
                user_doc = db.collection("users").document(notification_data["actor_id"]).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    notification_data["actor"] = {
                        "uid": notification_data["actor_id"],
                        "username": user_data.get("username", "Unknown"),
                        "photoURL": user_data.get("photoURL")
                    }
            
            # Get post info if applicable
            if notification_data.get("post_id"):
                post_doc = db.collection("posts").document(notification_data["post_id"]).get()
                if post_doc.exists:
                    post_data = post_doc.to_dict()
                    notification_data["post"] = {
                        "id": notification_data["post_id"],
                        "media_url": post_data.get("media_url")
                    }
            
            notifications.append(notification_data)
        
        return {"notifications": notifications}
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    try:
        notification_ref = db.collection("notifications").document(notification_id)
        notification_ref.update({"is_read": True})
        return {"success": True}
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def create_notification(user_id: str, actor_id: str, type: str, post_id: str = None, comment_id: str = None):
    try:
        if user_id == actor_id:
            return  # Don't notify yourself
        
        notification_data = {
            "user_id": user_id,
            "actor_id": actor_id,
            "type": type,
            "post_id": post_id,
            "comment_id": comment_id,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("notifications").document()
        doc_ref.set(notification_data)
        
        # Get actor info for real-time notification
        actor_doc = db.collection("users").document(actor_id).get()
        actor_data = actor_doc.to_dict() if actor_doc.exists else {}
        
        # Broadcast notification
        await manager.send_personal_message({
            "type": "notification",
            "notification": {
                **notification_data,
                "id": doc_ref.id,
                "actor": {
                    "uid": actor_id,
                    "username": actor_data.get("username", "Unknown"),
                    "photoURL": actor_data.get("photoURL")
                }
            }
        }, user_id)
        
    except Exception as e:
        logger.error(f"Error creating notification: {e}")
@app.get("/api/search/users")
async def search_users(
    q: str,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    try:
        users_ref = db.collection("users")
        
        # Search by username (case-insensitive)
        query_lower = q.lower()
        users = []
        
        # Get all users and filter (for simple implementation)
        # In production, use proper text search with Algolia or similar
        all_users = users_ref.stream()
        
        for doc in all_users:
            user_data = doc.to_dict()
            username = user_data.get("username", "").lower()
            display_name = user_data.get("displayName", "").lower()
            
            if query_lower in username or query_lower in display_name:
                user_data["id"] = doc.id
                
                # Get follower count
                followers_count = len(list(
                    db.collection("follows")
                    .where("following_id", "==", doc.id)
                    .stream()
                ))
                user_data["followers"] = followers_count
                
                users.append(user_data)
                
                if len(users) >= limit:
                    break
        
        return {"users": users}
    except Exception as e:
        logger.error(f"Error searching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/explore/posts")
async def get_explore_posts(
    page: int = 1,
    limit: int = 30,
    current_user: dict = Depends(get_current_user)
):
    try:
        posts_ref = db.collection("posts")
        
        # Get trending posts (ordered by likes_count)
        query = posts_ref.order_by("likes_count", direction=firestore.Query.DESCENDING).limit(limit)
        
        if page > 1:
            offset = (page - 1) * limit
            query = query.offset(offset)
        
        posts = []
        for doc in query.stream():
            post_data = doc.to_dict()
            post_data["id"] = doc.id
            
            # Get user info
            user_doc = db.collection("users").document(post_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                post_data["user"] = {
                    "uid": post_data["user_id"],
                    "username": user_data.get("username", "Unknown"),
                    "photoURL": user_data.get("photoURL")
                }
            
            posts.append(post_data)
        
        return {"posts": posts, "has_more": len(posts) == limit}
    except Exception as e:
        logger.error(f"Error getting explore posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/posts")
async def search_posts(
    q: str,
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    try:
        posts_ref = db.collection("posts")
        
        # Search in captions (simple text search)
        query_lower = q.lower()
        posts = []
        
        # Get all posts and filter by caption
        all_posts = posts_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        
        for doc in all_posts:
            post_data = doc.to_dict()
            caption = post_data.get("caption", "").lower()
            
            if query_lower in caption:
                post_data["id"] = doc.id
                
                # Get user info
                user_doc = db.collection("users").document(post_data["user_id"]).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    post_data["user"] = {
                        "uid": post_data["user_id"],
                        "username": user_data.get("username", "Unknown"),
                        "photoURL": user_data.get("photoURL")
                    }
                
                posts.append(post_data)
                
                if len(posts) >= limit:
                    break
        
        return {"posts": posts, "has_more": len(posts) == limit}
    except Exception as e:
        logger.error(f"Error searching posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/explore/hashtags")
async def get_trending_hashtags(current_user: dict = Depends(get_current_user)):
    try:
        # Simple implementation - extract hashtags from recent posts
        posts_ref = db.collection("posts")
        recent_posts = posts_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(100).stream()
        
        hashtag_counts = {}
        
        for doc in recent_posts:
            post_data = doc.to_dict()
            caption = post_data.get("caption", "")
            
            # Extract hashtags
            import re
            hashtags = re.findall(r'#\w+', caption)
            
            for hashtag in hashtags:
                hashtag_lower = hashtag.lower()
                hashtag_counts[hashtag_lower] = hashtag_counts.get(hashtag_lower, 0) + 1
        
        # Sort by count and return top hashtags
        trending = sorted(hashtag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {"hashtags": [{
            "tag": tag,
            "count": count
        } for tag, count in trending]}
    except Exception as e:
        logger.error(f"Error getting trending hashtags: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Reels endpoints
@app.post("/api/reels")
async def create_reel(
    caption: str = "",
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Upload video to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"reels/{current_user['uid']}/{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        
        # Create reel document
        reel_data = {
            "user_id": current_user["uid"],
            "caption": caption,
            "video_url": blob.public_url,
            "likes_count": 0,
            "comments_count": 0,
            "views_count": 0,
            "officialFamelo": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("reels").document()
        doc_ref.set(reel_data)
        
        # Broadcast new reel
        await manager.broadcast({"type": "new_reel", "reel": {**reel_data, "id": doc_ref.id}})
        
        return {"success": True, "reel_id": doc_ref.id}
    except Exception as e:
        logger.error(f"Error creating reel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reels")
async def get_reels(
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    try:
        reels_ref = db.collection("reels")
        
        # Get promo settings
        settings_ref = db.collection("settings").document("promo_reels")
        settings_doc = settings_ref.get()
        settings = settings_doc.to_dict() if settings_doc.exists else {"frequency": 7, "enabled": True}
        
        if not settings.get("enabled", True):
            query = reels_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit)
            if page > 1:
                offset = (page - 1) * limit
                query = query.offset(offset)
            
            reels = []
            docs = list(query.stream())
            has_more = len(docs) == limit
            
            for doc in docs:
                reel_data = doc.to_dict()
                reel_data["id"] = doc.id
                
                user_doc = db.collection("users").document(reel_data["user_id"]).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    reel_data["user"] = {
                        "uid": reel_data["user_id"],
                        "username": user_data.get("username", "Unknown"),
                        "photoURL": user_data.get("photoURL")
                    }
                
                likes_query = db.collection("likes").where("user_id", "==", current_user["uid"]).where("reel_id", "==", doc.id)
                reel_data["is_liked"] = len(list(likes_query.stream())) > 0
                
                saves_query = db.collection("saves").where("user_id", "==", current_user["uid"]).where("reel_id", "==", doc.id)
                reel_data["is_saved"] = len(list(saves_query.stream())) > 0
                
                reels.append(reel_data)
            
            return {"reels": reels, "has_more": has_more}
        
        # Calculate how many promo reels to inject
        frequency = settings.get("frequency", 7)
        max_promo = max(1, limit // frequency)
        num_promo = random.randint(0, max_promo) if max_promo > 0 else 0
        
        # Fetch unseen active promo reels
        views_ref = db.collection("promo_reel_views")
        seen_docs = views_ref.where("user_id", "==", current_user["uid"]).stream()
        seen_reel_ids = {doc.to_dict()["reel_id"] for doc in seen_docs}
        
        promo_query = reels_ref.where("officialFamelo", "==", True).where("active", "==", True)
        promo_docs = [doc for doc in promo_query.stream() if doc.id not in seen_reel_ids]
        random.shuffle(promo_docs)
        selected_promo_docs = promo_docs[:num_promo]
        
        # Mark selected promo reels as seen
        for promo_doc in selected_promo_docs:
            views_ref.add({
                "user_id": current_user["uid"],
                "reel_id": promo_doc.id,
                "viewed_at": datetime.utcnow().isoformat()
            })
        
        # Fetch normal reels (need extra to account for promo insertion)
        normal_limit = limit + len(selected_promo_docs)
        normal_query = reels_ref.order_by("created_at", direction=firestore.Query.DESCENDING).limit(normal_limit)
        if page > 1:
            offset = (page - 1) * normal_limit
            normal_query = normal_query.offset(offset)
        
        normal_docs = list(normal_query.stream())
        normal_reels = []
        
        for doc in normal_docs:
            reel_data = doc.to_dict()
            reel_data["id"] = doc.id
            
            user_doc = db.collection("users").document(reel_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                reel_data["user"] = {
                    "uid": reel_data["user_id"],
                    "username": user_data.get("username", "Unknown"),
                    "photoURL": user_data.get("photoURL")
                }
            
            likes_query = db.collection("likes").where("user_id", "==", current_user["uid"]).where("reel_id", "==", doc.id)
            reel_data["is_liked"] = len(list(likes_query.stream())) > 0
            
            saves_query = db.collection("saves").where("user_id", "==", current_user["uid"]).where("reel_id", "==", doc.id)
            reel_data["is_saved"] = len(list(saves_query.stream())) > 0
            
            normal_reels.append(reel_data)
        
        # Enrich promo reels
        promo_reels = []
        for promo_doc in selected_promo_docs:
            reel_data = promo_doc.to_dict()
            reel_data["id"] = promo_doc.id
            
            user_doc = db.collection("users").document(reel_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                reel_data["user"] = {
                    "uid": reel_data["user_id"],
                    "username": user_data.get("username", "Unknown"),
                    "photoURL": user_data.get("photoURL")
                }
            
            likes_query = db.collection("likes").where("user_id", "==", current_user["uid"]).where("reel_id", "==", promo_doc.id)
            reel_data["is_liked"] = len(list(likes_query.stream())) > 0
            
            saves_query = db.collection("saves").where("user_id", "==", current_user["uid"]).where("reel_id", "==", promo_doc.id)
            reel_data["is_saved"] = len(list(saves_query.stream())) > 0
            
            promo_reels.append(reel_data)
        
        # Combine and randomly inject promo reels
        all_reels = normal_reels
        for promo_reel in promo_reels:
            pos = random.randint(0, len(all_reels))
            all_reels.insert(pos, promo_reel)
        
        # Trim to limit
        all_reels = all_reels[:limit]
        
        return {
            "reels": all_reels,
            "has_more": len(normal_docs) >= normal_limit
        }
    except Exception as e:
        logger.error(f"Error getting reels: {e}")
        raise HTTPException(status_code=500, detail="Failed to load reels")

@app.post("/api/reels/{reel_id}/like")
async def toggle_reel_like(reel_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        # Check if already liked
        likes_ref = db.collection("likes")
        existing_like = likes_ref.where("user_id", "==", user_id).where("reel_id", "==", reel_id)
        existing_docs = list(existing_like.stream())
        
        reel_ref = db.collection("reels").document(reel_id)
        
        if existing_docs:
            # Unlike
            for doc in existing_docs:
                doc.reference.delete()
            reel_ref.update({"likes_count": firestore.Increment(-1)})
            is_liked = False
        else:
            # Like
            likes_ref.add({
                "user_id": user_id,
                "reel_id": reel_id,
                "created_at": datetime.utcnow().isoformat()
            })
            reel_ref.update({"likes_count": firestore.Increment(1)})
            is_liked = True
        
        return {"success": True, "is_liked": is_liked}
    except Exception as e:
        logger.error(f"Error toggling reel like: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reels/{reel_id}/comments")
async def add_reel_comment(
    reel_id: str,
    text: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        comment_data = {
            "reel_id": reel_id,
            "user_id": current_user["uid"],
            "text": text,
            "created_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("comments").document()
        doc_ref.set(comment_data)
        
        # Update reel comment count
        reel_ref = db.collection("reels").document(reel_id)
        reel_ref.update({"comments_count": firestore.Increment(1)})
        
        return {"success": True, "comment_id": doc_ref.id}
    except Exception as e:
        logger.error(f"Error adding reel comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/reels/{reel_id}/save")
async def toggle_reel_save(reel_id: str, current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["uid"]
        
        # Check if already saved
        saves_ref = db.collection("saves")
        existing_save = saves_ref.where("user_id", "==", user_id).where("reel_id", "==", reel_id)
        existing_docs = list(existing_save.stream())
        
        if existing_docs:
            # Unsave
            for doc in existing_docs:
                doc.reference.delete()
            is_saved = False
        else:
            # Save
            saves_ref.add({
                "user_id": user_id,
                "reel_id": reel_id,
                "created_at": datetime.utcnow().isoformat()
            })
            is_saved = True
        
        return {"success": True, "is_saved": is_saved}
    except Exception as e:
        logger.error(f"Error toggling reel save: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------- Admin Promo Reels ----------

@app.post("/api/admin/promo-reels")
async def create_promo_reel(
    caption: str = "",
    file: UploadFile = File(...),
    topic: str = "",
    cta: str = "",
    linked_feature: str = "",
    priority: int = 0,
    current_user: dict = Depends(get_admin_user)
):
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"reels/{current_user['uid']}/promo_{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        
        reel_data = {
            "user_id": current_user["uid"],
            "caption": caption,
            "video_url": blob.public_url,
            "likes_count": 0,
            "comments_count": 0,
            "views_count": 0,
            "officialFamelo": True,
            "topic": topic,
            "cta": cta,
            "linked_feature": linked_feature,
            "priority": priority,
            "active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("reels").document()
        doc_ref.set(reel_data)
        
        return {"success": True, "reel_id": doc_ref.id}
    except Exception as e:
        logger.error(f"Error creating promo reel: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/promo-reels")
async def list_promo_reels(current_user: dict = Depends(get_admin_user)):
    try:
        reels_ref = db.collection("reels")
        query = reels_ref.where("officialFamelo", "==", True).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        reels = []
        for doc in query.stream():
            reel_data = doc.to_dict()
            reel_data["id"] = doc.id
            reels.append(reel_data)
        
        return {"reels": reels}
    except Exception as e:
        logger.error(f"Error listing promo reels: {e}")
        raise HTTPException(status_code=500, detail="Failed to load promo reels")

@app.put("/api/admin/promo-reels/{reel_id}")
async def update_promo_reel(
    reel_id: str,
    request: Request,
    current_user: dict = Depends(get_admin_user)
):
    try:
        body = await request.json()
        reel_ref = db.collection("reels").document(reel_id)
        reel_doc = reel_ref.get()
        
        if not reel_doc.exists:
            raise HTTPException(status_code=404, detail="Promo reel not found")
        
        reel_data = reel_doc.to_dict()
        if not reel_data.get("officialFamelo", False):
            raise HTTPException(status_code=400, detail="Not a promotional reel")
        
        update_data = {
            "updated_at": datetime.utcnow().isoformat()
        }
        
        allowed_fields = ["caption", "topic", "cta", "linked_feature", "priority", "active"]
        for field in allowed_fields:
            if field in body:
                update_data[field] = body[field]
        
        reel_ref.update(update_data)
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error updating promo reel: {e}")
        raise HTTPException(status_code=500, detail="Failed to update promo reel")

@app.delete("/api/admin/promo-reels/{reel_id}")
async def delete_promo_reel(reel_id: str, current_user: dict = Depends(get_admin_user)):
    try:
        reel_ref = db.collection("reels").document(reel_id)
        reel_doc = reel_ref.get()
        
        if not reel_doc.exists:
            raise HTTPException(status_code=404, detail="Promo reel not found")
        
        reel_data = reel_doc.to_dict()
        if not reel_data.get("officialFamelo", False):
            raise HTTPException(status_code=400, detail="Not a promotional reel")
        
        try:
            bucket = storage.bucket()
            blob_name = reel_data["video_url"].split("/")[-1]
            blob = bucket.blob(f"reels/{reel_data['user_id']}/{blob_name}")
            blob.delete()
        except Exception as e:
            logger.warning(f"Could not delete storage file: {e}")
        
        reel_ref.delete()
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting promo reel: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete promo reel")

@app.post("/api/admin/setup-official-account")
async def setup_official_account(user_id: str, current_user: dict = Depends(get_admin_user)):
    try:
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_ref.update({
            "isVerified": True,
            "is_admin": True,
            "updatedAt": datetime.utcnow().isoformat()
        })
        
        return {"success": True, "message": "User set as official Famelo account"}
    except Exception as e:
        logger.error(f"Error setting official account: {e}")
        raise HTTPException(status_code=500, detail="Failed to setup official account")

@app.get("/api/admin/settings/promo-reels")
async def get_promo_settings(current_user: dict = Depends(get_admin_user)):
    try:
        settings_ref = db.collection("settings").document("promo_reels")
        doc = settings_ref.get()
        if doc.exists:
            return doc.to_dict()
        return {"frequency": 7, "enabled": True}
    except Exception as e:
        logger.error(f"Error getting promo settings: {e}")
        raise HTTPException(status_code=500, detail="Failed")

@app.put("/api/admin/settings/promo-reels")
async def update_promo_settings(request: Request, current_user: dict = Depends(get_admin_user)):
    try:
        body = await request.json()
        settings_ref = db.collection("settings").document("promo_reels")
        settings_ref.set({
            "frequency": body.get("frequency", 7),
            "enabled": body.get("enabled", True),
            "updated_at": datetime.utcnow().isoformat()
        }, merge=True)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error updating promo settings: {e}")
        raise HTTPException(status_code=500, detail="Failed")

# Stories endpoints
@app.post("/api/stories")
async def create_story(
    file: UploadFile = File(...),
    duration: int = 5000,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Upload file to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"stories/{current_user['uid']}/{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        
        # Create story document
        story_data = {
            "user_id": current_user["uid"],
            "media_url": blob.public_url,
            "media_type": "image" if file.content_type.startswith("image") else "video",
            "duration": duration,
            "views": [],
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow().timestamp() + 24 * 60 * 60) * 1000  # 24 hours from now
        }
        
        doc_ref = db.collection("stories").document()
        doc_ref.set(story_data)
        
        # Broadcast new story
        await manager.broadcast({"type": "new_story", "story": {**story_data, "id": doc_ref.id}})
        
        return {"success": True, "story_id": doc_ref.id}
    except Exception as e:
        logger.error(f"Error creating story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stories")
async def get_stories(current_user: dict = Depends(get_current_user)):
    try:
        # Get current timestamp
        current_time = datetime.utcnow().timestamp() * 1000
        
        # Get all non-expired stories
        stories_ref = db.collection("stories")
        query = stories_ref.where("expires_at", ">", current_time).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        stories_by_user = {}
        for doc in query.stream():
            story_data = doc.to_dict()
            story_data["id"] = doc.id
            
            user_id = story_data["user_id"]
            if user_id not in stories_by_user:
                # Get user info
                user_doc = db.collection("users").document(user_id).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    stories_by_user[user_id] = {
                        "id": user_id,
                        "user": {
                            "uid": user_id,
                            "username": user_data.get("username", "Unknown"),
                            "photoURL": user_data.get("photoURL")
                        },
                        "hasStory": True,
                        "isViewed": current_user["uid"] in story_data.get("views", []),
                        "segments": []
                    }
            
            if user_id in stories_by_user:
                stories_by_user[user_id]["segments"].append({
                    "id": story_data["id"],
                    "type": story_data["media_type"],
                    "url": story_data["media_url"],
                    "duration": story_data["duration"],
                    "createdAt": story_data["created_at"]
                })
        
        # Convert to list and add current user's story placeholder
        stories_list = list(stories_by_user.values())
        
        # Add "Your story" at the beginning
        user_doc = db.collection("users").document(current_user["uid"]).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        your_story = {
            "id": "your-story",
            "user": {
                "uid": current_user["uid"],
                "username": user_data.get("username", "You"),
                "photoURL": user_data.get("photoURL")
            },
            "hasStory": current_user["uid"] in stories_by_user,
            "isYourStory": True,
            "segments": stories_by_user.get(current_user["uid"], {}).get("segments", [])
        }
        
        stories_list.insert(0, your_story)
        
        return {"stories": stories_list}
    except Exception as e:
        logger.error(f"Error getting stories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stories/{story_id}/view")
async def mark_story_viewed(story_id: str, current_user: dict = Depends(get_current_user)):
    try:
        story_ref = db.collection("stories").document(story_id)
        story_doc = story_ref.get()
        
        if not story_doc.exists:
            raise HTTPException(status_code=404, detail="Story not found")
        
        story_data = story_doc.to_dict()
        views = story_data.get("views", [])
        
        if current_user["uid"] not in views:
            views.append(current_user["uid"])
            story_ref.update({"views": views})
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error marking story as viewed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/stories/{story_id}")
async def delete_story(story_id: str, current_user: dict = Depends(get_current_user)):
    try:
        story_ref = db.collection("stories").document(story_id)
        story_doc = story_ref.get()
        
        if not story_doc.exists:
            raise HTTPException(status_code=404, detail="Story not found")
        
        story_data = story_doc.to_dict()
        
        # Check if user owns the story
        if story_data["user_id"] != current_user["uid"]:
            raise HTTPException(status_code=403, detail="Not authorized to delete this story")
        
        # Delete from Firestore
        story_ref.delete()
        
        # Delete from Storage
        try:
            bucket = storage.bucket()
            blob_name = story_data["media_url"].split("/")[-1]
            blob = bucket.blob(f"stories/{current_user['uid']}/{blob_name}")
            blob.delete()
        except Exception as e:
            logger.warning(f"Could not delete storage file: {e}")
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting story: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# User endpoints
@app.get("/api/users/{username}")
async def get_user_profile(username: str, current_user: dict = Depends(get_current_user)):
    try:
        users_ref = db.collection("users")
        query = users_ref.where("username", "==", username)
        
        users = list(query.stream())
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_doc = users[0]
        user_data = user_doc.to_dict()
        user_data["id"] = user_doc.id
        
        # Get posts count
        posts_count = len(list(db.collection("posts").where("user_id", "==", user_doc.id).stream()))
        user_data["posts_count"] = posts_count
        
        # Get followers count
        followers_count = len(list(db.collection("follows").where("following_id", "==", user_doc.id).stream()))
        user_data["followers_count"] = followers_count
        
        # Get following count
        following_count = len(list(db.collection("follows").where("follower_id", "==", user_doc.id).stream()))
        user_data["following_count"] = following_count
        
        # Check if current user follows this user
        if current_user["uid"] != user_doc.id:
            follow_query = db.collection("follows").where("follower_id", "==", current_user["uid"]).where("following_id", "==", user_doc.id)
            user_data["is_following"] = len(list(follow_query.stream())) > 0
        else:
            user_data["is_following"] = False
        
        return user_data
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    try:
        user_doc = db.collection("users").document(current_user["uid"]).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        user_data = user_doc.to_dict()
        user_data["id"] = user_doc.id
        
        # Get posts count
        posts_count = len(list(db.collection("posts").where("user_id", "==", user_doc.id).stream()))
        user_data["posts_count"] = posts_count
        
        # Get followers count
        followers_count = len(list(db.collection("follows").where("following_id", "==", user_doc.id).stream()))
        user_data["followers_count"] = followers_count
        
        # Get following count
        following_count = len(list(db.collection("follows").where("follower_id", "==", user_doc.id).stream()))
        user_data["following_count"] = following_count
        
        user_data["is_following"] = False
        
        return user_data
    except Exception as e:
        logger.error(f"Error getting my profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{username}/posts")
async def get_user_posts(
    username: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Get user by username
        users_ref = db.collection("users")
        query = users_ref.where("username", "==", username)
        users = list(query.stream())
        
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = users[0].id
        
        # Get user's posts
        posts_ref = db.collection("posts")
        query = posts_ref.where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        posts = []
        for doc in query.stream():
            post_data = doc.to_dict()
            post_data["id"] = doc.id
            
            # Get user info
            user_data = users[0].to_dict()
            post_data["user"] = {
                "uid": user_id,
                "username": user_data.get("username", "Unknown"),
                "photoURL": user_data.get("photoURL")
            }
            
            posts.append(post_data)
        
        return {"posts": posts}
    except Exception as e:
        logger.error(f"Error getting user posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{username}/reels")
async def get_user_reels(
    username: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Get user by username
        users_ref = db.collection("users")
        query = users_ref.where("username", "==", username)
        users = list(query.stream())
        
        if not users:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id = users[0].id
        
        # Get user's reels
        reels_ref = db.collection("reels")
        query = reels_ref.where("user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING)
        
        reels = []
        for doc in query.stream():
            reel_data = doc.to_dict()
            reel_data["id"] = doc.id
            
            # Get user info
            user_data = users[0].to_dict()
            reel_data["user"] = {
                "uid": user_id,
                "username": user_data.get("username", "Unknown"),
                "photoURL": user_data.get("photoURL")
            }
            
            reels.append(reel_data)
        
        return {"reels": reels}
    except Exception as e:
        logger.error(f"Error getting user reels: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{user_id}/follow")
async def toggle_follow(user_id: str, current_user: dict = Depends(get_current_user)):
    try:
        follower_id = current_user["uid"]
        
        if follower_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
        # Check if already following
        follows_ref = db.collection("follows")
        existing_follow = follows_ref.where("follower_id", "==", follower_id).where("following_id", "==", user_id)
        existing_docs = list(existing_follow.stream())
        
        if existing_docs:
            # Unfollow
            for doc in existing_docs:
                doc.reference.delete()
            is_following = False
        else:
            # Follow
            follows_ref.add({
                "follower_id": follower_id,
                "following_id": user_id,
                "created_at": datetime.utcnow().isoformat()
            })
            is_following = True
        
        # Broadcast follow update
        await manager.broadcast({
            "type": "follow_update",
            "follower_id": follower_id,
            "following_id": user_id,
            "is_following": is_following
        })
        
        # Create notification for new follow
        if is_following:
            await create_notification(user_id, follower_id, "follow")
        
        return {"success": True, "is_following": is_following}
    except Exception as e:
        logger.error(f"Error toggling follow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/profile")
async def update_profile(
    username: str = None,
    bio: str = None,
    display_name: str = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_ref = db.collection("users").document(current_user["uid"])
        
        update_data = {}
        if username:
            # Check if username is already taken
            existing_user = db.collection("users").where("username", "==", username).where("__name__", "!=", current_user["uid"]).stream()
            if list(existing_user):
                raise HTTPException(status_code=400, detail="Username already taken")
            update_data["username"] = username
        
        if bio is not None:
            update_data["bio"] = bio
        
        if display_name:
            update_data["display_name"] = display_name
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            user_ref.update(update_data)
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/profile/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Upload to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f"profile_pictures/{current_user['uid']}/{file.filename}")
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()
        
        # Update user profile
        user_ref = db.collection("users").document(current_user["uid"])
        user_ref.update({
            "photoURL": blob.public_url,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        return {"success": True, "photoURL": blob.public_url}
    except Exception as e:
        logger.error(f"Error uploading profile picture: {e}")
        raise HTTPException(status_code=500, detail=str(e))

try:
    from routers.ads import router as ads_router
    app.include_router(ads_router, prefix="/api", tags=["ads"])
except Exception as e:
    logger.warning(f"Ads router not loaded: {e}")

try:
    from routers.commerce import router as commerce_router
    app.include_router(commerce_router, prefix="/api", tags=["commerce"])
except Exception as e:
    logger.warning(f"Commerce router not loaded: {e}")

