import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Unario<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    operador: SimboloInterface<TTipoSimbolo>;
    operando: any;
    incidenciaOperador: 'ANTES' | 'DEPOIS';

    constructor(
        hashArquivo: number,
        operador: SimboloInterface<TTipoSimbolo>,
        operando: Construto,
        incidenciaOperador: 'ANTES' | 'DEPOIS' = 'ANTES'
    ) {
        this.linha = operador.linha;
        this.hashArquivo = hashArquivo;

        this.operador = operador;
        this.operando = operando;
        this.incidenciaOperador = incidenciaOperador;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoUnaria(this);
    }
}
