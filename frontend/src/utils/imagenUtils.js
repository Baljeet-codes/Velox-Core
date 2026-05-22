export const imgPrincipal = (p) =>
  p.imagenes?.find((i) => i.es_principal)?.url ?? p.imagenes?.[0]?.url ?? null;
