export class InformacaoElementoSintatico {
    nome: string;
    tipo: string;
    obrigatorio: boolean;
    subElementos: InformacaoElementoSintatico[] = [];
    documentacao: string;

    constructor(
        nome: string,
        tipo: string,
        obrigatorio: boolean = true,
        elementos: InformacaoElementoSintatico[] = [],
        documentacao: string = ''
    ) {
        this.nome = nome;
        this.tipo = tipo;
        this.obrigatorio = obrigatorio;
        this.subElementos = elementos;
        this.documentacao = documentacao;
    }

    toString(): string {
        return `<informação-elemento-sintático nome=${this.nome}, tipo=${this.tipo}, obrigatório=${this.obrigatorio ? 'verdadeiro' : 'falso'} sub-elementos=${this.subElementos.map((el) => el.toString()).join(', ')}>`;
    }
}
