import { Chamavel } from './chamavel';

/**
 * Uma `FuncaoPadrao` normalmente é uma função em JavaScript.
 */
export class FuncaoPadrao extends Chamavel {
    valorAridade: number;
    funcao: Function;
    simbolo: any;

    constructor(valorAridade: number, funcao: Function) {
        super();
        this.valorAridade = valorAridade;
        this.funcao = funcao;
    }

    async chamar(argumentos: any[], simbolo: any): Promise<any> {
        this.simbolo = simbolo;
        return await this.funcao.apply(this, argumentos);
    }

    /**
     * Método utilizado por Delégua para inspecionar esta função em depuração.
     * @returns {string} A representação da função como texto.
     */
    paraTexto(): string {
        return '<função>';
    }

    /**
     * Método utilizado pelo VSCode para representar esta função quando impressa.
     * @returns {string} A representação da classe como texto.
     */
    toString(): string {
        return '<função>';
    }
}
