import { Declaracao } from '../declaracoes';
import { VisitanteComumInterface, ParametroInterface } from '../interfaces';
import { Construto } from './construto';

export class FuncaoConstruto implements Construto {
    linha: number;
    hashArquivo: number;

    parametros: ParametroInterface[];
    corpo: Declaracao[];
    tipo?: string;
    tipoExplicito: boolean;
    documentacao: Declaracao;

    constructor(
        hashArquivo: number,
        linha: number,
        parametros: ParametroInterface[],
        corpo: Declaracao[],
        tipoRetorno?: string,
        tipoExplicito?: boolean,
        documentacao?: Declaracao,
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.parametros = parametros;
        this.corpo = corpo;
        this.tipo = tipoRetorno;
        this.tipoExplicito = tipoExplicito || false;
        this.documentacao = documentacao;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoFuncaoConstruto(this));
    }

    paraTexto(): string {
        let parametros = '';
        for (let indice = 0; indice < this.parametros.length; indice++) {
            const parametro = this.parametros[indice];
            parametros += `${parametro.nome.lexema}:${parametro.tipoDado}`;
            if (indice < this.parametros.length - 1) {
                parametros += ',';
            }
        }

        let corpo = '';
        for (let indice = 0; indice < this.corpo.length; indice++) {
            corpo += this.corpo[indice].paraTexto();
        }

        return `<construto-função parâmetros=[${parametros}] corpo=[${corpo}] tipoRetorno=${this.tipo} tipoExplícito=${this.tipoExplicito ? 'Sim' : 'Não'} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
