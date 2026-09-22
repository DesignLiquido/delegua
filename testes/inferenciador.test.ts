import { inferirTipoVariavel } from '../fontes/inferenciador';
import { Literal } from '../fontes/construtos/literal';
import { Simbolo } from '../fontes/lexador';
import tiposDeDadosPrimitivos from '../fontes/tipos-de-dados/primitivos';
import tipoDeDadosDelegua from '../fontes/tipos-de-dados/delegua';
import tiposDeSimbolos from '../fontes/tipos-de-simbolos/delegua';

describe('inferirTipoVariavel', () => {
    describe('inferência de vetores', () => {
        it('vetor vazio retorna vetor', () => {
            expect(inferirTipoVariavel([])).toBe('vetor');
        });

        it('vetor misto retorna vetor', () => {
            expect(inferirTipoVariavel([1, 'a', true])).toBe('vetor');
        });

        it('vetor com elemento nulo não deve lançar exceção - issue 1225', () => {
            expect(() => inferirTipoVariavel([null, 1, 2])).not.toThrow();
        });

        it('vetor com elemento nulo retorna vetor - issue 1225', () => {
            expect(inferirTipoVariavel([null, 1, 2])).toBe('vetor');
        });

        it('vetor com apenas elementos nulos retorna vetor', () => {
            expect(inferirTipoVariavel([null, null, null])).toBe('vetor');
        });

        it('vetor com elemento indefinido não deve lançar exceção', () => {
            expect(() => inferirTipoVariavel([undefined, 1, 2])).not.toThrow();
        });

        it('vetor de Literal com tipo uniforme retorna tipo[]', () => {
            const vetor = [
                new Literal(-1, 1, 'olá', 'texto'),
                new Literal(-1, 1, 'mundo', 'texto'),
            ];
            expect(inferirTipoVariavel(vetor)).toBe('texto[]');
        });

        it('vetor de Literal com tipos mistos retorna vetor', () => {
            const vetor = [
                new Literal(-1, 1, 1, 'número'),
                new Literal(-1, 1, 'olá', 'texto'),
            ];
            expect(inferirTipoVariavel(vetor)).toBe('vetor');
        });

        it('vetor de booleanos retorna lógico[]', () => {
            const vetor = [
                { constructor: { name: 'boolean' } },
                { constructor: { name: 'boolean' } },
            ];
            expect(inferirTipoVariavel(vetor)).toBe('lógico[]');
        });

        it('vetor de números retorna número[]', () => {
            const vetor = [
                { constructor: { name: 'number' } },
                { constructor: { name: 'number' } },
            ];
            expect(inferirTipoVariavel(vetor)).toBe('número[]');
        });

        it('vetor de textos retorna texto[]', () => {
            const vetor = [
                { constructor: { name: 'string' } },
                { constructor: { name: 'string' } },
            ];
            expect(inferirTipoVariavel(vetor)).toBe('texto[]');
        });

        it('vetor de objetos com tipo uniforme retorna tipo[]', () => {
            const vetor = [
                { constructor: { name: 'object' }, tipo: 'registro' },
                { constructor: { name: 'object' }, tipo: 'registro' },
            ];
            expect(inferirTipoVariavel(vetor)).toBe('registro[]');
        });

        it('vetor de objetos com tipo misto retorna vetor', () => {
            const vetor = [{ tipo: 'registro' }, { tipo: 'entidade' }];
            expect(inferirTipoVariavel(vetor)).toBe('vetor');
        });
    });

    describe('inferência de tipos simples e símbolos', () => {
        it('deve inferir texto, número, longo, lógico, nulo e dicionário', () => {
            expect(inferirTipoVariavel('abc')).toBe('texto');
            expect(inferirTipoVariavel(10)).toBe('número');
            expect(inferirTipoVariavel(BigInt(10))).toBe('longo');
            expect(inferirTipoVariavel(true)).toBe('lógico');
            expect(inferirTipoVariavel(undefined)).toBe('nulo');
            expect(inferirTipoVariavel(null)).toBe('nulo');
            expect(inferirTipoVariavel({ chave: 'valor' })).toBe('dicionário');
        });

        it('deve inferir função e símbolo', () => {
            class FuncaoPadrao {
                chamar() {
                    return true;
                }
            }

            expect(inferirTipoVariavel(new FuncaoPadrao())).toBe('função');

            const simboloNativo = { constructor: { name: 'symbol' } };
            expect(inferirTipoVariavel(simboloNativo)).toBe('símbolo');
        });

        it('deve inferir classes nomeadas especiais', () => {
            class DeleguaFuncao {}
            class DeleguaModulo {}
            class Classe {}

            expect(inferirTipoVariavel(new DeleguaFuncao())).toBe('função');
            expect(inferirTipoVariavel(new DeleguaModulo())).toBe('módulo');
            expect(inferirTipoVariavel(new Classe())).toBe('objeto');
        });

        it('deve inferir símbolos nativos mapeados', () => {
            const simboloBooleano = new Simbolo(tiposDeDadosPrimitivos.BOOLEANO as any, 'booleano', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloBooleano))).toContain('booleano');

            const simboloEnquanto = new Simbolo(tiposDeSimbolos.ENQUANTO as any, 'enquanto', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloEnquanto))).toContain('enquanto');

            const simboloEscreva = new Simbolo(tiposDeSimbolos.ESCREVA as any, 'escreva', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloEscreva))).toContain('escreva');

            const simboloFuncao = new Simbolo(tiposDeSimbolos.FUNCAO as any, 'funcao', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloFuncao))).toContain('funções');

            const simboloLeia = new Simbolo(tiposDeSimbolos.LEIA as any, 'leia', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloLeia))).toContain('entrada de dados');

            const simboloPara = new Simbolo(tiposDeSimbolos.PARA as any, 'para', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloPara))).toContain('loops para');

            const simboloRetorna = new Simbolo(tiposDeSimbolos.RETORNA as any, 'retorna', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloRetorna))).toContain('retornar valores');

            const simboloSe = new Simbolo(tiposDeSimbolos.SE as any, 'se', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloSe))).toContain('estruturas condicionais');

            const simboloTexto = new Simbolo(tiposDeDadosPrimitivos.TEXTO as any, 'texto', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloTexto))).toContain('tipo texto');

            const simboloVazio = new Simbolo(tipoDeDadosDelegua.VAZIO as any, 'vazio', null, 1, -1);
            expect(String(inferirTipoVariavel(simboloVazio))).toContain('não retornam valores');
        });
    });
});
