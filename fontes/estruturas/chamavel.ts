export class Chamavel {
    valorAridade: number;

    aridade(): number {
        return this.valorAridade;
    }

    async chamar(interpretador?: any, argumentos?: any, simbolo?: any): Promise<any> {
        return Promise.reject(new Error('Este método não deveria ser chamado.'));
    }
}
