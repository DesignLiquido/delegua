import { LexadorTenda } from '../../../../fontes/lexador/dialetos/lexador-tenda';

describe('Lexador (Tenda)', () => {
    describe('mapear()', () => {
        it.each([
            ['a == b', ['IGUAL_IGUAL']],
            ['a = b', ['IGUAL']],
            ['a // b', ['DIVISAO_INTEIRA']],
            ['a / b', ['DIVISAO']],
            ['a != b', ['DIFERENTE']],
            ['!a', ['NEGACAO']],
            ['seja x = 1; seja y = 2', ['SEJA', 'NUMERO']],
        ])('Mapeia %s', (codigo: string, tiposEsperados: string[]) => {
            const resultado = new LexadorTenda().mapear([codigo], -1);
            expect(resultado.erros).toHaveLength(0);
            const tipos = resultado.simbolos.map((simbolo) => simbolo.tipo);
            expect(tipos).toEqual(expect.arrayContaining(tiposEsperados));
        });

        it('Texto não finalizado', () => {
            const resultado = new LexadorTenda().mapear(['"abc'], -1);
            expect(resultado.erros.length).toBeGreaterThan(0);
        });
    });
});
