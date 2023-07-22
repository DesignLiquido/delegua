import { VisitanteComumInterface, ParametroInterface } from '../interfaces';
import { Construto } from './construto';

export class FuncaoConstruto implements Construto {
    linha: number;
    hashArquivo: number;

    parametros: ParametroInterface[];
    tipoRetorno?: string;
    corpo: any[];

    constructor(hashArquivo: number, linha: number, parametros: ParametroInterface[], corpo: any[], tipoRetorno?: string) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.parametros = parametros;
        this.tipoRetorno = tipoRetorno;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoDeleguaFuncao(this));
    }
}
