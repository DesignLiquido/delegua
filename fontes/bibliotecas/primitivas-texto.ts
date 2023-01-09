export default {
    dividir: (texto: string, divisor: any, limite: number) => [
        ...texto.split(divisor, limite),
    ],
    fatiar: (texto: string, inicio: number, fim: number) =>
        texto.slice(inicio, fim),
    inclui: (texto: string, elemento: any) => texto.includes(elemento),
    maiusculo: (texto: string) => texto.toUpperCase(),
    minusculo: (texto: string) => texto.toLowerCase(),
    substituir: (texto: string, elemento: string, substituto: string) =>
        texto.replace(elemento, substituto),
    subtexto: (texto: string, inicio: number, fim: number) =>
        texto.slice(inicio, fim),
    tamanho: (texto: string) => texto.length
};
