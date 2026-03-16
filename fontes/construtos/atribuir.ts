import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';
import { Variavel } from './variavel';

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
        indice?: Construto,
        simboloOperador?: SimboloInterface<TTipoSimbolo>
    ) {
        this.linha = Number(alvo.linha);
        this.hashArquivo = hashArquivo;

        this.alvo = alvo;
        this.valor = valor;

        if (indice !== undefined) {
            const alvoComoVariavel = alvo as Variavel<TTipoSimbolo>;
            const tipoAlvo = alvoComoVariavel?.tipo;
            const alvoSuportaIndice =
                alvo instanceof Variavel &&
                (tipoAlvo === 'vetor' ||
                    tipoAlvo === 'dicionário' ||
                    tipoAlvo === 'qualquer' ||
                    tipoAlvo?.endsWith('[]'));

            if (!alvoSuportaIndice) {
                throw new Error(
                    '`indice` só pode ser informado quando o alvo for uma variável de vetor ou dicionário.'
                );
            }

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

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
