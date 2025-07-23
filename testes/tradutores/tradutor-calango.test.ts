import { TradutorCalango } from '../../fontes/tradutores';

describe('Tradutor Calango -> Delégua', () => {
    const tradutor: TradutorCalango = new TradutorCalango();

     describe('Código', () => {
        it.skip('escreva -> escreva', () => {
            const codigo = `escreva('Olá Mundo')`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá Mundo'\)/i);
        });
    });
});
