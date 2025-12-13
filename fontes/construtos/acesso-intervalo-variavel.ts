import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Construto para acesso de intervalos (fatiamento/slicing) em vetores.
 * Ex: vetor[1:4], vetor[1:], vetor[:3] ou vetor[:]
 */
export class AcessoIntervaloVariavel<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    entidadeChamada: Construto;
    simboloFechamento: SimboloInterface<TTipoSimbolo>;
    indiceInicio: Construto | null;
    indiceFim: Construto | null;
    tipo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        entidadeChamada: Construto,
        indiceInicio: Construto | null,
        indiceFim: Construto | null,
        simboloFechamento: SimboloInterface<TTipoSimbolo>,
        tipo: string = 'qualquer'
    ) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.indiceInicio = indiceInicio;
        this.indiceFim = indiceFim;
        this.simboloFechamento = simboloFechamento;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoIntervaloVariavel(this);
    }

    paraTexto(): string {
        const inicio = this.indiceInicio ? this.indiceInicio.paraTexto() : 'sem-início';
        const fim = this.indiceFim ? this.indiceFim.paraTexto() : 'sem-fim';

        return (
            `<acesso-índice-variável entidadeChamada=${this.entidadeChamada.paraTexto()} ` +
            `inicio=${inicio} ` +
            `fim=${fim}` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
