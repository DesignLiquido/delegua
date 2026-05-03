import { VisitanteComumInterface, SimboloInterface, ConstrutoInterface } from '../interfaces';
import { TipoInferencia } from '../inferenciador';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de múltiplas constantes.
 */
export class ConstMultiplo extends Declaracao {
    simbolos: SimboloInterface[];
    inicializador: ConstrutoInterface;
    tipo: TipoInferencia | undefined;

    constructor(
        simbolos: SimboloInterface[],
        inicializador: ConstrutoInterface,
        tipo: TipoInferencia | undefined = undefined
    ) {
        super(Number(simbolos[0].linha), simbolos[0].hashArquivo);
        this.simbolos = simbolos;
        this.inicializador = inicializador;
        this.tipo = tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoConstMultiplo(this);
    }

    paraTexto(): string {
        // TODO: Terminar
        return `<const-múltiplo />`;
    }
}
