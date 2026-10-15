from fastapi import APIRouter, HTTPException, Depends, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta
import os
import hashlib
import json

router = APIRouter()
security = HTTPBearer()

DATA_DIR = "data"

def load_json(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_json(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# Simple password hashing fallback
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# Try to use bcrypt if available, otherwise use simple hashing
try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    USE_BCRYPT = True
except ImportError:
    USE_BCRYPT = False

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict):
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as e:
        print(f"Token creation error: {e}")
        raise

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        users = load_json('users.json')
        user = next((u for u in users if u['id'] == user_id), None)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

@router.post("/register")
async def register(email: str = Form(...), password: str = Form(...), username: str = Form(...), full_name: str = Form(...)):
    users = load_json('users.json')
    
    # Validate input
    if not email or not email.strip():
        raise HTTPException(status_code=400, detail="Email is required")
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not username or not username.strip():
        raise HTTPException(status_code=400, detail="Username is required")
    if not full_name or not full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required")
    
    # Check if email or username already exists
    if any(u['email'].lower() == email.lower() for u in users):
        raise HTTPException(status_code=409, detail="Email already registered")
    if any(u['username'].lower() == username.lower() for u in users):
        raise HTTPException(status_code=409, detail="Username already taken")
    
    try:
        user_id = max([u['id'] for u in users], default=0) + 1
        if USE_BCRYPT:
            hashed_password = pwd_context.hash(password)
        else:
            hashed_password = hash_password(password)
        
        user = {
            "id": user_id,
            "email": email.lower().strip(),
            "username": username.strip(),
            "full_name": full_name.strip(),
            "hashed_password": hashed_password,
            "bio": "",
            "avatar_url": "",
            "is_verified": False,
            "created_at": datetime.now().isoformat()
        }
        
        users.append(user)
        save_json('users.json', users)
        
        access_token = create_access_token(data={"sub": str(user_id)})
        
        user_data = {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "full_name": user["full_name"],
            "bio": user.get("bio", ""),
            "avatar_url": user.get("avatar_url", "")
        }
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")

@router.post("/login")
async def login(email: str = Form(...), password: str = Form(...)):
    try:
        # Validate input
        if not email or not email.strip():
            raise HTTPException(status_code=400, detail="Email is required")
        if not password:
            raise HTTPException(status_code=400, detail="Password is required")
        
        users = load_json('users.json')
        user = next((u for u in users if u['email'].lower() == email.lower().strip()), None)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Try bcrypt first, then fallback to simple hash
        password_valid = False
        if USE_BCRYPT:
            try:
                password_valid = pwd_context.verify(password, user['hashed_password'])
            except:
                password_valid = verify_password(password, user['hashed_password'])
        else:
            password_valid = verify_password(password, user['hashed_password'])
        
        if not password_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        access_token = create_access_token(data={"sub": str(user['id'])})
        
        user_data = {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "full_name": user["full_name"],
            "bio": user.get("bio", ""),
            "avatar_url": user.get("avatar_url", "")
        }
        
        return {"access_token": access_token, "token_type": "bearer", "user": user_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "username": current_user["username"],
        "full_name": current_user["full_name"],
        "bio": current_user.get("bio", ""),
        "avatar_url": current_user.get("avatar_url", "")
    }