import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';
import { Literal } from './literal';

/**
 * Construto de atribuição de um valor a um símbolo.
 */
export class Atribuir<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    indice?: Literal;

    simbolo: SimboloInterface<TTipoSimbolo>;
    valor: any;

    constructor(
        hashArquivo: number,
        simbolo: SimboloInterface<TTipoSimbolo>,
        valor: any,
        // indice so é usado para variaveis de vetores
        // TODO: criar alguma validaçao para garantir que indice so seja passado para variaveis de vetores
        indice?: Literal
    ) {
        this.linha = Number(simbolo.linha);
        this.hashArquivo = hashArquivo;

        this.simbolo = simbolo;
        this.valor = valor;

        if (indice !== undefined) {
            this.indice = indice;
        }
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDeAtribuicao(this);
    }
}
