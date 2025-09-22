import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

/**
 * Construto de atribuição de um valor a um símbolo.
 */
export class Atribuir<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    alvo: Construto;
    indice?: Construto;
    valor: Construto;
    simboloOperador?: SimboloInterface<TTipoSimbolo>;

    constructor(
        hashArquivo: number,
        alvo: Construto,
        valor: Construto,
        // indice so é usado para variaveis de vetores
        // TODO: criar alguma validaçao para garantir que `indice` só seja passado para variáveis de vetores
        indice?: Construto,
        simboloOperador?: SimboloInterface<TTipoSimbolo>
    ) {
        this.linha = Number(alvo.linha);
        this.hashArquivo = hashArquivo;

        this.alvo = alvo;
        this.valor = valor;

        if (indice !== undefined) {
            this.indice = indice;
        }

        if (simboloOperador !== undefined) {
            this.simboloOperador = simboloOperador;
        }
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoDeAtribuicao(this);
    }

    paraTexto(): string {
        let indiceResolvido = 'índice=(não definido)';
        if (this.indice) {
            indiceResolvido = `índice=${this.indice.paraTexto()}`;
        }

        return `<atribuir alvo=${this.alvo.paraTexto()} ${indiceResolvido} valor=${this.valor.paraTexto()} />`;
    }
}
