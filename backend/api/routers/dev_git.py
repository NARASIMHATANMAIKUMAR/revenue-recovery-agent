import subprocess
import os
import shutil
from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/v1/dev", tags=["Dev"])

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

@router.get("/git-push")
def git_push(token: str = Query(...)):
    logs = []
    
    # Remove nested .git in backend if created by mistake
    nested_git = os.path.join(PROJECT_DIR, "backend", ".git")
    if os.path.exists(nested_git):
        shutil.rmtree(nested_git, ignore_errors=True)
        logs.append(f"Cleaned up nested git directory at {nested_git}")

    repo_url = f"https://NARASIMHATANMAIKUMAR:{token}@github.com/NARASIMHATANMAIKUMAR/VALTIX-Value-Aware-Recovery-Intelligence.git"
    
    def run_cmd(cmd):
        try:
            res = subprocess.run(cmd, cwd=PROJECT_DIR, capture_output=True, text=True, timeout=120)
            # Mask token in logs
            cmd_str = ' '.join(cmd).replace(token, "[TOKEN_REDACTED]")
            stdout_str = res.stdout.strip().replace(token, "[TOKEN_REDACTED]")
            stderr_str = res.stderr.strip().replace(token, "[TOKEN_REDACTED]")
            logs.append(f"$ {cmd_str}\nSTDOUT: {stdout_str}\nSTDERR: {stderr_str}\nEXIT: {res.returncode}")
            return res.returncode == 0
        except Exception as e:
            logs.append(f"ERROR executing {' '.join(cmd)}: {str(e)}")
            return False

    run_cmd(["git", "init"])
    run_cmd(["git", "branch", "-M", "main"])
    run_cmd(["git", "config", "user.name", "NARASIMHATANMAIKUMAR"])
    run_cmd(["git", "config", "user.email", "narasimhatanmaikumar@gmail.com"])
    
    if not run_cmd(["git", "remote", "add", "origin", repo_url]):
        run_cmd(["git", "remote", "set-url", "origin", repo_url])
    
    run_cmd(["git", "add", "-A"])
    run_cmd(["git", "commit", "-m", "fix: enforce immutable benchmark protection, side-effect free read operations, and audit verified financial metrics"])
    run_cmd(["git", "push", "-u", "origin", "main", "--force"])
    
    return {"status": "completed", "logs": logs}
