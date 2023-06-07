
export function inferirTipoVariavel(variavel: string | number | Array<any> | boolean | null | undefined) {
    const tipo = typeof variavel;
    switch (tipo) {
        case 'string':
            return 'texto';
        case 'number':
            return 'número';
        case 'bigint':
            return 'longo';
        case 'boolean':
            return 'lógico';
        case 'undefined':
            return 'nulo';
        case 'object':
            if (Array.isArray(variavel)) return 'vetor';
            if (variavel === null) return 'nulo';
            if (variavel.constructor.name === 'DeleguaFuncao') return 'função';
            if (variavel.constructor.name === 'DeleguaModulo') return 'módulo';
            if (variavel.constructor.name === 'Classe') return 'objeto';
            return 'dicionário';
        case 'function':
            return 'função';
        case 'symbol':
            return 'símbolo';
    }
}
