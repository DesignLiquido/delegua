import { Chamavel } from './chamavel';

/**
 * Classe de importação de classes de bibliotecas do JavaScript.
 */
export class ClassePadrao extends Chamavel {
    nome: string;
    // TypeScript não tem exatamente um tipo de construtor para classe.
    // O tipo abaixo é o mais próximo que existe desse tipo.
    funcaoDeClasse: { new(...args: any[]): any; };

    constructor(nome: string, funcaoDeClasse: { new(...args: any[]): any; }) {
        super();
        this.nome = nome;
        this.funcaoDeClasse = funcaoDeClasse;
    }

    /**
     * Método utilizado pelo VSCode para inspecionar esta classe em depuração.
     * @returns {string} A representação da classe como texto.
     */
    toString(): string {
        return `<classe-padrão ${this.nome}>`;
    }

    /**
     * Método utilizado por Delégua para representar esta classe quando impressa.
     * @returns {string} A representação da classe como texto.
     */
    paraTexto(): string {
        return `<classe-padrão ${this.nome}>`;
    }

    /**
     * Para o caso de uma classe padrão, instanciá-la é chamá-la
     * como função tendo a palavra 'new' na frente.
     * @param argumentos
     * @param simbolo
     */
    chamar(argumentos: any[], simbolo: any): any {
        const novoObjeto: any = new this.funcaoDeClasse(argumentos);
        return novoObjeto;
    }
}
