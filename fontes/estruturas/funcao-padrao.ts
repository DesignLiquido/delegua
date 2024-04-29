import { SimboloInterface, VisitanteComumInterface } from '../interfaces';
import { Chamavel } from './chamavel';

/**
 * Uma `FuncaoPadrao` normalmente é uma função em JavaScript que representa um 
 * método de uma biblioteca global, mas que pode ser usada para outros casos.
 */
export class FuncaoPadrao extends Chamavel {
    valorAridade: number;
    funcao: Function;
    simbolo: SimboloInterface;

    constructor(valorAridade: number, funcao: Function) {
        super();
        this.valorAridade = valorAridade;
        this.funcao = funcao;
    }

    async chamar(visitante: VisitanteComumInterface, argumentos: any[], simbolo: SimboloInterface): Promise<any> {
        return this.chamarInterno(argumentos, simbolo);
    }

    protected async chamarInterno(argumentos: any[], simbolo: SimboloInterface): Promise<any> {
        this.simbolo = simbolo;
        return await this.funcao.apply(this, argumentos);
    }

    /**
     * Método utilizado por Delégua para inspecionar esta função em depuração.
     * @returns {string} A representação da função como texto.
     */
    paraTexto(): string {
        return `<função padrão nome=${this.simbolo.lexema}>`;
    }

    /**
     * Método utilizado pelo VSCode para representar esta função quando impressa.
     * @returns {string} A representação da classe como texto.
     */
    toString(): string {
        return this.paraTexto();
    }
}
