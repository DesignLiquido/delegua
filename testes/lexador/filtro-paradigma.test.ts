import {
    gerarPalavrasReservadasPorParadigma,
    obterPalavrasExcluidas,
} from '../../fontes/lexador/filtro-paradigma';
import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Filtro de Paradigma', () => {
    describe('gerarPalavrasReservadasPorParadigma', () => {
        describe('Modo imperativo', () => {
            it('Deve incluir palavras imperativas', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('imperativo');

                expect(palavras['escreva']).toBe(tiposDeSimbolos.ESCREVA);
                expect(palavras['leia']).toBe(tiposDeSimbolos.LEIA);
                expect(palavras['tente']).toBe(tiposDeSimbolos.TENTE);
                expect(palavras['pegue']).toBe(tiposDeSimbolos.PEGUE);
                expect(palavras['quebre']).toBe(tiposDeSimbolos.QUEBRAR);
                expect(palavras['importe']).toBe(tiposDeSimbolos.IMPORTAR);
            });

            it('Não deve incluir palavras infinitivas', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('imperativo');

                expect(palavras['escrever']).toBeUndefined();
                expect(palavras['ler']).toBeUndefined();
                expect(palavras['tentar']).toBeUndefined();
                expect(palavras['pegar']).toBeUndefined();
                expect(palavras['quebrar']).toBeUndefined();
                expect(palavras['importar']).toBeUndefined();
            });

            it('Deve incluir palavras neutras', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('imperativo');

                expect(palavras['se']).toBe(tiposDeSimbolos.SE);
                expect(palavras['senao']).toBe(tiposDeSimbolos.SENAO);
                expect(palavras['var']).toBe(tiposDeSimbolos.VARIAVEL);
                expect(palavras['constante']).toBe(tiposDeSimbolos.CONSTANTE);
                expect(palavras['enquanto']).toBe(tiposDeSimbolos.ENQUANTO);
                expect(palavras['para']).toBe(tiposDeSimbolos.PARA);
            });
        });

        describe('Modo infinitivo', () => {
            it('Deve incluir palavras infinitivas', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('infinitivo');

                expect(palavras['escrever']).toBe(tiposDeSimbolos.ESCREVA);
                expect(palavras['ler']).toBe(tiposDeSimbolos.LEIA);
                expect(palavras['tentar']).toBe(tiposDeSimbolos.TENTE);
                expect(palavras['pegar']).toBe(tiposDeSimbolos.PEGUE);
                expect(palavras['quebrar']).toBe(tiposDeSimbolos.QUEBRAR);
                expect(palavras['importar']).toBe(tiposDeSimbolos.IMPORTAR);
            });

            it('Não deve incluir palavras imperativas', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('infinitivo');

                expect(palavras['escreva']).toBeUndefined();
                expect(palavras['leia']).toBeUndefined();
                expect(palavras['tente']).toBeUndefined();
                expect(palavras['pegue']).toBeUndefined();
                expect(palavras['quebre']).toBeUndefined();
                expect(palavras['importe']).toBeUndefined();
            });

            it('Deve incluir palavras neutras', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('infinitivo');

                expect(palavras['se']).toBe(tiposDeSimbolos.SE);
                expect(palavras['senao']).toBe(tiposDeSimbolos.SENAO);
                expect(palavras['var']).toBe(tiposDeSimbolos.VARIAVEL);
                expect(palavras['constante']).toBe(tiposDeSimbolos.CONSTANTE);
                expect(palavras['enquanto']).toBe(tiposDeSimbolos.ENQUANTO);
                expect(palavras['para']).toBe(tiposDeSimbolos.PARA);
            });
        });

        describe('Modo ambos', () => {
            it('Deve incluir todas as palavras reservadas', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('ambos');

                // Imperativas
                expect(palavras['escreva']).toBe(tiposDeSimbolos.ESCREVA);
                expect(palavras['leia']).toBe(tiposDeSimbolos.LEIA);

                // Infinitivas
                expect(palavras['escrever']).toBe(tiposDeSimbolos.ESCREVA);
                expect(palavras['ler']).toBe(tiposDeSimbolos.LEIA);

                // Neutras
                expect(palavras['se']).toBe(tiposDeSimbolos.SE);
                expect(palavras['var']).toBe(tiposDeSimbolos.VARIAVEL);
            });

            it('Deve ter todas as formas de retorna/retorne/retornar', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('ambos');

                expect(palavras['retorna']).toBe(tiposDeSimbolos.RETORNA);
                expect(palavras['retorne']).toBe(tiposDeSimbolos.RETORNA);
                expect(palavras['retornar']).toBe(tiposDeSimbolos.RETORNA);
            });

            it('Deve ter todas as formas de faça/faca/fazer', () => {
                const palavras = gerarPalavrasReservadasPorParadigma('ambos');

                expect(palavras['faca']).toBe(tiposDeSimbolos.FAZER);
                expect(palavras['faça']).toBe(tiposDeSimbolos.FAZER);
                expect(palavras['fazer']).toBe(tiposDeSimbolos.FAZER);
            });
        });
    });

    describe('obterPalavrasExcluidas', () => {
        it('Deve retornar palavras infinitivas quando modo é imperativo', () => {
            const excluidas = obterPalavrasExcluidas('imperativo');

            expect(excluidas).toContain('escrever');
            expect(excluidas).toContain('ler');
            expect(excluidas).toContain('tentar');
            expect(excluidas).toContain('pegar');
            expect(excluidas).toContain('quebrar');
            expect(excluidas).toContain('importar');
            expect(excluidas).toContain('fazer');
        });

        it('Deve retornar palavras imperativas quando modo é infinitivo', () => {
            const excluidas = obterPalavrasExcluidas('infinitivo');

            expect(excluidas).toContain('escreva');
            expect(excluidas).toContain('leia');
            expect(excluidas).toContain('tente');
            expect(excluidas).toContain('pegue');
            expect(excluidas).toContain('quebre');
            expect(excluidas).toContain('importe');
            expect(excluidas).toContain('faca');
            expect(excluidas).toContain('faça');
        });

        it('Deve retornar array vazio quando modo é ambos', () => {
            const excluidas = obterPalavrasExcluidas('ambos');

            expect(excluidas).toEqual([]);
        });

        it('Não deve incluir palavras neutras nas exclusões', () => {
            const excluidasImperativo = obterPalavrasExcluidas('imperativo');
            const excluidasInfinitivo = obterPalavrasExcluidas('infinitivo');

            expect(excluidasImperativo).not.toContain('se');
            expect(excluidasImperativo).not.toContain('var');
            expect(excluidasInfinitivo).not.toContain('se');
            expect(excluidasInfinitivo).not.toContain('var');
        });
    });
});
