import { Chamavel } from "./chamavel";

export class FuncaoPadrao extends Chamavel {
    valorAridade: number;
    funcao: Function;
    simbolo: any;

    constructor(valorAridade: number, funcao: Function) {
        super();
        this.valorAridade = valorAridade;
        this.funcao = funcao;
    }

    chamar(interpretador: any, argumentos: any, simbolo: any): any {
        this.simbolo = simbolo;
        return this.funcao.apply(this, argumentos);
    }

    paraTexto(): string {
        return "<função>";
    }
}
