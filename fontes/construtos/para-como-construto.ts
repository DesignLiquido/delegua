import { Bloco, Declaracao } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { ParaInterface } from '../interfaces/delegua';
import { Construto } from './construto';

export class ParaComoConstruto implements Construto, ParaInterface {
    linha: number;
    hashArquivo: number;
    inicializador?: Declaracao | Declaracao[];
    condicao: Construto;
    incrementar: Construto;
    corpo: Bloco;
    inicializada: boolean;
    blocoPosExecucao?: Bloco;
    resolverIncrementoEmExecucao: boolean;

    constructor(
        hashArquivo: number,
        linha: number,
        inicializador: Declaracao | Declaracao[],
        condicao: Construto,
        incrementar: Construto,
        corpo: Bloco
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;
        this.inicializador = inicializador;
        this.condicao = condicao;
        this.incrementar = incrementar;
        this.corpo = corpo;
        this.inicializada = false;
        this.blocoPosExecucao = undefined;
        this.resolverIncrementoEmExecucao = false;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarExpressaoPara(this);
    }

    paraTexto(): string {
        return `<para-como-construto />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
