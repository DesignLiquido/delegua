export class Quebra {
    preservarEscopo: boolean;

    constructor() {
        this.preservarEscopo = false;
    }
}

export class RetornoQuebra extends Quebra {
    valor: any;
    tipo: string;

    constructor(valor: any, tipo: string = 'qualquer') {
        super();
        this.valor = valor;
        this.tipo = tipo;
    }
}

export class SustarQuebra extends Quebra {}

export class ContinuarQuebra extends Quebra {}
