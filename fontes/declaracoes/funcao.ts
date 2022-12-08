import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { FuncaoConstruto } from '../construtos';

export class FuncaoDeclaracao extends Declaracao {
    simbolo: SimboloInterface;
    funcao: FuncaoConstruto;

    constructor(simbolo: SimboloInterface, funcao: FuncaoConstruto) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.funcao = funcao;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarExpressaoFuncao(this));
    }
}
