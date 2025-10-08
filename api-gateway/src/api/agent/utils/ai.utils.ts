export function sanitizeFunctionName(name: string): string {
  // Remueve caracteres no válidos y reemplaza espacios/caracteres especiales con guiones bajos
  let sanitized = name
    .trim()
    .replace(/[^a-zA-Z0-9_.:+-]/g, '_') // Reemplaza caracteres no válidos con _
    .replace(/^[^a-zA-Z_]+/, '') // Asegura que empiece con letra o guión bajo
    .substring(0, 64); // Limita a 64 caracteres

  // Si después de sanitizar está vacío o no empieza con letra/guión bajo, agrega un prefijo
  if (!sanitized || !/^[a-zA-Z_]/.test(sanitized)) {
    sanitized = 'tool_' + (sanitized || 'default');
  }

  return sanitized;
}
