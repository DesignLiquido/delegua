import { Delegua } from '../../fontes/delegua';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('portugol-studio');
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = delegua.lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        escreva("Olá Mundo")',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
