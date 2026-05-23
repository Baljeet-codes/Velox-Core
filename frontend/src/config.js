// ════════════════════════════════════════════════════════════════
// ÚNICO PUNTO DE CONFIGURACIÓN DE URL BASE
// VITE_API_URL se inyecta en build por Vite:
//   - Local:     .env  → http://localhost:8001
//   - Producción: variable de entorno en Amplify → ALB / CloudFront
// ════════════════════════════════════════════════════════════════
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
