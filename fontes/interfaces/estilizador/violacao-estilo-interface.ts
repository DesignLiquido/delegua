/**
 * Representa uma violação de estilo encontrada.
 */
export interface ViolacaoEstiloInterface {
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
