import { InterpretadorInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Unario implements Construto {
    linha: number;
    hashArquivo?: number;

    operador: SimboloInterface;
    direita: any;
    incidenciaOperador: 'ANTES' | 'DEPOIS';

    constructor(
        hashArquivo: number, 
        operador: SimboloInterface, 
        direita: any, 
        incidenciaOperador: 'ANTES' | 'DEPOIS' = 'ANTES'
    ) {
        this.linha = operador.linha;
        this.hashArquivo = hashArquivo;

        this.operador = operador;
        this.direita = direita;
        this.incidenciaOperador = incidenciaOperador;
    }

    async aceitar(visitante: InterpretadorInterface): Promise<any> {
        return await visitante.visitarExpressaoUnaria(this);
    }
}
