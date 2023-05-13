import { Construto } from '../construtos';
import { VisitanteComumInterface } from '../interfaces'
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

/**
 * Uma estrutura de repetição `para`, normalmente com um inicializador,
 * uma condição de continuação e uma instrução de incremento.
 */
export class Para extends Declaracao {
    inicializador: any;
    condicao: any;
    incrementar: Construto;
    corpo: Bloco;
    inicializada: boolean;
    blocoPosExecucao?: Bloco;
    resolverIncrementoEmExecucao: boolean;

    constructor(
        hashArquivo: number,
        linha: number,
        inicializador: any,
        condicao: any,
        incrementar: Construto,
        corpo: Bloco
    ) {
        super(linha, hashArquivo);
        this.inicializador = inicializador;
        this.condicao = condicao;
        this.incrementar = incrementar;
        this.corpo = corpo;
        this.inicializada = false;
        this.blocoPosExecucao = undefined;
        this.resolverIncrementoEmExecucao = false;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoPara(this);
    }
}
