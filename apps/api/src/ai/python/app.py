from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
import uvicorn

from retrieval.search_engine import HybridSearchEngine

# Data models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    query: str
    results: List[Dict[str, Any]]
    debug: Optional[Dict[str, Any]] = None

app = FastAPI(title="Offline Medicine Hybrid Search Engine")

# Global variables
search_engine = None

@app.on_event("startup")
async def startup_event():
    global search_engine
    print("Starting up Offline Hybrid Search Engine...")
    search_engine = HybridSearchEngine()
    print("Ready to serve requests!")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
        
    try:
        print(f"Received query: {request.query}")
        
        # 1. Hybrid Search Pipeline
        response_data = search_engine.search(request.query)
        
        return ChatResponse(
            query=response_data["query"],
            results=response_data["results"],
            debug=response_data.get("debug")
        )
        
    except Exception as e:
        print(f"Error during search: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
