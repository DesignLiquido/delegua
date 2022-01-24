import { Callable } from "./callable";

export class FuncaoPadrao extends Callable {
    valorAridade: any;
    função: any;
    simbolo: any;

    constructor(valorAridade, função) {
        super();
        this.valorAridade = valorAridade;
        this.função = função;
    }

    chamar(interpretador: any, argumentos: any, simbolo: any): any {
        this.simbolo = simbolo;
        return this.função.apply(this, argumentos);
    }

    toString(): string {
        return "<função>";
    }
}
