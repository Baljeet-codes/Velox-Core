#!/usr/bin/env bash
set -e

trap "kill 0 2>/dev/null; echo ''; echo '👋 Servidores detenidos.'" EXIT

# ── Detección de puertos disponibles ──
encontrar_puerto() {
  local base=$1
  local puerto=$base
  while lsof -iTCP -sTCP:LISTEN -nP 2>/dev/null | awk '{print $9}' | grep -q ":$puerto$"; do
    puerto=$((puerto + 1))
  done
  echo "$puerto"
}

BACKEND_PORT=$(encontrar_puerto 8001)
FRONTEND_PORT=$(encontrar_puerto 5175)

echo "╔══════════════════════════════════╗"
echo "║     VELOX-CORE — Inicio rápido   ║"
echo "╚══════════════════════════════════╝"
echo ""

# ── Backend ──
echo "📦 Preparando backend..."
if [ ! -d ".venv" ]; then
  echo "   → Creando entorno virtual..."
  python3 -m venv .venv
fi
source .venv/bin/activate
echo "   → Instalando dependencias..."
pip install -q -r requirements.txt
echo "   → Iniciando FastAPI en :$BACKEND_PORT..."
BACKEND_PID=""
FRONTEND_PID=""
uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT" &
BACKEND_PID=$!

# ── Frontend ──
echo "🎨 Preparando frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "   → Instalando dependencias..."
  npm install
fi
echo "   → Iniciando Vite en :$FRONTEND_PORT..."
BACKEND_PORT="$BACKEND_PORT" VITE_PORT="$FRONTEND_PORT" VITE_API_URL="http://localhost:$BACKEND_PORT" npm run dev -- --port "$FRONTEND_PORT" &
FRONTEND_PID=$!

echo ""
echo "✅ Backend:  http://localhost:$BACKEND_PORT"
echo "✅ Frontend: http://localhost:$FRONTEND_PORT"
echo "✅ Docs API: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores."
echo ""

wait
