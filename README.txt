RMBuild — How to run the project

What you need installed first:

Python 3.11 or newer (https://www.python.org/downloads/)
Node.js 18 or newer (https://nodejs.org/)
Git (https://git-scm.com/)
Poppler (only if you want the AI floor-plan upload to work)
Windows: download from https://github.com/oschwartz10612/poppler-windows/releases, unzip, then set an environment variable POPPLER_PATH pointing to the "Library/bin" folder
Mac: brew install poppler
Linux: sudo apt install poppler-utils
Step 1 — Get the code

Open a terminal and run:


git clone <repo-url> rmbuild
cd rmbuild
Step 2 — Set up the backend


pip install fastapi uvicorn pydantic anthropic pdf2image python-multipart
Create a file at backend/.env containing:


ANTHROPIC_API_KEY=your-key-here
RMBUILD_ADMIN_PASSWORD=pick-any-password
(Get an Anthropic key from https://console.anthropic.com/settings/keys — only needed for the AI floor-plan feature. Skip if you only want the manual estimator.)

Step 3 — Set up the frontend

In a new terminal:


cd frontend
npm install
Step 4 — Run it

You need two terminals open at the same time.

Terminal 1 (backend):


python -m uvicorn backend.main:app --reload --port 8001
Terminal 2 (frontend):


cd frontend
npm run dev