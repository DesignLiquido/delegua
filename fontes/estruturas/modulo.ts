import { Chamavel } from './chamavel';

export class DeleguaModulo {
    nome: string;
    componentes: { [nome: string]: Chamavel };

    constructor(nome?: string) {
        this.nome = nome || '';
        this.componentes = {};
    }

    /**
     * Método utilizado por Delégua para inspecionar este módulo em depuração.
     * @returns {string} A representação da função como texto.
     */
    paraTexto(): string {
        return this.nome ? `<módulo ${this.nome}>` : '<módulo>';
    }

    /**
     * Método utilizado pelo VSCode para representar este módulo quando impressa.
     * @returns {string} A representação do módulo como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
