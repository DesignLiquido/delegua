import { Construto } from '../construtos';
import { VisitanteComumInterface, SimboloInterface } from '../interfaces';
import { Declaracao } from './declaracao';

export class Retorna extends Declaracao {
    simboloChave: SimboloInterface;
    valor?: Construto;
    tipo: string;

    constructor(simboloChave: SimboloInterface, valor?: Construto) {
        super(Number(simboloChave.linha), simboloChave.hashArquivo);
        this.simboloChave = simboloChave;
        if (valor) {
            this.valor = valor;
            this.tipo = valor.tipo;
        } else {
            this.tipo = 'vazio';
        }
    }

    async aceitar(visitante: VisitanteComumInterface): Promise<any> {
        return await visitante.visitarExpressaoRetornar(this);
    }

    paraTexto(): string {
        return `<retorna valor=${this.valor ? this.valor.paraTexto() : 'Nada'} />`;
    }
}
