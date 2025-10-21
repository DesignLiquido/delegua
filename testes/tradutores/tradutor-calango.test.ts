import { TradutorCalango } from '../../fontes/tradutores';

describe('Tradutor Calango -> Delégua', () => {
    const tradutor: TradutorCalango = new TradutorCalango();

     describe('Código', () => {
        it('escreva -> escreva', () => {
            const codigo = `algoritmo semNome;
            principal
	            escreva("Olá mundo");
            fimPrincipal`;

            const resultado = tradutor.traduzir(codigo);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá Mundo'\)/i);
        });
    });
});
