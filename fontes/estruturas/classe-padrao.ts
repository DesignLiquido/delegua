import { Chamavel } from './chamavel';
import { ObjetoPadrao } from './objeto-padrao';

/**
 * Classe de importação de classes de bibliotecas do JavaScript.
 */
export class ClassePadrao extends Chamavel {
    nome: string;
    funcaoDeClasse: any;

    constructor(nome: string, funcaoDeClasse: any) {
        super();
        this.nome = nome;
        this.funcaoDeClasse = funcaoDeClasse;
    }

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
        const novoObjeto: any = new this.funcaoDeClasse();
        return novoObjeto;
    }
}
