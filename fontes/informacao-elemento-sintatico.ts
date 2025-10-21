import { ElementoMontaoTipos } from "./avaliador-sintatico/elemento-montao-tipos";

export class InformacaoElementoSintatico {
    nome: string;
    tipo: string;
    obrigatorio: boolean;
    subElementos: InformacaoElementoSintatico[] | ElementoMontaoTipos[] = [];
    documentacao: string;

    constructor(
        nome: string,
        tipo: string,
        obrigatorio: boolean = true,
        subElementos: InformacaoElementoSintatico[] | ElementoMontaoTipos[] = [],
        documentacao: string = ''
    ) {
        this.nome = nome;
        this.tipo = tipo;
        this.obrigatorio = obrigatorio;
        this.subElementos = subElementos;
        this.documentacao = documentacao;
    }

    toString(): string {
        return `<informação-elemento-sintático nome=${this.nome}, tipo=${this.tipo}, obrigatório=${this.obrigatorio ? 'verdadeiro' : 'falso'} sub-elementos=${this.subElementos.map((el) => el.toString()).join(', ')}>`;
    }
}
