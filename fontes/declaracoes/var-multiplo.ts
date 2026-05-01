import { VisitanteComumInterface, SimboloInterface, ConstrutoInterface } from '../interfaces';
import { TipoInferencia } from '../inferenciador';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de múltiplas variáveis.
 */
export class VarMultiplo extends Declaracao {
    simbolos: SimboloInterface[];
    inicializador: ConstrutoInterface;
    tipo: TipoInferencia | undefined;
    referencia: boolean;

    constructor(
        simbolos: SimboloInterface[],
        inicializador: ConstrutoInterface,
        tipo: TipoInferencia | undefined = undefined
    ) {
        super(Number(simbolos[0].linha), simbolos[0].hashArquivo);
        this.simbolos = simbolos;
        this.inicializador = inicializador;
        this.tipo = tipo;
        this.referencia = false;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoVarMultiplo(this);
    }

    paraTexto(): string {
        // TODO: Terminar.
        return `<var-múltiplo />`;
    }
}
