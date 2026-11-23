import { MicroLexadorPitugues } from '../../../../fontes/lexador/micro-lexador-pitugues';



describe('Lexador', () => {
    describe('mapear()', () => {
        let microLexadorPitugues: MicroLexadorPitugues;

        beforeEach(() => {
            microLexadorPitugues = new MicroLexadorPitugues();
        });

        describe('Cenários de sucesso', () => {
            it('Código vazio', () => {
                const resultado = microLexadorPitugues.mapear('');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(0);
            });

            it('Literal', () => {
                const resultado = microLexadorPitugues.mapear('2');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Variável', () => {
                const resultado = microLexadorPitugues.mapear('teste');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('Soma', () => {
                const resultado = microLexadorPitugues.mapear('teste + 2');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(3);
            });

            it('Operações matemáticas encadeadas', () => {
                const resultado = microLexadorPitugues.mapear('1 * 2 - 3 % 4');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(7);
            });

            it('Operações matemáticas encadeadas', () => {
                const resultado = microLexadorPitugues.mapear('somar(2, 3)');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(6);
            });

            it('Vetores literais', () => {
                const resultado = microLexadorPitugues.mapear('[1, 2, 3, 4, 5]');

                expect(resultado).toBeTruthy();
                expect(resultado.simbolos).toHaveLength(11);
            });
        });
    });
});

describe('MicroLexador (Pituguês) - símbolos adicionais', () => {
    it.each([
        ['2 ** 3', ['EXPONENCIACAO']],
        ['6 / 3', ['DIVISAO']],
        ['7 \\ 2', ['DIVISAO_INTEIRA']],
        ["'texto'", ['TEXTO']],
        ['1.25', ['NUMERO']],
    ])('Mapeia %s', (codigo: string, tiposEsperados: string[]) => {
        const resultado = new MicroLexadorPitugues().mapear(codigo);
        expect(resultado.erros).toHaveLength(0);
        const tipos = resultado.simbolos.map((simbolo) => simbolo.tipo);
        expect(tipos).toEqual(expect.arrayContaining(tiposEsperados));
    });

    it('Texto não finalizado', () => {
        const resultado = new MicroLexadorPitugues().mapear('"abc');
        expect(resultado.erros.length).toBeGreaterThan(0);
    });
});
