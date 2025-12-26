import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Construto } from './construto';

export class Unario<TTipoSimbolo extends string = string> implements Construto {
    linha: number;
    hashArquivo: number;

    operador: SimboloInterface<TTipoSimbolo>;
    operando: Construto;
    incidenciaOperador: 'ANTES' | 'DEPOIS';
    tipo: string = 'qualquer';

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
        this.tipo = operando.tipo;
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoUnaria(this);
    }

    paraTexto(): string {
        return `<unário operando=${this.operando.paraTexto()} operador=${this.operador.lexema} incidênciaOperador=${this.incidenciaOperador} />`;
    }

    paraTextoSaida(): string {
        throw new Error('Método não implementado.');
    }
}
