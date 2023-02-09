import { AvaliadorSintaticoPortugolStudio } from "../../fontes/avaliador-sintatico/dialetos";
import { ErroAvaliadorSintatico } from "../../fontes/avaliador-sintatico/erro-avaliador-sintatico";
import { LexadorPortugolStudio } from "../../fontes/lexador/dialetos";


describe('Avaliador sintático (Portugol Studio)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = lexador.mapear(
                [
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        escreva("Olá Mundo")',
                    '    }',
                    '}'
                ],
                -1
            );
            const retornoAvaliadorSintatico =
                avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Falha - Função `inicio()` não definida', () => {
            const retornoLexador = lexador.mapear(
                [
                    'programa',
                    '{',
                    '   ', 
                    '    funcao teste()',
                    '    {',
                    '        escreva("Olá Mundo")',
                    '    }',
                    '}'
                ],
                -1
            );

            const t = () => {
                avaliadorSintatico.analisar(retornoLexador);
            };

            expect(t).toThrow(ErroAvaliadorSintatico);
        });
    });
});
