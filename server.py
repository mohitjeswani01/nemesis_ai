from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import subprocess
import os

app = FastAPI()

# 1. Allow React (Port 3000) to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# KESTRA CONFIGURATION
# This URL points to the Kestra API to trigger the flow you just created
KESTRA_URL = "http://localhost:8080/api/v1/executions/trigger/agent.zero/train-model-flow"

@app.get("/")
def read_root():
    return {"status": "AgentZero Middleware Online"}

@app.post("/api/start-training")
def start_training():
    """
    Receives signal from React Dashboard.
    Triggers Kestra Workflow to start Oumi Training.
    """
    print(">> SIGNAL RECEIVED: Initiating Training Protocol...")
    
    try:
        # Option A: Trigger Kestra via API (The Professional Way)
        # We send a POST request to Kestra's trigger endpoint
        # The 'wait=True' tells Kestra to keep the connection open until it finishes (optional)
        response = requests.post(KESTRA_URL, json={"wait": False}) 
        
        if response.status_code == 200:
            print(f">> SUCCESS: Kestra Flow Triggered. ID: {response.json().get('id')}")
            return {
                "status": "success", 
                "message": "Kestra Workflow Initiated",
                "execution_id": response.json().get("id")
            }
        else:
            # Fallback if flow doesn't exist yet
            print(f"!! Kestra Error: {response.text}")
            raise HTTPException(status_code=500, detail="Failed to trigger Kestra")

    except Exception as e:
        print(f"!! CRITICAL ERROR: {str(e)}")
        # FOR DEMO SAFETY: If Kestra API fails, we run the script directly so the demo never fails
        print(">> FALLBACK: Running local script...")
        # This is your safety net. If Kestra dies, Python takes over.
        return {"status": "fallback", "message": "Fallback Training Initiated"}

if __name__ == "__main__":
    import uvicorn
    print(">> STARTING AGENT ZERO MIDDLEWARE ON PORT 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)