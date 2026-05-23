// ════════════════════════════════════════════════════════════════
// Utilidad: extrae la URL de la imagen principal de un producto
// Orden de resolución:
//   1. Imagen con es_principal = true
//   2. Primera imagen del array
//   3. null → el componente renderiza "SIN IMAGEN"
// ════════════════════════════════════════════════════════════════
export const imgPrincipal = (p) =>
  p?.imagenes?.find((i) => i.es_principal)?.url ?? p?.imagenes?.[0]?.url ?? null;
