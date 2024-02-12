import { Construto } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { TipoDadosElementar } from '../tipo-dados-elementar';
import { Declaracao } from './declaracao';

/**
 * Uma declaração de múltiplas variáveis.
 */
export class VarMultiplo extends Declaracao {
    simbolos: SimboloInterface[];
    inicializador: Construto;
    tipo: TipoDadosElementar;
    referencia: boolean;

    constructor(simbolos: SimboloInterface[], inicializador: Construto, tipo: TipoDadosElementar = undefined) {
        super(Number(simbolos[0].linha), simbolos[0].hashArquivo);
        this.simbolos = simbolos;
        this.inicializador = inicializador;
        this.tipo = tipo;
        this.referencia = false;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarDeclaracaoVarMultiplo(this);
    }
}
