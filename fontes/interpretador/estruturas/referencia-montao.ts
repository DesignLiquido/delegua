export class ReferenciaMontao {
    endereco: string;

    constructor(endereco: string) {
        this.endereco = endereco;
    }

    /**
     * Método utilizado por Delégua para inspecionar este objeto em depuração.
     * @returns {string} A representação da referência como texto.
     */
    paraTexto(): string {
        return `<ReferênciaMontão endereco=${this.endereco}>`;
    }

    /**
     * Método utilizado pelo VSCode para representar este objeto quando impresso.
     * @returns {string} A representação da referência como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
