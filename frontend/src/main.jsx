import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Importamos el CSS de Bootstrap (estructura base y grillas)
import 'bootstrap/dist/css/bootstrap.min.css'

// 2. Importamos TU CSS global (el tema oscuro/minimalista/cyan)
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)