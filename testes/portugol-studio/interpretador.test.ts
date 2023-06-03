import { AvaliadorSintaticoPortugolStudio } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorPortugolStudio } from '../../fontes/lexador/dialetos';
import { InterpretadorPortugolStudio } from '../../fontes/interpretador/dialetos';

describe('Interpretador (Portugol Studio)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPortugolStudio;
        let avaliadorSintatico: AvaliadorSintaticoPortugolStudio;
        let interpretador: InterpretadorPortugolStudio;

        beforeEach(() => {
            lexador = new LexadorPortugolStudio();
            avaliadorSintatico = new AvaliadorSintaticoPortugolStudio();
            interpretador = new InterpretadorPortugolStudio(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        escreva("Olá Mundo")',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Leia', async () => {
                // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                const respostas = [1, 2, 3, 4, 5];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro numero1, numero2, numero3, numero4, numero5',
                    '        leia(numero1, numero2, numero3, numero4, numero5)',
                    '        escreva(numero1 + numero2 + numero3 + numero4 + numero5)',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Leia com condicional se', async () => {
                const respostas = [1];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro n',
                    '        leia(n)',
                    '        se(n == 1) {',
                    '           escreva("É igual a 1")',
                    '        }',
                    '        senao {',
                    '           escreva("Não é igual a 1")',
                    '        }',
                    '    }',
                    '}'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Atribuição variaveis com soma', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        inteiro a = 2',
                    '        inteiro b = 3',
                    '        a = a + b',
                    '        escreva("O resultado é: ", a)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it.skip('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ', 
                    '    funcao inicio()',
                    '    {',
                    '        inteiro a = 2',
                    '        inteiro b = a',
                    '        escreva("variáveis a:",a," b:",b)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
