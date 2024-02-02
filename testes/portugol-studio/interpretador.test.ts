import { AvaliadorSintaticoPortugolStudio } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorPortugolStudio } from '../../fontes/interpretador/dialetos';
import { LexadorPortugolStudio } from '../../fontes/lexador/dialetos';

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

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("Olá Mundo")
                }

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

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("15")
                }

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

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("É igual a 1")
                }

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

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("O resultado é:  5")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Trivial', async () => {
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

            it('Faca', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ',
                    '    funcao inicio()',
                    '    {',
                    '        inteiro valor = 2',
                    '        logico eNegativo',
                    '        faca',
                    '        {',
                    '           escreva("Ok\t", valor,"\n")',
                    '           valor--',
                    '           eNegativo = valor < 0',
                    '        }',
                    '        enquanto(nao eNegativo)',
                    '    }',
                    '}'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Funcao Vazio', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                    '   ',
                    '    funcao inicio()',
                    '    {',
                    '        imprime_linha()',
                    '    }',
                    '',
                    '    funcao vazio imprime_linha()',
                    '    {',
                    '       escreva("\n---------------------")',
                    '    }',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Estruturas de dados', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{  ',
                        //variável global do tipo inteiro  
                        'inteiro variavel',

                        'funcao inicio()',
                        '{  ',
                            'inteiro outra_variavel',

                            'real altura = 1.79',  
                    
                            'cadeia frase = "Isso é uma variável do tipo cadeia"',
                    
                            'caracter inicial = \'P\'',  
                    
                            'logico exemplo = verdadeiro',
                    
                            'escreva(altura)',
                        '}',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Retorne', async () => {
                const respostas = [1];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{  ',
                        'funcao inicio()',
                        '{  ',
                            'inteiro numero',
                            'escreva("Quantos elementos da sequência de Fibonacci deseja calcular? ")',
                            'leia(numero)',
                            'para (inteiro i = 1; i <= numero ; i++)',
                            '{',
                            '   escreva(fibonacci(i), " ")',
                            '}',
                            'escreva("\n")',
                        '}',
                        'funcao inteiro fibonacci(inteiro posicao)',
                        '{	',
                            'se (posicao == 1)',
                            '{',
                                'retorne 0',
                            '}',
                            'senao se (posicao == 2)',
                            '{',
                                'retorne 1',
                            '}',                    
                            'retorne fibonacci(posicao - 1) + fibonacci(posicao - 2)',
                        '}',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Constante', async () => {
                const respostas = ["Abigail", 4, 5, 10];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                        'funcao inicio ()',
                        '{	',                            

                            'const real PRECO_PARAFUSO = 1.50',
                            'const real PRECO_ARRUELA  = 2.00',
                            'const real PRECO_PORCA    = 2.50',

                            'cadeia nome',
                            'inteiro quantidade_parafusos, quantidade_arruelas, quantidade_porcas',
                            'real total_parafusos, total_arruelas, total_porcas, total_pagar',

                            'escreva("Digite seu nome: ")',
                            'leia(nome)',
                            
                            'escreva("\nDigite a quantidade de parafusos que deseja comprar: ")',
                            'leia(quantidade_parafusos)',
                            
                            'escreva("Digite a quantidade de arruelas que deseja comprar: ")',
                            'leia(quantidade_arruelas)',

                            'escreva("Digite a quantidade de porcas que deseja comprar: ")',
                            'leia(quantidade_porcas)',

                            'total_parafusos = PRECO_PARAFUSO * quantidade_parafusos',
                            'total_arruelas = PRECO_ARRUELA * quantidade_arruelas',
                            'total_porcas = PRECO_PORCA * quantidade_porcas',
                            
                            'total_pagar = total_parafusos + total_porcas + total_arruelas',
                            
                            'escreva("Cliente: ", nome, "\n")',
                            'escreva("===============================\n")',
                            'escreva("Parafusos: ", quantidade_parafusos, "\n")',
                            'escreva("Arruelas: " , quantidade_arruelas, "\n")',
                            'escreva("Porcas: ", quantidade_porcas, "\n")',
                            'escreva("===============================\n")',
                            'escreva("Total a pagar:  R$ ", total_pagar, "\n")',
                        '}',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escolha', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    '{',
                        'funcao inicio()',
                        '{',
                            'escolha (77)',
                            '{',
                                'caso 1:',
                                    'escreva ("Voce é lindo(a)!")',
                                    'pare',   // Impede que as instruções do caso 2 sejam executadas
                                 'caso 2:',
                                    'escreva ("Voce é um monstro!")',
                                    'pare',   // Impede que as instruções do caso 2 sejam executadas
                                 'caso 3:',
                                    'escreva ("Tchau!")',
                                    'pare',
                                 'caso contrario:', // Será executado para qualquer opção diferente de 1, 2 ou 3
                                    'escreva ("Opção Inválida !")',
                            '}',
                            'escreva("\n")',
                        '}',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
