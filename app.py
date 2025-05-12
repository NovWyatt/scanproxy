# This file is a simple entrypoint for Vercel
# It imports the FastAPI app instance from api/index.py

from api.index import app

# This import is enough for Vercel to detect the app variable and use it