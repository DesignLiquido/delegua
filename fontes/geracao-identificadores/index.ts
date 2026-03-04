/**
 * Função de geração de hashes copiada de https://stackoverflow.com/a/52171480/1314276.
 * A ideia é gerar _hashes_ únicos para nomes de arquivos importados e usar o _hash_ para os
 * pragmas de elementos catalogados pelo lexador e usados pelo interpretador.
 * @param {string} nomeArquivo Nome do arquivo
 * @param {number} semente Uma semente de dispersão, padrão: 0
 * @returns {number} Número inteiro com o hash correspondente ao nome do arquivo
 */
export function cyrb53(nomeArquivo: string, semente: number = 0): number {
    let h1 = 0xdeadbeef ^ semente,
        h2 = 0x41c6ce57 ^ semente;
    for (let i = 0, ch: number; i < nomeArquivo.length; i++) {
        ch = nomeArquivo.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export function uuidv4(): string {
    // Public Domain/MIT
    let d = new Date().getTime(); // Timestamp
    let d2 =
        (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; // Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16; // random number between 0 and 16
        if (d > 0) {
            // Use timestamp until depleted
            r = ((d + r) % 16) | 0;
            d = Math.floor(d / 16);
        } else {
            // Use microseconds since page-load if supported
            r = ((d2 + r) % 16) | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
