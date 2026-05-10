import { VisitanteComumInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';
import { ParaInterface } from '../interfaces/delegua';
import { Bloco } from './bloco';
import { Declaracao } from './declaracao';

/**
 * Uma estrutura de repetição `para`, normalmente com um inicializador,
 * uma condição de continuação e uma instrução de incremento.
 */
export class Para extends Declaracao implements ParaInterface {
    inicializador?: Declaracao | Declaracao[];
    condicao: ConstrutoInterface;
    incrementar: ConstrutoInterface;
    corpo: Bloco;
    inicializada: boolean;
    blocoPosExecucao?: Bloco;
    resolverIncrementoEmExecucao: boolean;

    constructor(
        hashArquivo: number,
        linha: number,
        inicializador: Declaracao | Declaracao[],
        condicao: ConstrutoInterface,
        incrementar: ConstrutoInterface,
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

    paraTexto(): string {
        let inicializador = '';
        if (Array.isArray(this.inicializador)) {
            inicializador = this.inicializador.map((d) => d.paraTexto()).join(' ');
        } else if (this.inicializador) {
            inicializador = this.inicializador.paraTexto();
        }
        return `<para inicializador=[${inicializador}] condição=${this.condicao.paraTexto()} incremento=${this.incrementar.paraTexto()}>${this.corpo.paraTexto()}</para>`;
    }
}


