/**
 * Tipo de paradigma suportado.
 * - 'imperativo': Usa formas imperativas (escreva, leia, pegue, tente, etc.)
 * - 'infinitivo': Usa formas infinitivas (escrever, ler, pegar, tentar, etc.)
 * - 'ambos': Aceita ambas as formas (comportamento padrão)
 */
export type TipoParadigma = 'imperativo' | 'infinitivo' | 'ambos';

/**
 * Tipo de delimitador de texto para formatação.
 * - 'aspas-simples': Usa aspas simples para delimitar textos.
 * - 'aspas-duplas': Usa aspas duplas para delimitar textos.
 * - 'preservar': Preserva o tipo de aspas original do código.
 */
export type DelimitadorTextoFormatacao = 'aspas-simples' | 'aspas-duplas' | 'preservar';