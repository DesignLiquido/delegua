/**
 * Tipos Delégua suportados por este backend: valores inteiros de 64 bits (caber num
 * registrador geral x64), booleanos (0/1) e ponteiros para rótulos de texto (somente
 * para passagem a `escreva`, sem aritmética). Ponto flutuante (`real`/`real_curto`)
 * exigiria registradores xmm/instruções SSE, não implementadas aqui.
 */
export type IRTipo = 'numero' | 'inteiro' | 'longo' | 'logico' | 'texto' | 'vazio';

const SINONIMOS_ESCALARES: Record<string, IRTipo> = {
    numero: 'numero',
    número: 'numero',
    inteiro: 'inteiro',
    longo: 'longo',
    logico: 'logico',
    lógico: 'logico',
    texto: 'texto',
    vazio: 'vazio',
    nada: 'vazio',
};

const SINONIMOS_VETORES: Record<string, IRTipo> = {
    'numero[]': 'numero',
    'número[]': 'numero',
    'inteiro[]': 'inteiro',
    'longo[]': 'longo',
    'logico[]': 'logico',
    'lógico[]': 'logico',
};

export function resolverTipoEscalar(tipo: string | undefined, contexto: string): IRTipo {
    if (!tipo) {
        throw new Error(
            `${contexto} não tem tipo definido. O tradutor para x64 requer tipos explícitos.`
        );
    }

    const resolvido = SINONIMOS_ESCALARES[tipo];
    if (!resolvido) {
        if (tipo === 'real' || tipo === 'real_curto' || tipo === 'realCurto') {
            throw new Error(
                `${contexto} usa tipo de ponto flutuante ('${tipo}'), não suportado pelo tradutor para x64 ` +
                    `(exigiria instruções SSE/AVX sobre registradores xmm, ainda não implementadas).`
            );
        }
        if (tipo === 'qualquer') {
            throw new Error(
                `${contexto} tem tipo 'qualquer' (dinâmico). O tradutor para x64 requer tipos explícitos ` +
                    `e estáticos (numero, inteiro, longo ou lógico).`
            );
        }
        throw new Error(`${contexto} usa tipo não suportado pelo tradutor para x64: '${tipo}'.`);
    }

    return resolvido;
}

export function resolverTipoElementoVetor(tipo: string | undefined, contexto: string): IRTipo {
    if (!tipo) {
        throw new Error(
            `${contexto} não tem tipo de elemento definido. O tradutor para x64 requer vetores tipados ` +
                `(ex.: numero[]).`
        );
    }

    const resolvido = SINONIMOS_VETORES[tipo];
    if (!resolvido) {
        throw new Error(
            `${contexto} usa tipo de vetor não suportado pelo tradutor para x64: '${tipo}'. ` +
                `Suportados: numero[], inteiro[], longo[], lógico[]/logico[].`
        );
    }

    return resolvido;
}

/** Todo tipo escalar suportado ocupa um registrador/slot de 8 bytes (ver nota de arquitetura do backend). */
export function tamanhoEmBytes(_tipo: IRTipo): number {
    return 8;
}
