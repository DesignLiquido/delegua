import { Declaracao } from '../declaracoes/declaracao';
import { Construto } from '../construtos';

/**
 * Define uma regra de transformação/estilização de código.
 */
export interface RegraEstilizacao {
    /**
     * Nome da regra para identificação e logs.
     */
    nome: string;

    /**
     * Descrição do que a regra faz.
     */
    descricao: string;

    /**
     * Aplica a regra em uma declaração.
     * @param declaracao A declaração a ser verificada/transformada.
     * @returns A declaração (modificada ou não).
     */
    aplicarEmDeclaracao?(declaracao: Declaracao): Declaracao;

    /**
     * Aplica a regra em um construto.
     * @param construto O construto a ser verificado/transformado.
     * @returns O construto (modificado ou não).
     */
    aplicarEmConstruto?(construto: Construto): Construto;
}

/**
 * Interface base para estilizadores de código.
 * Um estilizador aplica transformações no AST para enforcar convenções e melhorar a qualidade do código.
 */
export interface EstilizadorComumInterface {
    /**
     * Regras de estilização ativas.
     */
    regras: RegraEstilizacao[];

    /**
     * Adiciona uma regra de estilização.
     * @param regra A regra a ser adicionada.
     */
    adicionarRegra(regra: RegraEstilizacao): void;

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
    validar(declaracoes: Declaracao[]): ViolacaoEstilo[];
}

/**
 * Representa uma violação de estilo encontrada.
 */
export interface ViolacaoEstilo {
    /**
     * Nome da regra violada.
     */
    regra: string;

    /**
     * Mensagem descritiva da violação.
     */
    mensagem: string;

    /**
     * Linha onde a violação ocorreu.
     */
    linha: number;

    /**
     * Hash do arquivo onde a violação ocorreu.
     */
    hashArquivo: number;

    /**
     * Severidade da violação.
     */
    severidade: 'erro' | 'aviso' | 'informacao';
}
