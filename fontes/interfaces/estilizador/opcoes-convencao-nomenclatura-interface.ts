/**
 * Opções de convenção de nomenclatura.
 */
export interface OpcoesConvencaoNomenclaturaInterface {
    /**
     * Convenção para variáveis.
     * - 'caixaCamelo': primeiraPalavraMinuscula
     * - 'caixa_cobra': primeira_palavra_minuscula
     * - 'CaixaPascal': PrimeiraPalavraMaiuscula
     */
    variavel?: 'caixaCamelo' | 'caixa_cobra' | 'CaixaPascal';

    /**
     * Convenção para constantes.
     * - 'CAIXA_ALTA': TODAS_MAIUSCULAS
     * - 'caixaCamelo': primeiraPalavraMinuscula
     */
    constante?: 'CAIXA_ALTA' | 'caixaCamelo';

    /**
     * Convenção para funções.
     * - 'caixaCamelo': primeiraPalavraMinuscula
     * - 'caixa_cobra': primeira_palavra_minuscula
     * - 'CaixaPascal': PrimeiraPalavraMaiuscula
     */
    funcao?: 'caixaCamelo' | 'caixa_cobra' | 'CaixaPascal';
}