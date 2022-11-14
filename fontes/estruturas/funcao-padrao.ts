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

    paraTexto(): string {
        return '<função>';
    }
}
