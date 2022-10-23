/**
 * Um objeto padrão é uma instância de uma Classe Padrão (JavaScript).
 */
export class ObjetoPadrao {
    classePadrao: string;

    constructor(classePadrao: string) {
        this.classePadrao = classePadrao;
    }

    paraTexto(): string {
        let retornoTexto = `<objeto-padrão da classe ${this.classePadrao}>\n`;
        for (const [nome, valor] of Object.entries(this)) {
            retornoTexto += `    - ${nome}: ${valor}\n`
        }
        retornoTexto += `</objeto-padrão>`
        return retornoTexto;
    }
}