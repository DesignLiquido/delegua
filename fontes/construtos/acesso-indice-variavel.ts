import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

/**
 * Definido como `Subscript` em Égua Clássico, esse construto serve para acessar índices de
 * vetores e dicionários.
 */
export class AcessoIndiceVariavel<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    entidadeChamada: ConstrutoInterface;
    simboloFechamento: SimboloInterface<TTipoSimbolo>;
    indice: ConstrutoInterface;
    tipo: string = 'qualquer';

    constructor(
        hashArquivo: number,
        entidadeChamada: ConstrutoInterface,
        indice: ConstrutoInterface,
        simboloFechamento: SimboloInterface<TTipoSimbolo>,
        tipo: string = 'qualquer'
    ) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.indice = indice;
        this.simboloFechamento = simboloFechamento;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoIndiceVariavel(this);
    }

    paraTexto(): string {
        return (
            `<acesso-índice-variável entidadeChamada=${this.entidadeChamada.paraTexto()} ` +
            `índice=${this.indice.paraTexto()} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
