/**
 * Um objeto padrão é uma instância de uma Classe Padrão (JavaScript).
 * TODO: Marcado para depreciação em futuras versões.
 */
export class ObjetoPadrao {
    classePadrao: string;

    constructor(classePadrao: string) {
        this.classePadrao = classePadrao;
    }

    /**
     * Método utilizado por Delégua para inspecionar este objeto em depuração.
     * @returns {string} A representação do objeto como texto.
     */
    paraTexto(): string {
        let retornoTexto = `<objeto-padrão da classe ${this.classePadrao}>\n`;
        for (const [nome, valor] of Object.entries(this)) {
            retornoTexto += `    - ${nome}: ${valor}\n`;
        }
        retornoTexto += `</objeto-padrão>`;
        return retornoTexto;
    }

    /**
     * Método utilizado pelo VSCode para representar este objeto quando impresso.
     * @returns {string} A representação do objeto como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
