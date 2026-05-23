// ════════════════════════════════════════════════════════════════
// PUNTO DE ENTRADA DE LA SPA
// - Monta React 18 con StrictMode
// - Importa Bootstrap CSS global
// - Renderiza App.jsx que contiene HashRouter
// ════════════════════════════════════════════════════════════════
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

console.log('Velox-Core v2')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)