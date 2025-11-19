export class ElementoMontaoTipos {
    tipo: string;
    endereco?: string;
    subElementos: { [nome: string]: ElementoMontaoTipos };

    constructor(tipo: string, subElementos: { [nome: string]: ElementoMontaoTipos } = {}) {
        this.tipo = tipo;
        this.subElementos = subElementos;
    }
}
