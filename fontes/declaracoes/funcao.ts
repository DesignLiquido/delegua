import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { FuncaoConstruto } from '../construtos';

export class FuncaoDeclaracao extends Declaracao {
    simbolo: SimboloInterface;
    funcao: FuncaoConstruto;
    tipoRetorno?: SimboloInterface;

    constructor(simbolo: SimboloInterface, funcao: FuncaoConstruto, tipoRetorno?: SimboloInterface) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.simbolo = simbolo;
        this.funcao = funcao;
        this.tipoRetorno = tipoRetorno;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return Promise.resolve(visitante.visitarDeclaracaoDefinicaoFuncao(this));
    }
}
