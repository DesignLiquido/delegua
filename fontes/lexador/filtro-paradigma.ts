import { palavrasReservadasDelegua } from './palavras-reservadas';
import { TipoParadigma, gruposPalavrasParadigma, palavrasNeutras } from './mapeamento-paradigmas';

/**
 * Gera um conjunto de palavras reservadas filtrado por paradigma.
 * @param paradigma O paradigma desejado ('imperativo', 'infinitivo', ou 'ambos')
 * @returns Um objeto mapeando palavras reservadas para tipos de símbolos
 */
export function gerarPalavrasReservadasPorParadigma(
    paradigma: TipoParadigma
): Record<string, string> {
    // Se 'ambos', retorna todas as palavras reservadas
    if (paradigma === 'ambos') {
        return { ...palavrasReservadasDelegua };
    }

    const palavrasFiltradas: Record<string, string> = {};

    // Adiciona todas as palavras neutras
    Object.assign(palavrasFiltradas, palavrasNeutras);

    // Adiciona palavras do paradigma selecionado
    for (const grupo of gruposPalavrasParadigma) {
        const palavrasDoParadigma =
            paradigma === 'imperativo' ? grupo.imperativo : grupo.infinitivo;

        if (palavrasDoParadigma) {
            for (const palavra of palavrasDoParadigma) {
                palavrasFiltradas[palavra] = grupo.tipo;
            }
        }
    }

    return palavrasFiltradas;
}

/**
 * Obtém as palavras que foram excluídas para um paradigma específico.
 * Útil para mensagens de erro ou documentação.
 * @param paradigma O paradigma escolhido
 * @returns Lista de palavras que não são aceitas neste paradigma
 */
export function obterPalavrasExcluidas(paradigma: TipoParadigma): string[] {
    if (paradigma === 'ambos') {
        return [];
    }

    const palavrasExcluidas: string[] = [];
    const paradigmaOposto = paradigma === 'imperativo' ? 'infinitivo' : 'imperativo';

    for (const grupo of gruposPalavrasParadigma) {
        const palavrasOpostas =
            paradigmaOposto === 'imperativo' ? grupo.imperativo : grupo.infinitivo;

        if (palavrasOpostas) {
            palavrasExcluidas.push(...palavrasOpostas);
        }
    }

    return palavrasExcluidas;
}
