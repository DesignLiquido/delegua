import { InterpretadorInterface, ParametroInterface } from '../interfaces';
import { Construto } from './construto';

export class Funcao implements Construto {
    linha: number;
    hashArquivo?: number;

    parametros: ParametroInterface[];
    corpo: any;

    constructor(
        hashArquivo: number,
        linha: number,
        parametros: ParametroInterface[],
        corpo: any
    ) {
        this.linha = linha;
        this.hashArquivo = hashArquivo;

        this.parametros = parametros;
        this.corpo = corpo;
    }

    aceitar(visitante: InterpretadorInterface) {
        return visitante.visitarExpressaoDeleguaFuncao(this);
    }
}
