import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorVisuAlg } from "../../fontes/interpretador/dialetos";
import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;
        let interpretador: InterpretadorVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
            interpretador = new InterpretadorVisuAlg(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "olá-mundo"',
                    'inicio',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Atribuição', async () => {
                const saidasMensagens = [
                    "1",
                    "b"
                ]
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Atribuição"',
                        'var a: inteiro',
                        'var b: caracter',
                        'inicio',
                        'a <- 1',
                        'b := "b"',
                        'escreva (a)',
                        'escreva (b)',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it("Sucesso - Enquanto", async () => {
                const saidasMensagens = ['verdadeiro', 'num1 não é maior que 0', 'num1 não é maior que 0', 'num1 é maior que 0']
                // Aqui vamos simular a resposta para três variáveis de `leia()`.
                const respostas = [
                    -1, -2, 1
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "teste5"',
                    'var',
                    '    num1, num2: inteiro',
                    '    texto1, texto2: caractere',
                    '    teste: logico',
                    'inicio',
                    '    teste <- verdadeiro',
                    '    leia (num1)',
                    '    escreval(teste)',
                    '    enquanto teste = verdadeiro faca',
                    '         escreval("num1 não é maior que 0")',
                    '         leia (num1)',
                    '         se num1 > 0 entao',
                    '             teste <- falso',
                    '         fimse',
                    '    fimenquanto',
                    '    escreval("num1 é maior que 0")',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - limpatela', async () => {
                const saidasMensagens = [
                    "Teste 1",
                    "Teste 2",
                    "Teste 3",
                    "Teste 4",
                    "Teste 5",
                ]
                const retornoLexador = lexador.mapear([
                    'Algoritmo "limpatela"',
                    'Var',
                    'Inicio',
                    '    escreval("Teste 1")',
                    '    limpatela',
                    '    escreval("Teste 2")',
                    '    limpatela',
                    '    escreval("Teste 3")',
                    '    escreval("Teste 4")',
                    '    limpatela',
                    '    escreval("Teste 5")',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Leia', async () => {
                // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
                const respostas = [1, 2, 3, 4, 5];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'Algoritmo "Soma 5"',
                    'Var',
                    '    n1, n2, n3, n4, n5: inteiro',
                    'Inicio',
                    '    leia(n1, n2, n3, n4, n5)',
                    '    escreva(n1 + n2 + n3 + n4 + n5)',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saida).toEqual("15")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Equação Segundo Grau', async () => {
                const saidasMensagens = ['Informe o valor de A: ', 'Informe o valor de B: ', 'Informe o valor de C: ', 'Esta equação não possui raízes reais.']
                const respostas = [10, 21, 14];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };
                const retornoLexador = lexador.mapear([
                    'algoritmo "EquaçãoDoSegundoGrau"',
                    'var',
                       'a, b, c, delta, x1, x2: REAL',
                    'função calcula_delta(): REAL',
                    'var',
                       'delta : REAL',
                    'inicio',
                        'delta := b*b - 4*a*c',
                        'RETORNE delta',
                    'fimfunção',
                    'inicio',
                        'ESCREVA ("Informe o valor de A: ")',
                        'LEIA (a)',
                        'ESCREVA ("Informe o valor de B: ")',
                        'LEIA (b)',
                        'ESCREVA ("Informe o valor de C: ")',
                        'LEIA (c)',
                        'delta := calcula_delta()',
                        'SE ( delta < 0 ) ENTAO',
                           'ESCREVA ("Esta equação não possui raízes reais.")',
                        'SENAO',
                            'SE (delta = 0) ENTAO',
                               'x1 := (-b + RAIZQ(delta)) / (2*a)',
                               'ESCREVA ("Esta equação possui apenas uma raiz: ", x1)',
                            'SENAO',
                                'x1 := (-b + RAIZQ(delta)) / (2*a)',
                                'x2 := (-b - RAIZQ(delta)) / (2*a)',
                                'ESCREVA ("Esta equação possui duas raízes: ", x1, " e ", x2)',
                            'FIMSE',
                        'FIMSE',
                    'fimalgoritmo',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy();
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - "Repita Até" com acento', async () => {
                const saidasMensagens = ['1 - Dizer olá!', '2 – Dizer oi! ', '0 - Sair do programa']
                const respostas = [0];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "Repita Até"',
                        'var',
                        'opcao: inteiro',
                    'inicio',
                        'repita',
                            'escreval("1 - Dizer olá!")',
                            'escreval("2 – Dizer oi! ")',
                            'escreval("0 - Sair do programa")',
                            'leia(opcao)',
                            'se (opcao = 1) entao',
                                'escreval("Olá!")',
                            'fimse',
                            'se (opcao = 2) entao',
                                'escreval("Oi!")',
                            'fimse',
                        'até (opcao = 0)',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - IMC', async () => {
                const saidasMensagens = ['Massa(Kg): ', 'Altura (m): ', 'Parabens! Voce esta no seu peso ideal']
                // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                const respostas = [78, 1.78];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'Algoritmo "CalculaIMC"',
                    '',
                    'Var',
                    '    M: Real',
                    '    A: Real',
                    '    IMC: Real',
                    '',
                    'Inicio',
                    '   Escreva("Massa(Kg): ")',
                    '   Leia(M)',
                    '   Escreva("Altura (m): ")',
                    '   Leia(A)',
                    '   IMC <- M / (A ^ 2)',
                    '   Escreval("IMC: ", IMC:5:2)',
                    '   Se (IMC >= 18.5) e (IMC < 25) então',
                    '      Escreva("Parabens! Voce esta no seu peso ideal")',
                    '   senão',
                    '      Escreva("Voce nao esta na faixa de peso ideal")',
                    '   Fimse',
                    '',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it("Sucesso - Média de Vetor", async () => {
                const saidasMensagens = ['Digite a nota do1º Aluno', 'Digite a nota do2º Aluno', 'Digite a nota do3º Aluno', 'Digite a nota do4º Aluno', 'Digite a nota do5º Aluno', 'Digite a nota do6º Aluno', 'Digite a nota do7º Aluno', 'Digite a nota do8º Aluno', 'Digite a nota do9º Aluno', 'Digite a nota do10º Aluno', '-', 'Media do1º aluno: 90.5', 'Media do2º aluno: 83.5', 'Media do3º aluno: 71.5', 'Media do4º aluno: 94.5', 'Media do5º aluno: 76.5', 'Media do6º aluno: 90', 'Media do7º aluno: 80', 'Media do8º aluno: 65', 'Media do9º aluno: 75', 'Media do10º aluno: 85']
                // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                const respostas = [
                    90, 80, 50, 100, 60, 70, 75, 85, 89, 91,
                    74, 79, 99, 90, 65, 78, 100, 67, 93, 88
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "media-vetor"',
                    'var',
                    'media:vetor[1..10] de real',
                    'i:inteiro',
                    'n1,n2:real',
                    'inicio',
                    'para i de 1 ate 10 faca',
                    '     escreval ("Digite a nota do",i,"º Aluno")',
                    '     leia (n1,n2)',
                    '     media[i]<-(n1+n2)/2',
                    'fimpara',
                    'escreval ("-")',
                    'para i de 1 ate 10 faça',
                    '       escreval ("Media do",i,"º aluno: ", media[i])',
                    'fimpara',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it("Sucesso - Declaração de Vetores", async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "teste"',
                    'var',
                    'result_j1, result_j2 : vetor[1..2] de inteiro',
                    'inicio',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it("Sucesso - Matriz - Jogo da Velha", async () => {
                const retornoLexador = lexador.mapear([
                    'Algoritmo "Jogo da Velha"',
                    'Var',
                        'i, q, t: inteiro',
                        'jogoMatriz : vetor [1..3, 1..3] de caractere',
                    'Inicio',
                        'q <- 4',
                       't <- 7',
                       'para i de 1 ate 3 faca',
                          'jogoMatriz[1,i] <- numpcarac(i)',
                          'jogoMatriz[2,i] <- numpcarac(q)',
                          'jogoMatriz[3,i] <- numpcarac(t)',
                          'q <- q + 1',
                          't <- t + 1',
                       'fimpara',

                       'Escreval("      | ", jogoMatriz[1,1], " | ", jogoMatriz[1,2], " | ", jogoMatriz[1,3], " |")',
                       'Escreval("      +---+---+---+")',
                       'Escreval("      | ", jogoMatriz[2,1], " | ", jogoMatriz[2,2], " | ", jogoMatriz[2,3], " |")',
                       'Escreval("      +---+---+---+")',
                       'Escreval("      | ", jogoMatriz[3,1], " | ", jogoMatriz[3,2], " | ", jogoMatriz[3,3], " |")',
                    'Fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Para com passo negativo', async () => {
                const saidasMensagens = ['Digite um valor: ', '10', '8', '6', '4', '2', '0']
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = [
                    10
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "valoresPares"',
                    '',
                    'var',
                    'Cont, V: Inteiro',
                    '',
                    'inicio',
                    '    escreval("Digite um valor: ")',
                    '    Leia(V)',
                    '    para CONT de V ate 0 passo -2 faca',
                    '        Escreval(CONT)',
                    '    Fimpara',
                    '',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Para com passo dinâmico', async () => {
                const saidasMensagens = ['---------------------------', 'Digite o1º numero: ', 'Você deseja inserir mais um número? (S/N)', '---------------------------', 'Digite o2º numero: ', '---------------------------', 'Digite o3º numero: ', '---------------------------', 'Digite o4º numero: ', 'Valores repetidos não serão computados.', 'Você deseja inserir mais um número? (S/N)', '---------------------------', 'Digite o4º numero: ', '---------------------------', 'Digite o5º numero: ', 'Valores repetidos não serão computados.', 'Você deseja inserir mais um número? (S/N)']
                // Aqui vamos simular a resposta para doze variáveis de `leia()`.
                const respostas = [
                    2, 'S', 5, 'S', 6, 'S', 5, 'S', 3, 'S', 5, 'N'
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "semnome"',
                    'var',
                    '    li: vetor[0..9] de inteiro',
                    '    i, j, k: inteiro',
                    '    resposta: caractere',
                    'inicio',
                    '    i <- 0',
                    '    k <- 0',
                    '    enquanto resposta <> "N" faca',
                    '        escreval("---------------------------")',
                    '        escreval("Digite o", i + 1, "º numero: ")',
                    '        leia(li[i])',
                    '        se (i > 0) entao',
                    '            para j de 0 ate i - 1 faca',
                    '                se li[i] = li[j] entao',
                    '                    escreval("Valores repetidos não serão computados.")',
                    '                    i <- i - 1',
                    '                    interrompa',
                    '                fimse',
                    '            fimpara',
                    '        fimse',
                    '        escreval ("Você deseja inserir mais um número? (S/N)")',
                    '        leia(resposta)',
                    '        se (resposta <> "N") entao',
                    '            i <- i + 1',
                    '        fimse',
                    '    fimenquanto',
                    '    para k de 0 ate i faca',
                    '        escreva(li[k], " ")',
                    '    fimPara',
                    'fimAlgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }


                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Procedimento', async () => {
                const saidasMensagens = ['Digite dois valores: ', 'A variavel escolhida é 3']
                // Aqui vamos simular a resposta para duas variáveis de `leia()`.
                const respostas = [
                    2, 3
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo "semnome"',
                    '// Função :',
                    '// Autor :',
                    '// Data : 27/02/2014',
                    '// Seção de Declarações ',
                    'var',
                    'a,b:inteiro',
                    'procedimento mostranumero (a:inteiro;b:inteiro)',
                    '',
                    'inicio',
                    '',
                    'se a > b entao',
                    '     escreval ("A variavel escolhida é ",a)',
                    'senao',
                    '     escreval ("A variavel escolhida é ",b)',
                    'fimse',
                    'fimprocedimento',
                    '',
                    'inicio',
                    'escreval ("Digite dois valores: ")',
                    'leia (a,b)',
                    'mostranumero (a,b)',
                    '',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Procedimento com passagem por referência', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "Exemplo Parametros Referencia"',
                    'var',
                    '   m,n,res: inteiro',
                    '   procedimento soma (x,y: inteiro; var result: inteiro)',
                    '   inicio',
                    '       result <- x + y',
                    '   fimprocedimento',
                    'inicio',
                    '   n <- 4',
                    '   m <- -9',
                    '   soma(n,m,res)',
                    '   escreva(res)',
                    'fimalgoritmo'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetornoMesmaLinha = (saida: string) => {
                    expect(saida).toEqual("-5")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            })

            it('Sucesso - Operadores Lógicos', async () => {
                const saidasMensagens = ['A verdadeiro', 'A falso', 'A falso', 'A verdadeiro', 'B falso', 'C verdadeiro']
                const retornoLexador = lexador.mapear([
                    'algoritmo "Exemplo Xou"',
                    'var A, B, C, resultA, resultB, resultC: logico',
                    'inicio',
                    'A <- verdadeiro',
                    'B <- verdadeiro',
                    'C <- falso',
                    'resultA <- A ou B',
                    'escreval("A ", resultA)',
                    'resultA <- A xou B',
                    'escreval("A ", resultA)',
                    'resultA <- nao B',
                    'escreval("A ", resultA)',
                    'resultB <- B',
                    'resultA <- (A e B) ou (A xou B)',
                    'resultB <- (A ou B) e (A e C)',
                    'resultC <- A ou C e B xou A e nao B',
                    'escreval("A ", resultA)',
                    'escreval("B ", resultB)',
                    'escreval("C ", resultC)',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Aleatorio', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo "declaração aleatorio on"',
                    'var',
                    'numero: inteiro',
                    'inicio',
                    'aleatorio on',
                    'leia(numero)',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Negativos', async () => {
                // Aqui vamos simular a resposta para três variáveis de `leia()`.
                const respostas = [
                    "2", "-1", "3"
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                const saidas: string[] = [];
                interpretador.funcaoDeRetorno = (saida: any) => {
                    saidas.push(String(saida));
                }

                const retornoLexador = lexador.mapear([
                    'algoritmo "negativos"',
                    'var',
                    '  n, i: inteiro',
                    '  vet: vetor [0..9] de inteiro',
                    'inicio',
                    '  escreval("Quantos numeros voce vai digitar? ")',
                    '  leia(n)',
                    '  para i de 0 ate n-1 faca',
                    '    escreval("Digite um numero: ")',
                    '    leia(vet[i])',
                    '  fimpara',
                    '  escreval(" ")',
                    '  escreval("NUMEROS NEGATIVOS")',
                    '   para i de 0 ate n-1 faca',
                    '    se (vet[i] < 0) entao',
                    '      escreval(vet[i])',
                    '     fimse',
                    '  fimpara',
                    'fimalgoritmo'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(saidas.length).toBeGreaterThanOrEqual(6);
                expect(saidas[5]).toBe('-1');
            });
        });
    });
});
