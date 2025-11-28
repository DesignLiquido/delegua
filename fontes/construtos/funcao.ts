import { Comentario, Declaracao } from '../declaracoes';
import { VisitanteComumInterface, ParametroInterface } from '../interfaces';
import { Construto } from './construto';

export class FuncaoConstruto implements Construto {
    linha: number;
    hashArquivo: number;

    parametros: ParametroInterface[];
    corpo: Declaracao[];
    tipo?: string;
    tipoExplicito: boolean;

    constructor(
        hashArquivo: number,
        linha: number,
        parametros: ParametroInterface[],
        corpo: Declaracao[],
        tipoRetorno?: string,
        tipoExplicito?: boolean,
        documentacao?: Comentario,
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.parametros = parametros;
        this.corpo = corpo;
        this.tipo = tipoRetorno;
        this.tipoExplicito = tipoExplicito || false;

    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoFuncaoConstruto(this));
    }

    paraTexto(): string {
        // TODO: Corpo.
        return `<construto-função parâmetros=${this.parametros} tipoRetorno=${this.tipo} tipoExplícito=${this.tipoExplicito ? 'Sim' : 'Não'} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
