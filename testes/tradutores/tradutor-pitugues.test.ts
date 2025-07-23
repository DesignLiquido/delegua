import { TradutorPitugues } from '../../fontes/tradutores';

describe('Tradutor Pitugues -> Delégua', () => {
    const tradutor: TradutorPitugues = new TradutorPitugues();

     describe('Código', () => {
        it('escreva -> escreva', () => {
            const codigo = `escreva('Olá Mundo')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá Mundo'\)/i);
        });
    });
});
