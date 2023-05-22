import { TradutorReversoPython } from '../../fontes/tradutores/tradutor-reverso-python';

describe('Tradutor Reverso Python -> Delégua', () => {
    const tradutor: TradutorReversoPython = new TradutorReversoPython();

    describe('Código', () => {
        it('print -> escreva', () => {
            const codigo = `print('Oi')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Oi'\)/i);
        });

        it('input -> leia', () => {
            const codigo = "a = input('Alguma coisa: ')\nprint(a)\n";

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/a = leia\('Alguma coisa: '\)/i);
            expect(resultado).toMatch(/escreva\(a\)/i);
        });
    });
});
