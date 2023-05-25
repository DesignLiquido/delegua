import { MicroLexador } from './../fontes/lexador/micro-lexador';

describe('Lexador', () => {
    describe('mapear()', () => {
        let microLexador: MicroLexador;

        beforeEach(() => {
            microLexador = new MicroLexador();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = microLexador.mapear('');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Sucesso - Literal', () => {
                const resultado = microLexador.mapear('2');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Sucesso - Variável', () => {
                const resultado = microLexador.mapear('teste');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Sucesso - Soma', () => {
                const resultado = microLexador.mapear('teste + 2');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
            });

            it('Sucesso - Operações matemáticas encadeadas', () => {
                const resultado = microLexador.mapear('1 * 2 - 3 % 4');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
            });

            it('Sucesso - Operações matemáticas encadeadas', () => {
                const resultado = microLexador.mapear('somar(2, 3)');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(6);
            });
        });
    });
});
