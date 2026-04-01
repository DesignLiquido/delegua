import { SimboloInterface } from '../interfaces';
import { VisitanteDeleguaInterface } from '../interfaces/visitante-delegua-interface';
import { Declaracao } from './declaracao';
import { FuncaoDeclaracao } from './funcao';

/**
 * Declaração de Extensão de Classe.
 */
export class Extensao extends Declaracao {
    simboloTipo: SimboloInterface;
    metodos: FuncaoDeclaracao[];
    ehGlobal: boolean;

    constructor(
        simboloTipo: SimboloInterface,
        metodos: FuncaoDeclaracao[],
        ehGlobal: boolean,
        hashArquivo: number
    ) {
        super(Number(simboloTipo.linha), hashArquivo);
        this.simboloTipo = simboloTipo;
        this.metodos = metodos;
        this.ehGlobal = ehGlobal;
    }

    async aceitar(visitante: VisitanteDeleguaInterface): Promise<any> {
        return await visitante.visitarDeclaracaoExtensao(this);
    }

    paraTexto(): string {
        const escopo = this.ehGlobal ? 'global ' : '';
        let resultado = `<extensao ${escopo}tipo=${this.simboloTipo.lexema}>`;
        for (const metodo of this.metodos) {
            resultado += metodo.paraTexto();
        }
        resultado += '</extensao>';
        return resultado;
    }
}
