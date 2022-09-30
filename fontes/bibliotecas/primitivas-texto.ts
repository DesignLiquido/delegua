export default {
    'minusculo': (texto: string) => texto.toLowerCase(),
    'maiusculo': (texto: string) => texto.toUpperCase(),
    'inclui': (texto: string, elemento: any) => texto.includes(elemento),
    "substituir": (texto: string, elemento: string, substituto: string) => texto.replace(elemento, substituto),
    "subtexto": (texto: string, inicio: number, fim: number) => texto.slice(inicio, fim),
    "dividir": (texto: string, divisor: any, limite: number) => ([...texto.split(divisor, limite)]),
}