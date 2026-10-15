from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="FRAMELO API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to FRAMELO API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FRAMELO API"}

@app.get("/favicon.ico")
async def favicon():
    return JSONResponse(status_code=204)

# Mock endpoints for frontend to work
@app.get("/posts/feed")
async def get_feed():
    return {"posts": [], "has_more": False, "next_page": None}

@app.post("/posts/{post_id}/like")
async def toggle_like(post_id: str):
    return {"action": "liked", "likes_count": 1, "is_liked": True}

@app.post("/posts/{post_id}/save")
async def toggle_save(post_id: str):
    return {"action": "saved", "is_saved": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_minimal:app", host="127.0.0.1", port=8000, reload=True)