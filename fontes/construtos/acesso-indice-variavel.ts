import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Definido como `Subscript` em Égua Clássico, esse construto serve para acessar índices de
 * vetores e dicionários.
 */
export class AcessoIndiceVariavel implements Construto {
    linha: number;
    hashArquivo?: number;

    entidadeChamada: Construto;
    simboloFechamento: SimboloInterface;
    indice: any;

    constructor(
        hashArquivo: number,
        entidadeChamada: Construto,
        indice: any,
        simboloFechamento: SimboloInterface
    ) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.indice = indice;
        this.simboloFechamento = simboloFechamento;
    }

    aceitar(visitante: InterpretadorInterface) {
        return visitante.visitarExpressaoAcessoIndiceVariavel(this);
    }
}
