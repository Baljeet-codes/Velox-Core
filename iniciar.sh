#!/usr/bin/env bash
set -e

trap "kill 0 2>/dev/null; echo ''; echo '👋 Servidores detenidos.'" EXIT

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
echo "   → Iniciando FastAPI en :8000..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# ── Frontend ──
echo "🎨 Preparando frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "   → Instalando dependencias..."
  npm install
fi
echo "   → Iniciando Vite en :5173..."
npm run dev &

echo ""
echo "✅ Backend:  http://localhost:8000"
echo "✅ Frontend: http://localhost:5173"
echo "✅ Docs API: http://localhost:8000/docs"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores."
echo ""

wait
