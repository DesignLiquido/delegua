import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { Decorador, FuncaoConstruto } from '../construtos';
import { uuidv4 } from '../geracao-identificadores';

/**
 * Uma declaração de função. 
 */
export class FuncaoDeclaracao extends Declaracao {
    simbolo: SimboloInterface;
    funcao: FuncaoConstruto;
    tipo: string;
    decoradores: Decorador[];
    id: string;

    constructor(
        simbolo: SimboloInterface,
        funcao: FuncaoConstruto,
        tipoRetorno: string = 'qualquer',
        decoradores: Decorador[] = []
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.id = uuidv4();
        this.simbolo = simbolo;
        this.funcao = funcao;
        this.tipo = tipoRetorno;
        this.decoradores = decoradores;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return Promise.resolve(visitante.visitarDeclaracaoDefinicaoFuncao(this));
    }
}
