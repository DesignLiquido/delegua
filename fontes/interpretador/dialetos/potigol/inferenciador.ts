export function inferirTipoVariavel(variavel: string | number | Array<any> | boolean | null | undefined) {
    const tipo = typeof variavel;
    switch (tipo) {
        case 'string':
            return 'Texto';
        case 'number':
            return 'Número';
        case 'bigint':
            return 'Longo';
        case 'boolean':
            return 'Lógico';
        case 'undefined':
            return 'Nulo';
        case 'object':
            if (Array.isArray(variavel)) return 'vetor';
            if (variavel === null) return 'nulo';
            if (variavel.constructor.name === 'DeleguaModulo') return 'módulo';
            return 'Dicionário';
        case 'function':
            return 'Função';
        case 'symbol':
            return 'Símbolo';
    }
}
