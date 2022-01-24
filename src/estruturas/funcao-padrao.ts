import { Callable } from "./callable";

export class FuncaoPadrao extends Callable {
    valorAridade: any;
    funcao: any;
    simbolo: any;

    constructor(valorAridade, funcao) {
        super();
        this.valorAridade = valorAridade;
        this.funcao = funcao;
    }

    chamar(interpretador: any, argumentos: any, simbolo: any): any {
        this.simbolo = simbolo;
        return this.funcao.apply(this, argumentos);
    }

    toString(): string {
        return "<função>";
    }
}
