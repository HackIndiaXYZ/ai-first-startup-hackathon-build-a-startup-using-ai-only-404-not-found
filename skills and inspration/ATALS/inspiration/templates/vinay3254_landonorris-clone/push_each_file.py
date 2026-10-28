import os
import subprocess
import time
from pathlib import Path

REPO_DIR = Path("/home/vinay/landonorris-clone")
OWNER = "vinay3254"
REPO_NAME = "landonorris-clone"
REPO_URL = f"https://github.com/{OWNER}/{REPO_NAME}.git"

def run_cmd(cmd, cwd=REPO_DIR, check=True):
    print(f"[{cwd}] $ {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True)
    if res.returncode != 0 and check:
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        raise RuntimeError(f"Command failed: {' '.join(cmd)}")
    return res

def main():
    # 1. Create remote repo if not existing
    check_repo = run_cmd(["gh", "repo", "view", f"{OWNER}/{REPO_NAME}"], check=False)
    if check_repo.returncode != 0:
        print(f"Creating GitHub repo {OWNER}/{REPO_NAME}...")
        run_cmd([
            "gh", "repo", "create", f"{OWNER}/{REPO_NAME}",
            "--public",
            "--description", "Live 3D WebGL & Rive clone of Lando Norris official website (landonorris.com)"
        ])
    else:
        print(f"Repository {OWNER}/{REPO_NAME} already exists.")

    # 2. Setup local git repo
    git_dir = REPO_DIR / ".git"
    if not git_dir.exists():
        run_cmd(["git", "init", "-b", "main"])
    
    run_cmd(["git", "config", "user.name", "vinay3254"])
    run_cmd(["git", "config", "user.email", "vinaygk219@gmail.com"])
    run_cmd(["git", "config", "http.postBuffer", "524288000"])
    run_cmd(["git", "config", "http.lowSpeedLimit", "0"])
    run_cmd(["git", "config", "http.lowSpeedTime", "999999"])

    # Ensure remote origin is set
    run_cmd(["git", "remote", "remove", "origin"], check=False)
    run_cmd(["git", "remote", "add", "origin", REPO_URL])

    # 3. Find all files to commit individually
    ignore_files = {".git", ".DS_Store"}
    all_files = []
    for root, dirs, files in os.walk(REPO_DIR):
        # Skip .git
        if ".git" in root:
            continue
        for f in sorted(files):
            full_path = Path(root) / f
            rel_path = full_path.relative_to(REPO_DIR)
            if str(rel_path) in ignore_files or any(part.startswith(".") for part in rel_path.parts if part != ".gitignore"):
                continue
            all_files.append(rel_path)

    # Put README and .gitignore first
    sorted_files = []
    if Path(".gitignore") in all_files:
        sorted_files.append(Path(".gitignore"))
        all_files.remove(Path(".gitignore"))
    if Path("README.md") in all_files:
        sorted_files.append(Path("README.md"))
        all_files.remove(Path("README.md"))
    sorted_files.extend(sorted(all_files))

    print(f"Total files to commit individually: {len(sorted_files)}")

    commit_count = 0
    BATCH_PUSH_INTERVAL = 30

    for idx, fpath in enumerate(sorted_files, 1):
        rel_str = str(fpath)
        # Check if file has changes or is untracked
        status_res = run_cmd(["git", "status", "--porcelain", "--", rel_str], check=False)
        if status_res.stdout.strip():
            run_cmd(["git", "add", "--", rel_str])
            msg = f"Add {rel_str}"
            run_cmd(["git", "commit", "-m", msg])
            commit_count += 1
            print(f"[{idx}/{len(sorted_files)}] Committed: {rel_str}")

            if commit_count % BATCH_PUSH_INTERVAL == 0:
                print(f"\n--- Batch Pushing {commit_count} commits to origin main ---")
                run_cmd(["git", "push", "-u", "origin", "main"])
                time.sleep(1)

    # Final push for remaining commits
    print("\n--- Performing final push to origin main ---")
    run_cmd(["git", "push", "-u", "origin", "main"])
    print(f"\nSuccessfully pushed all {commit_count} individual file commits to {REPO_URL}!")

if __name__ == "__main__":
    main()
