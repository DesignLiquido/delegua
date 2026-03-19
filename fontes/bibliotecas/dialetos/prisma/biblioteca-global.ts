import { FuncaoPadrao } from '../../../interpretador/estruturas';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';

/**
 * Carrega as funções nativas (built-ins) do dialeto Prisma na pilha de escopos.
 * Funções implementadas conforme o manual de Linguagem Prisma.
 *
 * @param interpretador - O interpretador em execução.
 * @param globals - Pilha de escopos de execução para registrar variáveis globais.
 */
export default function carregarBibliotecaGlobalPrisma(
    interpretador: any,
    globals: PilhaEscoposExecucaoInterface
): void {
    /**
     * `tipo(x)` - Retorna o tipo de um valor como texto.
     * Tipos suportados: "número", "texto", "tabela", "funcao", "logico", "nulo", "userdata"
     */
    globals.definirVariavel(
        'tipo',
        new FuncaoPadrao(1, function (_: any, valor: any) {
            const v = valor !== null && valor !== undefined && valor.hasOwnProperty('valor')
                ? valor.valor
                : valor;

            if (v === null || v === undefined) {
                return 'nulo';
            }

            if (typeof v === 'number') {
                return 'número';
            }

            if (typeof v === 'string') {
                return 'texto';
            }

            if (typeof v === 'boolean') {
                return 'logico';
            }

            if (typeof v === 'function') {
                return 'funcao';
            }

            if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
                return 'tabela';
            }

            // Fallback para tipos desconhecidos
            return typeof v;
        })
    );

    /**
     * `poe(...)` - Imprime os argumentos na saída. Alias para escreva/imprima.
     * Aceita múltiplos argumentos.
     */
    globals.definirVariavel(
        'poe',
        new FuncaoPadrao(1, function (_visitante: any, ...args: any[]) {
            for (const arg of args) {
                const v = arg !== null && arg !== undefined && arg.hasOwnProperty('valor')
                    ? arg.valor
                    : arg;

                const texto = v !== null && v !== undefined ? String(v) : 'nulo';
                interpretador.funcaoDeRetorno(texto);
            }
        })
    );

    /**
     * `pares(tabela)` - Retorna um iterador sobre os pares (chave, valor) de uma tabela.
     * Itera apenas sobre índices pares (0, 2, 4, ...).
     */
    globals.definirVariavel(
        'pares',
        new FuncaoPadrao(1, function (interp: any, tabela: any) {
            const t = tabela !== null && tabela !== undefined
                ? interp.resolverValor(tabela)
                : null;

            const resultado = [];
            if (Array.isArray(t)) {
                for (let i = 0; i < t.length; i += 2) {
                    resultado.push([i, t[i]]);
                }
            } else if (typeof t === 'object' && t !== null) {
                const valores = Object.values(t);
                for (let i = 0; i < valores.length; i += 2) {
                    resultado.push([i, valores[i]]);
                }
            }

            return resultado;
        })
    );

    /**
     * `ipares(tabela)` - Retorna um iterador sobre os pares (chave, valor) de uma tabela.
     * Itera apenas sobre índices ímpares (1, 3, 5, ...).
     */
    globals.definirVariavel(
        'ipares',
        new FuncaoPadrao(1, function (interp: any, tabela: any) {
            const t = tabela !== null && tabela !== undefined
                ? interp.resolverValor(tabela)
                : null;

            const resultado = [];
            if (Array.isArray(t)) {
                for (let i = 1; i < t.length; i += 2) {
                    resultado.push([i, t[i]]);
                }
            } else if (typeof t === 'object' && t !== null) {
                const valores = Object.values(t);
                for (let i = 1; i < valores.length; i += 2) {
                    resultado.push([i, valores[i]]);
                }
            }

            return resultado;
        })
    );

    /**
     * `convnumero(x)` - Converte um valor para número.
     * Se a conversão não for possível, retorna nulo ou lança um erro.
     */
    globals.definirVariavel(
        'convnumero',
        new FuncaoPadrao(1, function (_: any, valor: any) {
            const v = valor !== null && valor !== undefined && valor.hasOwnProperty('valor')
                ? valor.valor
                : valor;

            if (typeof v === 'number') {
                return v;
            }

            if (typeof v === 'string') {
                const num = parseFloat(v);
                return isNaN(num) ? null : num;
            }

            if (typeof v === 'boolean') {
                return v ? 1 : 0;
            }

            return null;
        })
    );

    /**
     * `convstring(x)` - Converte um valor para texto.
     * Qualquer valor é convertível em texto.
     */
    globals.definirVariavel(
        'convstring',
        new FuncaoPadrao(1, function (_: any, valor: any) {
            const v = valor !== null && valor !== undefined && valor.hasOwnProperty('valor')
                ? valor.valor
                : valor;

            if (v === null || v === undefined) {
                return 'nulo';
            }

            if (typeof v === 'boolean') {
                return v ? 'verdadeiro' : 'falso';
            }

            return String(v);
        })
    );

    /**
     * `tamanho(x)` - Retorna o tamanho de um vetor ou comprimento de uma string.
     */
    globals.definirVariavel(
        'tamanho',
        new FuncaoPadrao(1, function (_: any, valor: any) {
            const v = valor !== null && valor !== undefined && valor.hasOwnProperty('valor')
                ? valor.valor
                : valor;

            if (Array.isArray(v)) {
                return v.length;
            }

            if (typeof v === 'string') {
                return v.length;
            }

            if (typeof v === 'object' && v !== null) {
                return Object.keys(v).length;
            }

            return 0;
        })
    );

    /**
     * `aleatorio()` - Retorna um número aleatório entre 0 e 1.
     */
    globals.definirVariavel(
        'aleatorio',
        new FuncaoPadrao(0, function (_: any) {
            return Math.random();
        })
    );

    /**
     * `aleatorio_entre(min, max)` - Retorna um número aleatório entre min (inclusive) e max (exclusivo).
     */
    globals.definirVariavel(
        'aleatorio_entre',
        new FuncaoPadrao(2, function (_: any, min: any, max: any) {
            const minVal = min !== null && min !== undefined && min.hasOwnProperty('valor')
                ? min.valor
                : min;
            const maxVal = max !== null && max !== undefined && max.hasOwnProperty('valor')
                ? max.valor
                : max;

            if (typeof minVal !== 'number' || typeof maxVal !== 'number') {
                return null;
            }

            return Math.floor(Math.random() * (maxVal - minVal)) + minVal;
        })
    );
}
