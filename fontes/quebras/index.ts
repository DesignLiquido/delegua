export class Quebra {}

export class RetornoQuebra extends Quebra {
    valor: any;

    constructor(valor: any) {
        super();
        this.valor = valor;
    }
}

export class SustarQuebra extends Quebra {}

export class ContinuarQuebra extends Quebra {}
