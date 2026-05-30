import { Decorador } from '../construtos';
import { Literal } from '../construtos';

export interface MetadadosFFIClasse {
    biblioteca: string;
    prefixo: string;
}

export interface MetadadosFFIMetodo {
    /** Nome do símbolo C resolvido, pronto para uso em `koffi.load(...).func(simbolo, ...)`. */
    simbolo: string;
}

/**
 * Extrai o valor primitivo de um atributo de decorador.
 * O parser armazena `valorPadrao` como um `Literal` construto;
 * aqui desembrulhamos para o valor JS puro.
 */
function resolverValorAtributo(valor: any): any {
    if (valor instanceof Literal) return valor.valor;
    return valor;
}

/**
 * Normaliza o nome do decorador removendo o prefixo `@` adicionado pelo parser.
 */
function nomeDecorador(decorador: Decorador): string {
    return decorador.nome.startsWith('@') ? decorador.nome.slice(1) : decorador.nome;
}

/**
 * Lê os atributos de `@definicao` de uma lista de decoradores de uma classe estrangeira.
 * Retorna `null` se nenhum decorador `definicao` com atributo `biblioteca` for encontrado.
 */
export function lerMetadadosClasse(decoradores: Decorador[]): MetadadosFFIClasse | null {
    for (const decorador of decoradores) {
        if (nomeDecorador(decorador) !== 'definicao') continue;
        const biblioteca = resolverValorAtributo(decorador.atributos?.['biblioteca']);
        if (!biblioteca) continue;
        const prefixo = resolverValorAtributo(decorador.atributos?.['prefixo']) ?? '';
        return { biblioteca: String(biblioteca), prefixo: String(prefixo) };
    }
    return null;
}

/**
 * Resolve o nome do símbolo C para um método de uma classe estrangeira.
 *
 * Ordem de resolução:
 * 1. `@definicao(simbolo="...")` no próprio método → usa o valor literal
 * 2. Caso contrário → `prefixo + nomeMetodo`
 */
export function lerMetadadosMetodo(
    decoradores: Decorador[],
    nomeMetodo: string,
    prefixo: string
): MetadadosFFIMetodo {
    for (const decorador of decoradores) {
        if (nomeDecorador(decorador) !== 'definicao') continue;
        const simbolo = resolverValorAtributo(decorador.atributos?.['simbolo']);
        if (simbolo) {
            return { simbolo: String(simbolo) };
        }
    }
    return { simbolo: prefixo + nomeMetodo };
}
