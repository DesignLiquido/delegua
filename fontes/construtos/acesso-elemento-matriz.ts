import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class AcessoElementoMatriz<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    entidadeChamada: Construto;
    simboloFechamento: SimboloInterface<TTipoSimbolo>;
    indicePrimario: Construto;
    indiceSecundario: Construto;

    constructor(
        hashArquivo: number,
        entidadeChamada: Construto,
        indicePrimario: Construto,
        indiceSegundario: Construto,
        simboloFechamento: SimboloInterface<TTipoSimbolo>
    ) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.indicePrimario = indicePrimario;
        this.indiceSecundario = indiceSegundario;
        this.simboloFechamento = simboloFechamento;
    }
    valor?: any;
    tipo?: string;

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoElementoMatriz(this);
    }

    paraTexto(): string {
        return (
            `<acesso-elemento-matriz entidadeChamada=${this.entidadeChamada.paraTexto()} ` +
            `indicePrimário=${this.indicePrimario.paraTexto()} ` +
            `indiceSecundário=${this.indiceSecundario.paraTexto()} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
