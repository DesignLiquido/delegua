import { AvaliadorSintaticoPortugolStudio } from '../../fontes/avaliador-sintatico/dialetos';
import { ErroAvaliadorSintatico } from '../../fontes/avaliador-sintatico/erro-avaliador-sintatico';
import { LexadorPortugolStudio } from '../../fontes/lexador/dialetos';

describe.skip('Avaliador sintático (Portugol Studio)', () => {
    describe('analisar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
        });

        describe('Casos de Sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    ['programa', '{', '    funcao inicio()', '    {', '        escreva("Olá Mundo")', '    }', '}'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(2);
            });

            it('Sucesso - Leia', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'programa',
                        '{',
                        '    funcao inicio()',
                        '    {',
                        '        inteiro numero1, numero2, numero3, numero4, numero5',
                        '        leia(numero1, numero2, numero3, numero4, numero5)',
                        '        escreva(numero1 + numero2 + numero3 + numero4 + numero5)',
                        '    }',
                        '}',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
            });
        });

        describe('Casos de Falha', () => {
            it('Falha - Função `inicio()` não definida', () => {
                const retornoLexador = lexador.mapear(
                    ['programa', '{', '    funcao teste()', '    {', '        escreva("Olá Mundo")', '    }', '}'],
                    -1
                );

                const t = () => {
                    avaliadorSintatico.analisar(retornoLexador);
                };

                expect(t).toThrow(ErroAvaliadorSintatico);
            });
        });

        it.skip('Estrutura condicional - se e senao.', () => {
            const resultado = lexador.mapear(
                [
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        real numeroUm, numeroDois, soma',
                    '        numeroUm = 12.0',
                    '        numeroDois = 20.0',
                    '        soma = numeroUm + numeroDois',
                    '        se (soma > 20)',
                    '      {',
                    '        escreva("Numero maior que 20")',
                    '      }',
                    // '        senao',
                    // '      {',
                    // '        escreva("Numero menor que 20")',
                    // '      }',
                    '    }',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(resultado);

            expect(resultado).toBeTruthy();
            expect(resultado.simbolos).toHaveLength(42);
        });
    });
});
