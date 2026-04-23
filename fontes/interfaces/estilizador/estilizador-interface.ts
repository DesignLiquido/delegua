import { Declaracao } from '../../declaracoes/declaracao';
import { OpcoesFormatacaoEstilizadorInterface } from './opcoes-formatacao-estilizador-interface';
import { RegraEstilizacaoInterface } from './regra-estilizacao-interface';
import { ViolacaoEstiloInterface } from './violacao-estilo-interface';

/**
 * Interface base para estilizadores de código.
 * Um estilizador aplica transformações no AST para enforcar convenções e melhorar a qualidade do código.
 */
export interface EstilizadorInterface {
    /**
     * Regras de estilização ativas.
     */
    regras: RegraEstilizacaoInterface[];

    /**
     * Adiciona uma regra de estilização.
     * @param regra A regra a ser adicionada.
     */
    adicionarRegra(regra: RegraEstilizacaoInterface): void;

    /**
     * Remove uma regra de estilização pelo nome.
     * @param nomeRegra O nome da regra a ser removida.
     */
    removerRegra(nomeRegra: string): void;

    /**
     * Aplica as regras de estilização em um conjunto de declarações.
     * @param declaracoes As declarações a serem estilizadas.
     * @returns As declarações estilizadas (modificadas ou não).
     */
    estilizar(declaracoes: Declaracao[]): Declaracao[];

    /**
     * Valida se o código atende todas as regras sem aplicar transformações.
     * @param declaracoes As declarações a serem validadas.
     * @returns Array de violações encontradas.
     */
    validar(declaracoes: Declaracao[]): ViolacaoEstiloInterface[];

    /**
     * Aplica regras de estilização e formata o código com opções de saída.
     * @param declaracoes As declarações a serem estilizadas e formatadas.
     * @param opcoesFormatacao Opções de formatação da saída.
     * @returns Código formatado.
     */
    estilizarEFormatar(
        declaracoes: Declaracao[],
        opcoesFormatacao?: OpcoesFormatacaoEstilizadorInterface
    ): string;
}
