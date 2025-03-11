import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Construto de atribuição de um valor a um símbolo.
 */
export class Atribuir implements Construto {
    linha: number;
    hashArquivo: number;

    indice?: Construto;

    alvo: Construto;
    valor: any;

    constructor(
        hashArquivo: number,
        alvo: Construto,
        valor: any,
        // indice so é usado para variaveis de vetores
        // TODO: criar alguma validaçao para garantir que `indice` só seja passado para variáveis de vetores
        indice?: Construto
    ) {
        this.linha = Number(alvo.linha);
        this.hashArquivo = hashArquivo;

        this.alvo = alvo;
        this.valor = valor;

        if (indice !== undefined) {
            this.indice = indice;
        }
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDeAtribuicao(this);
    }
}
