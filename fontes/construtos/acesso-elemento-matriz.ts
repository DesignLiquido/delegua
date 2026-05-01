import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { ConstrutoInterface } from '../interfaces/construtos/construto-interface';

export class AcessoElementoMatriz<TTipoSimbolo extends string = string> implements ConstrutoInterface {
    linha: number;
    hashArquivo: number;

    entidadeChamada: ConstrutoInterface;
    simboloFechamento: SimboloInterface<TTipoSimbolo>;
    indicePrimario: ConstrutoInterface;
    indiceSecundario: ConstrutoInterface;

    constructor(
        hashArquivo: number,
        entidadeChamada: ConstrutoInterface,
        indicePrimario: ConstrutoInterface,
        indiceSegundario: ConstrutoInterface,
        simboloFechamento: SimboloInterface<TTipoSimbolo>
    ) {
        this.linha = entidadeChamada.linha;
        this.hashArquivo = hashArquivo;

        this.entidadeChamada = entidadeChamada;
        this.indicePrimario = indicePrimario;
        this.indiceSecundario = indiceSegundario;
        this.simboloFechamento = simboloFechamento;
    }
    valor?: any;
    tipo?: string;

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoAcessoElementoMatriz(this);
    }

    paraTexto(): string {
        return (
            `<acesso-elemento-matriz entidadeChamada=${this.entidadeChamada.paraTexto()} ` +
            `indicePrimário=${this.indicePrimario.paraTexto()} ` +
            `indiceSecundário=${this.indiceSecundario.paraTexto()} ` +
            `/>`
        );
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
