import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { Funcao as FuncaoConstruto } from '../construtos';

export class Funcao extends Declaracao {
    simbolo: SimboloInterface;
    funcao: FuncaoConstruto;

    constructor(simbolo: SimboloInterface, funcao: FuncaoConstruto) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.funcao = funcao;
    }

    aceitar(visitante: InterpretadorInterface): any {
        return visitante.visitarExpressaoFuncao(this);
    }
}
