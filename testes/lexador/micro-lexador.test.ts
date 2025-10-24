import { MicroLexador } from '../../fontes/lexador/micro-lexador';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/microgramaticas/delegua';

describe('Lexador', () => {
    describe('mapear()', () => {
        let microLexador: MicroLexador;

        beforeEach(() => {
            microLexador = new MicroLexador();
        });

        describe('Cenários de sucesso', () => {
            it('Código vazio', () => {
                const resultado = microLexador.mapear('');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Literal', () => {
                const resultado = microLexador.mapear('2');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Variável', () => {
                const resultado = microLexador.mapear('teste');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Soma', () => {
                const resultado = microLexador.mapear('teste + 2');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
            });

            it('Operações matemáticas encadeadas', () => {
                const resultado = microLexador.mapear('1 * 2 - 3 % 4');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
            });

            it('Operações matemáticas encadeadas', () => {
                const resultado = microLexador.mapear('somar(2, 3)');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(6);
            });

            it('Vetores literais', () => {
                const resultado = microLexador.mapear('[1, 2, 3, 4, 5]');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(11);
            });

            it('Operador Elvis', () => {
                const resultado = microLexador.mapear('nulo ?: 123');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
                expect(resultado.simbolos[1].tipo).toBe(tiposDeSimbolos.ELVIS);
            });
        });
    });
});
