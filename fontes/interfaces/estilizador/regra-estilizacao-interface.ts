import { Construto } from '../../construtos';
import { Declaracao } from '../../declaracoes';

/**
 * Define uma regra de transformação/estilização de código.
 */
export interface RegraEstilizacaoInterface {
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
