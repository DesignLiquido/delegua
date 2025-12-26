export class DeleguaFuncaoMock {
    private fn: (...args: any[]) => any;

    constructor(fn: (...args: any[]) => any) {
        this.fn = fn;
    }

    async chamar(_interpretador: any, argumentos: any[]) {
        // Em muitos casos o código espera que o retorno seja uma Promise que resolva
        // para um objeto (ex.: { valorRetornado: { valor: true } }) ou um valor primitivo.
        return Promise.resolve(this.fn(...argumentos));
    }
}
