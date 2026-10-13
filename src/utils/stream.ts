export const espera = (min: number, max = min) =>
new Promise<void>((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

/** Simula una respuesta en streaming, palabra por palabra. */
export async function* escribir(texto: string): AsyncGenerator<string> {
  const partes = texto.match(/\S+\s*/g) ?? [];
  for (const parte of partes) {
    await espera(22, 55);
    yield parte;
  }
}

export function crearId(prefijo: string): string {
  return `${prefijo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}