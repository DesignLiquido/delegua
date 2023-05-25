import { TradutorPortugolIpt } from '../../fontes/tradutores';

describe('Tradutor Portugol IPT -> Delégua', () => {
    const tradutor: TradutorPortugolIpt = new TradutorPortugolIpt();

     describe('Código', () => {
        it('escreva -> escreva', () => {
            const codigo = `
                inicio
                    escrever "Olá Mundo"
                fim
            `;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá Mundo'\)/i);
        });
    });
});
