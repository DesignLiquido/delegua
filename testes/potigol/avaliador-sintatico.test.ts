import { LexadorPotigol } from "../../fontes/lexador/dialetos";
import { AvaliadorSintaticoPotigol } from "../../fontes/avaliador-sintatico/dialetos";

describe('Avaliador sintático', () => {
    describe('analisar()', () => {
        let lexador = new LexadorPotigol();
        let avaliadorSintatico = new AvaliadorSintaticoPotigol();

        describe('Cenários de sucesso', () => {
            it('Sucesso - Escreva Olá Mundo', () => {
                const retornoLexador = lexador.mapear(['escreva "Olá mundo"'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - Imprima Olá Mundo', () => {
                const retornoLexador = lexador.mapear(['imprima "Olá mundo"'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });

            it('Sucesso - 2 + 2', () => {
                const retornoLexador = lexador.mapear(['escreva 2 + 2'], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
    
                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(1);
            });
        });
    });
});
