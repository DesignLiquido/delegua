import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';
import { ComentarioComoConstruto, Decorador, FuncaoConstruto } from '../construtos';
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
    acesso: 'privado' | 'protegido' | 'publico';
    estatico: boolean;
    abstrato: boolean;
    eObtenedor: boolean;
    eDefinidor: boolean;
    documentacao?: ComentarioComoConstruto;

    constructor(
        simbolo: SimboloInterface,
        funcao: FuncaoConstruto,
        tipoRetorno: string = 'qualquer',
        decoradores: Decorador[] = [],
        acesso: 'privado' | 'protegido' | 'publico' = 'publico',
        estatico: boolean = false,
        abstrato: boolean = false,
        eObtenedor: boolean = false,
        eDefinidor: boolean = false
    ) {
        super(Number(simbolo.linha), simbolo.hashArquivo);
        this.id = uuidv4();
        this.simbolo = simbolo;
        this.funcao = funcao;
        this.tipo = tipoRetorno;
        this.decoradores = decoradores;
        this.acesso = acesso;
        this.estatico = estatico;
        this.abstrato = abstrato;
        this.eObtenedor = eObtenedor;
        this.eDefinidor = eDefinidor;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoDefinicaoFuncao(this);
    }

    paraTexto(): string {
        // TODO: Corpo.
        return `<declaração-função nome=${this.simbolo.lexema} tipo=${this.tipo} />`;
    }
}
