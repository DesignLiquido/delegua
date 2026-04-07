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
        const inicializador = this.proximaClasse.encontrarMetodo('construtor');
        if (!inicializador) return 0;
        return inicializador.aridade();
    }

    /**
     * `super()` executa o construtor da próxima classe no OReM e retorna
     * o próprio proxy para permitir encadeamento: `super().meuMetodo()`.
     */
    async chamar(
        visitante: InterpretadorInterface,
        argumentos: ArgumentoInterface[]
    ): Promise<SuperProxy> {
        const inicializador = this.proximaClasse.encontrarMetodo('construtor');
        if (inicializador) {
            const construtorVinculado = inicializador.funcaoPorMetodoDeClasse(this.instancia);
            await construtorVinculado.chamar(visitante, argumentos);
        }

        return this;
    }
}
