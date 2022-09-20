import { Chamavel } from "./chamavel";

export class MetodoPrimitiva extends Chamavel {
    primitiva: any;
    metodo: Function;

    constructor(primitiva: any, metodo: Function, aridade: number) {
        super();
        this.primitiva = primitiva;
        this.metodo = metodo;
        this.valorAridade = aridade;
    }

    chamar() {
        return this.metodo(this.primitiva);
    }
}
