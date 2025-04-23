export class Quebra {
    preservarEscopo: boolean;

    constructor() {
        this.preservarEscopo = false;
    }
}

export class RetornoQuebra extends Quebra {
    valor: any;

    constructor(valor: any) {
        super();
        this.valor = valor;
    }
}

export class SustarQuebra extends Quebra {}

export class ContinuarQuebra extends Quebra {}
