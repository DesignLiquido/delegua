import { InterpretadorInterface, ParametroInterface } from '../interfaces';
import { Construto } from './construto';

export class FuncaoConstruto implements Construto {
    linha: number;
    hashArquivo: number;

    parametros: ParametroInterface[];
    corpo: any[];

    constructor(hashArquivo: number, linha: number, parametros: ParametroInterface[], corpo: any[]) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.parametros = parametros;
        this.corpo = corpo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoDeleguaFuncao(this));
    }
}
