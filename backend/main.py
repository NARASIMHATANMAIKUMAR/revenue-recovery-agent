from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routers import webhook, agent, execution, observability, dev_git

app = FastAPI(
    title="Razorpay Revenue Recovery Agent API",
    description="Autonomous Agent for Payment Failure Recovery, Policy Enforcement, and Expected Utility Optimization.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook.router)
app.include_router(agent.router)
app.include_router(execution.router)
app.include_router(observability.router)
app.include_router(dev_git.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Razorpay Revenue Recovery Agent API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
