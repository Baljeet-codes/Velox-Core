#!/usr/bin/env -S zsh -i

# Esto fuerza a cargar tu entorno de Zsh y nvm/Node de Linux
source ~/.zshrc

trap "kill 0" EXIT

echo "🚀 Iniciando el Backend (FastAPI)..."
source .venv/bin/activate
uvicorn app.main:app --reload --env-file .env &

echo "🎨 Iniciando el Frontend (Vite)..."
cd frontend
npm run dev