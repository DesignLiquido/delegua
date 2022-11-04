export class Chamavel {
    valorAridade: number;

    aridade(): number {
        return this.valorAridade;
    }

    chamar(interpretador?: any, argumentos?: any, simbolo?: any): any {
        throw new Error('Este método não deveria ser chamado.');
    }
}
