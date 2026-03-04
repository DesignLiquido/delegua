import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

/**
 * Tipo de paradigma suportado.
 * - 'imperativo': Usa formas imperativas (escreva, leia, pegue, tente, etc.)
 * - 'infinitivo': Usa formas infinitivas (escrever, ler, pegar, tentar, etc.)
 * - 'ambos': Aceita ambas as formas (comportamento padrão)
 */
export type TipoParadigma = 'imperativo' | 'infinitivo' | 'ambos';

/**
 * Mapeamento de palavras reservadas por paradigma.
 * Cada entrada mapeia formas alternativas para o mesmo tipo de símbolo.
 */
export interface GrupoPalavrasParadigma {
    tipo: string;
    imperativo?: string[];
    infinitivo?: string[];
    neutro?: string[]; // Palavras que não têm paradigma (como 'se', 'senao', 'var', etc.)
}

/**
 * Grupos de palavras reservadas organizadas por paradigma.
 * Cada grupo representa diferentes formas de expressar a mesma funcionalidade.
 */
export const gruposPalavrasParadigma: GrupoPalavrasParadigma[] = [
    {
        tipo: tiposDeSimbolos.ESCREVA,
        imperativo: ['escreva'],
        infinitivo: ['escrever'],
    },
    {
        tipo: tiposDeSimbolos.LEIA,
        imperativo: ['leia'],
        infinitivo: ['ler'],
    },
    {
        tipo: tiposDeSimbolos.CONTINUA,
        imperativo: ['continua'],
        infinitivo: ['continuar'],
    },
    {
        tipo: tiposDeSimbolos.RETORNA,
        imperativo: ['retorna', 'retorne'],
        infinitivo: ['retornar'],
    },
    {
        tipo: tiposDeSimbolos.ESCOLHA,
        imperativo: ['escolha'],
        infinitivo: ['escolher'],
    },
    {
        tipo: tiposDeSimbolos.TENTE,
        imperativo: ['tente'],
        infinitivo: ['tentar'],
    },
    {
        tipo: tiposDeSimbolos.PEGUE,
        imperativo: ['pegue'],
        infinitivo: ['pegar'],
    },
    {
        tipo: tiposDeSimbolos.QUEBRAR,
        imperativo: ['quebre'],
        infinitivo: ['quebrar'],
    },
    {
        tipo: tiposDeSimbolos.IMPORTAR,
        imperativo: ['importe'],
        infinitivo: ['importar'],
    },
    {
        tipo: tiposDeSimbolos.FAZER,
        imperativo: ['faca', 'faça'],
        infinitivo: ['fazer'],
    },
];

/**
 * Palavras neutras que não têm paradigma específico.
 * Estas palavras são aceitas em todos os modos de paradigma.
 */
export const palavrasNeutras: Record<string, string> = {
    ajuda: tiposDeSimbolos.AJUDA,
    cada: tiposDeSimbolos.CADA,
    caso: tiposDeSimbolos.CASO,
    classe: tiposDeSimbolos.CLASSE,
    como: tiposDeSimbolos.COMO,
    construtor: tiposDeSimbolos.CONSTRUTOR,
    constante: tiposDeSimbolos.CONSTANTE,
    const: tiposDeSimbolos.CONSTANTE,
    contem: tiposDeSimbolos.CONTEM,
    contém: tiposDeSimbolos.CONTEM,
    de: tiposDeSimbolos.DE,
    e: tiposDeSimbolos.E,
    em: tiposDeSimbolos.EM,
    enquanto: tiposDeSimbolos.ENQUANTO,
    falhar: tiposDeSimbolos.FALHAR,
    falso: tiposDeSimbolos.FALSO,
    finalmente: tiposDeSimbolos.FINALMENTE,
    fixo: tiposDeSimbolos.CONSTANTE,
    funcao: tiposDeSimbolos.FUNCAO,
    função: tiposDeSimbolos.FUNÇÃO,
    herda: tiposDeSimbolos.HERDA,
    isto: tiposDeSimbolos.ISTO,
    nao: tiposDeSimbolos.NAO,
    não: tiposDeSimbolos.NAO,
    nulo: tiposDeSimbolos.NULO,
    ou: tiposDeSimbolos.OU,
    padrao: tiposDeSimbolos.PADRAO,
    padrão: tiposDeSimbolos.PADRAO,
    para: tiposDeSimbolos.PARA,
    se: tiposDeSimbolos.SE,
    senao: tiposDeSimbolos.SENAO,
    senão: tiposDeSimbolos.SENÃO,
    super: tiposDeSimbolos.SUPER,
    sustar: tiposDeSimbolos.SUSTAR,
    tendo: tiposDeSimbolos.TENDO,
    tipo: tiposDeSimbolos.TIPO,
    tudo: tiposDeSimbolos.TUDO,
    var: tiposDeSimbolos.VARIAVEL,
    variavel: tiposDeSimbolos.VARIAVEL,
    variável: tiposDeSimbolos.VARIAVEL,
    verdadeiro: tiposDeSimbolos.VERDADEIRO,
};

/**
 * Retorna um mapa de lexema para paradigma.
 * Útil para verificar rapidamente se uma palavra pertence a um paradigma.
 */
export function obterMapaLexemaParaParadigma(): Map<
    string,
    'imperativo' | 'infinitivo' | 'neutro'
> {
    const mapa = new Map<string, 'imperativo' | 'infinitivo' | 'neutro'>();

    // Adiciona palavras neutras
    for (const lexema of Object.keys(palavrasNeutras)) {
        mapa.set(lexema, 'neutro');
    }

    // Adiciona palavras de paradigmas
    for (const grupo of gruposPalavrasParadigma) {
        if (grupo.imperativo) {
            for (const lexema of grupo.imperativo) {
                mapa.set(lexema, 'imperativo');
            }
        }
        if (grupo.infinitivo) {
            for (const lexema of grupo.infinitivo) {
                mapa.set(lexema, 'infinitivo');
            }
        }
    }

    return mapa;
}

/**
 * Obtém a forma alternativa de uma palavra para o paradigma especificado.
 * @param lexema A palavra original
 * @param paradigmaAlvo O paradigma desejado
 * @returns A forma alternativa ou undefined se não houver conversão
 */
export function obterFormaAlternativa(
    lexema: string,
    paradigmaAlvo: 'imperativo' | 'infinitivo'
): string | undefined {
    const lexemaLower = lexema.toLowerCase();

    // Encontra o grupo que contém este lexema
    for (const grupo of gruposPalavrasParadigma) {
        const temImperativo = grupo.imperativo?.some((p) => p === lexemaLower);
        const temInfinitivo = grupo.infinitivo?.some((p) => p === lexemaLower);

        if (temImperativo || temInfinitivo) {
            // Retorna a primeira forma do paradigma alvo
            if (paradigmaAlvo === 'imperativo' && grupo.imperativo && grupo.imperativo.length > 0) {
                return grupo.imperativo[0];
            }
            if (paradigmaAlvo === 'infinitivo' && grupo.infinitivo && grupo.infinitivo.length > 0) {
                return grupo.infinitivo[0];
            }
        }
    }

    return undefined;
}

/**
 * Verifica se um lexema pertence a um paradigma específico.
 * @param lexema A palavra a verificar
 * @param paradigma O paradigma a verificar
 * @returns true se o lexema pertence ao paradigma ou é neutro
 */
export function pertenceAoParadigma(lexema: string, paradigma: TipoParadigma): boolean {
    if (paradigma === 'ambos') {
        return true;
    }

    const mapa = obterMapaLexemaParaParadigma();
    const paradigmaLexema = mapa.get(lexema.toLowerCase());

    // Palavras neutras são aceitas em todos os paradigmas
    if (paradigmaLexema === 'neutro') {
        return true;
    }

    // Verifica se o paradigma corresponde
    return paradigmaLexema === paradigma;
}
