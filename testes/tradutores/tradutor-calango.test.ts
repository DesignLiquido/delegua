import { AvaliadorSintaticoCalango } from '../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango';
import { LexadorCalango } from '../../fontes/lexador/dialetos';
import { TradutorCalango } from '../../fontes/tradutores';

describe('Tradutor Calango -> Delégua', () => {
    const tradutor: TradutorCalango = new TradutorCalango();
    const lexador = new LexadorCalango();
    const avaliadorSintatico = new AvaliadorSintaticoCalango();

    describe('Código', () => {
        it('escreva -> escreva', async () => {
            const codigo = `algoritmo semNome;
            principal
	            escreva("Olá mundo");
            fimPrincipal`;

            const retornoLexador = lexador.mapear(codigo.split('\n'), -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/escreva\('Olá Mundo'\)/i);
        });
    });
});
