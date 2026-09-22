import { Bloco, Declaracao } from '../declaracoes';
import { VisitanteDeleguaInterface } from '../interfaces';
import { ParaInterface } from '../interfaces/delegua';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class ParaComoConstruto implements ConstrutoInterface, ParaInterface {
    linha: number;
    hashArquivo: number;
    inicializador?: Declaracao | Declaracao[];
    condicao: ConstrutoInterface;
    incrementar: ConstrutoInterface;
    corpo: Bloco;
    inicializada: boolean;
    blocoPosExecucao?: Bloco;
    resolverIncrementoEmExecucao: boolean;
    comParenteses: boolean;

    constructor(
        hashArquivo: number,
        linha: number,
        inicializador: Declaracao | Declaracao[],
        condicao: ConstrutoInterface,
        incrementar: ConstrutoInterface,
        corpo: Bloco,
        comParenteses: boolean = true
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
        this.comParenteses = comParenteses;
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
