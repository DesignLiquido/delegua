export class Callable {
    valorAridade: any;

    aridade() {
        return this.valorAridade;
    }

    chamar(interpretador?: any, argumentos?: any, simbolo?: any) {
        throw new Error("Este método não deveria ser chamado.");
    }
}
