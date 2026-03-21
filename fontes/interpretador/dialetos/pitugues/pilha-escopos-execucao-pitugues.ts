import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { SimboloInterface } from '../../../interfaces';
import { inferirTipoVariavel } from '../../../inferenciador';
import { PilhaEscoposExecucao } from '../../pilha-escopos-execucao';

/**
 * Pilha de escopos de execução específica para Pituguês.
 *
 * Diferentemente de Delégua, Pituguês segue a regra de escopo local-first do
 * Python para atribuições dentro de funções:
 *
 * - Fora de uma função (escopo global, laços no nível global): o comportamento
 *   é o padrão — a pilha é percorrida para encontrar a variável e atualizá-la,
 *   ou ela é criada no escopo atual caso ainda não exista.
 *
 * - Dentro de uma função: a atribuição é sempre resolvida dentro da cadeia de
 *   escopos da própria função (do topo da pilha até o escopo de tipo 'funcao'
 *   inclusive), sem cruzar a fronteira para escopos ancestrais (globais). Se a
 *   variável não for encontrada nessa cadeia, ela é criada no escopo da função
 *   (não no escopo de laço interno, refletindo o comportamento do Python onde
 *   `if`/`while`/`for` não criam namespaces próprios).
 *
 * Leituras continuam percorrendo toda a pilha normalmente.
 */
export class PilhaEscoposExecucaoPitugues extends PilhaEscoposExecucao {
    /**
     * Retorna o índice do escopo de função mais recente na pilha, ou -1 se não
     * houver nenhum (estamos no nível global).
     */
    private indiceFuncaoAtual(): number {
        for (let i = this.pilha.length - 1; i >= 0; i--) {
            if (this.pilha[i].tipo === 'funcao') {
                return i;
            }
        }
        return -1;
    }

    /**
     * Atribui um valor a uma variável seguindo a semântica de escopo do Pituguês.
     *
     * Casos:
     * 1. Atribuição indexada (`x[i] = v`) → comportamento padrão (percorre a pilha).
     * 2. Fora de função → comportamento padrão com criação implícita se necessário.
     * 3. Dentro de função:
     *    a. Variável encontrada na cadeia de escopos da função → atualiza lá.
     *    b. Variável não encontrada (só existe no escopo global, ou é nova) →
     *       cria no escopo da função (não no escopo de laço interno).
     */
    override atribuirVariavel(simbolo: SimboloInterface, valor: any, indice?: number): void {
        // Caso 1 — atribuição indexada: modifica conteúdo do objeto, não a ligação.
        if (indice !== undefined && indice !== null) {
            return super.atribuirVariavel(simbolo, valor, indice);
        }

        const funcaoIndex = this.indiceFuncaoAtual();

        // Caso 2 — fora de qualquer função (nível global ou laço global).
        if (funcaoIndex === -1) {
            for (let i = this.pilha.length - 1; i >= 0; i--) {
                if (this.pilha[i].espacoMemoria.valores[simbolo.lexema] !== undefined) {
                    return super.atribuirVariavel(simbolo, valor);
                }
            }
            // Variável ainda não existe: criação implícita no escopo atual.
            this.definirVariavel(simbolo.lexema, valor);
            return;
        }

        // Caso 3 — dentro de uma função.
        // Percorre apenas os escopos dentro da função (do topo até funcaoIndex).
        for (let i = this.pilha.length - 1; i >= funcaoIndex; i--) {
            const espaco = this.pilha[i].espacoMemoria;
            if (espaco.valores[simbolo.lexema] !== undefined) {
                const variavel = espaco.valores[simbolo.lexema];

                if (variavel.imutavel) {
                    throw new ErroEmTempoDeExecucao(
                        simbolo,
                        `Constante '${simbolo.lexema}' não pode receber novos valores.`
                    );
                }

                espaco.valores[simbolo.lexema] = {
                    valor,
                    tipo: variavel.tipo || (inferirTipoVariavel(valor) as string),
                    imutavel: false,
                    tipoExplicito: variavel.tipoExplicito,
                };
                return;
            }
        }

        // Variável não encontrada na cadeia da função (existe só no global ou é nova).
        // Cria no escopo da função (índice funcaoIndex), não no escopo de laço interno.
        this.pilha[funcaoIndex].espacoMemoria.valores[simbolo.lexema] = {
            valor,
            tipo: inferirTipoVariavel(valor) as string,
            imutavel: false,
            tipoExplicito: false,
        };
    }
}
