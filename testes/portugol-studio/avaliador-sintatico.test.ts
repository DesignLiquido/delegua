import { ErroAvaliadorSintatico } from "../../fontes/avaliador-sintatico/erro-avaliador-sintatico";
import { Delegua } from "../../fontes/delegua";

describe('Avaliador sintático (Portugol Studio)', () => {
    describe('analisar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('portugol-studio');
        });

        it('Sucesso - Olá Mundo', () => {
            const retornoLexador = delegua.lexador.mapear(
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
                delegua.avaliadorSintatico.analisar(retornoLexador);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
        });

        it('Falha - Função `inicio()` não definida', () => {
            const retornoLexador = delegua.lexador.mapear(
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
                delegua.avaliadorSintatico.analisar(retornoLexador);
            };

            expect(t).toThrow(ErroAvaliadorSintatico);
        });
    });
});
