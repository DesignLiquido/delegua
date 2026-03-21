import { SimboloInterface } from '../../../interfaces';
import { PilhaEscoposExecucao } from '../../pilha-escopos-execucao';

/**
 * Pilha de escopos de execução específica para Pituguês.
 *
 * Diferentemente de Delégua, Pituguês segue a regra LEGB do Python para atribuições:
 * toda atribuição de variável escreve **no escopo atual** (topo da pilha), nunca em
 * um escopo ancestral. Isso significa que, dentro de uma função, `x = 5` cria uma
 * variável local `x` mesmo que já exista um `x` no escopo global.
 *
 * Leituras ainda atravessam a pilha normalmente — é possível ler variáveis de
 * escopos externos; apenas a escrita é sempre local.
 */
export class PilhaEscoposExecucaoPitugues extends PilhaEscoposExecucao {
    /**
     * Atribui um valor a uma variável seguindo a semântica local-first do Pituguês:
     *
     * - Se a variável já existe no escopo atual → atualiza no escopo atual
     *   (com as verificações normais de imutabilidade e tipo).
     * - Se a variável existe apenas em um escopo ancestral **e** não há índice
     *   envolvido → cria uma nova variável local no escopo atual, sem alterar
     *   a variável ancestral.
     * - Se `indice` está presente (atribuição em vetor/dicionário via `x[i] = v`),
     *   o comportamento é o padrão — atravessa a pilha para localizar o objeto e
     *   modifica seu conteúdo in-place, sem substituir a ligação da variável.
     */
    override atribuirVariavel(simbolo: SimboloInterface, valor: any, indice?: number): void {
        // Atribuição indexada (ex: x[0] = 5) modifica o conteúdo do objeto,
        // não a ligação da variável. Nesse caso o comportamento padrão é mantido.
        if (indice !== undefined && indice !== null) {
            return super.atribuirVariavel(simbolo, valor, indice);
        }

        const espacoMemoriaAtual = this.pilha[this.pilha.length - 1].espacoMemoria;

        if (espacoMemoriaAtual.valores[simbolo.lexema] !== undefined) {
            // A variável existe no escopo atual: atualizar com as verificações normais.
            // super.atribuirVariavel começa pelo topo da pilha e a encontrará aqui.
            return super.atribuirVariavel(simbolo, valor, indice);
        }

        // A variável não existe no escopo atual (pode existir em um ancestral ou ser
        // completamente nova). Em ambos os casos, criamos uma variável local.
        this.definirVariavel(simbolo.lexema, valor);
    }
}
