import { InterpretadorInterface } from '../../interfaces';
import { ArgumentoInterface } from '../argumento-interface';
import { Chamavel } from './chamavel';
import { DescritorTipoClasse } from './descritor-tipo-classe';
import { ObjetoDeleguaClasse } from './objeto-delegua-classe';

/**
 * Objeto retornado por `super()`. Carrega a instância atual e o ponto de partida
 * no OReM, permitindo herança cooperativa em chamadas do tipo `super().meuMetodo()`.
 *
 * Estende `Chamavel` para que `super()` seja resolvido pelo caminho normal de
 * chamada em `visitarExpressaoDeChamada`, retornando o próprio proxy para encadeamento.
 */
export class SuperProxy extends Chamavel {
    instancia: ObjetoDeleguaClasse;
    proximaClasse: DescritorTipoClasse;

    constructor(instancia: ObjetoDeleguaClasse, proximaClasse: DescritorTipoClasse) {
        super();
        this.instancia = instancia;
        this.proximaClasse = proximaClasse;
    }

    aridade(): number {
        return 0;
    }

    /**
     * `super()` retorna o próprio proxy, permitindo encadeamento: `super().meuMetodo()`.
     */
    async chamar(
        _visitante: InterpretadorInterface,
        _argumentos: ArgumentoInterface[]
    ): Promise<SuperProxy> {
        return this;
    }
}
