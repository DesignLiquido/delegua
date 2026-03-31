import { TipoParadigma } from "../../tipos";

/**
 * Opções para a regra de paradigma consistente.
 */
export interface OpcoesParadigmaConsistenteInterface {
    /**
     * Paradigma a ser enforçado.
     * - 'imperativo': Aceita apenas formas imperativas (escreva, leia, etc.)
     * - 'infinitivo': Aceita apenas formas infinitivas (escrever, ler, etc.)
     * - 'ambos': Aceita ambas as formas (padrão)
     */
    paradigma?: TipoParadigma;
}
