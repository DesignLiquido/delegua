import { AvaliadorSintaticoMapler } from '../../fontes/avaliador-sintatico/dialetos';
import { InterpretadorMapler } from "../../fontes/interpretador/dialetos";
import { LexadorMapler } from '../../fontes/lexador/dialetos';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorMapler;
        let avaliadorSintatico: AvaliadorSintaticoMapler;
        let interpretador: InterpretadorMapler;

        beforeEach(() => {
            lexador = new LexadorMapler();
            avaliadorSintatico = new AvaliadorSintaticoMapler();
            interpretador = new InterpretadorMapler(process.cwd());
        });

        describe('Cenários de sucesso', () => {
            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'inicio',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Trivial mesma linha', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis inicio escrever "olá mundo"; fim',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escrever simples', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'inicio',
                    'escrever "olá mundo";',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escrever com variável', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'idade: inteiro;',
                    'nome, sobrenome: cadeia;',
                    'inicio',
                    'idade <- 10;',
                    'escrever "Minha idade é: ", idade;',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Escrever lógicos e outros textos', async () => {
                const retornoLexador = lexador.mapear([
                    'variaveis',
                    'inicio',
                    'escrever "";',
                    'escrever "Mapler1 ", "Mapler2";',
                    'escrever "Mapler3 ", 10.2;',
                    'escrever verdadeiro;',
                    'escrever falso;',
                    'escrever nao verdadeiro;',
                    'escrever nao falso;',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            // it("Sucesso - Enquanto", async () => {
            //     // Aqui vamos simular a resposta para três variáveis de `leia()`.
            //     const respostas = [
            //         -1, -2, 1
            //     ];
            //     interpretador.interfaceEntradaSaida = {
            //         question: (mensagem: string, callback: Function) => {
            //             callback(respostas.shift());
            //         }
            //     };

            //     const retornoLexador = lexador.mapear([
            //         'algoritmo "teste5"',
            //         'var',
            //         '    num1, num2: inteiro',
            //         '    texto1, texto2: caractere',
            //         '    teste: logico',
            //         'inicio',
            //         '    teste <- verdadeiro',
            //         '    leia (num1)',
            //         '    escreval(teste)',
            //         '    enquanto teste = verdadeiro faca',
            //         '         escreval("num1 não é maior que 0")',
            //         '         leia (num1)',
            //         '         se num1 > 0 entao',
            //         '             teste <- falso',
            //         '         fimse',
            //         '    fimenquanto',
            //         '    escreval("num1 é maior que 0")',
            //         'fimalgoritmo'
            //     ], -1);

            //     const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            //     const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            //     expect(retornoInterpretador.erros).toHaveLength(0);
            // });

            // it('Sucesso - Leia', async () => {
            //     // Aqui vamos simular a resposta para cinco variáveis de `leia()`.
            //     const respostas = [1, 2, 3, 4, 5];
            //     interpretador.interfaceEntradaSaida = {
            //         question: (mensagem: string, callback: Function) => {
            //             callback(respostas.shift());
            //         }
            //     };

            //     const retornoLexador = lexador.mapear([
            //         'Algoritmo "Soma 5"',
            //         'Var',
            //         '    n1, n2, n3, n4, n5: inteiro',
            //         'Inicio',
            //         '    leia(n1, n2, n3, n4, n5)',
            //         '    escreva(n1 + n2 + n3 + n4 + n5)',
            //         'Fimalgoritmo'
            //     ], -1);
    
            //     const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
    
            //     const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            //     expect(retornoInterpretador.erros).toHaveLength(0);
            // });

            // it('Sucesso - IMC', async () => {
            //     // Aqui vamos simular a resposta para duas variáveis de `leia()`.
            //     const respostas = [78, 1.78];
            //     interpretador.interfaceEntradaSaida = {
            //         question: (mensagem: string, callback: Function) => {
            //             callback(respostas.shift());
            //         }
            //     };

            //     const retornoLexador = lexador.mapear([
            //         'Algoritmo "CalculaIMC"',
            //         '',
            //         'Var',
            //         '    M: Real',
            //         '    A: Real',
            //         '    IMC: Real',
            //         '',
            //         'Inicio',
            //         '   Escreva("Massa(Kg): ")',
            //         '   Leia(M)',
            //         '   Escreva("Altura (m): ")',
            //         '   Leia(A)',
            //         '   IMC <- M / (A ^ 2)',
            //         '   Escreval("IMC: ", IMC:5:2)',
            //         '   Se (IMC >= 18.5) e (IMC < 25) entao',
            //         '      Escreva("Parabens! Voce esta no seu peso ideal")',
            //         '   senao',
            //         '      Escreva("Voce nao esta na faixa de peso ideal")',
            //         '   Fimse',
            //         '',
            //         'Fimalgoritmo'
            //     ], -1);

            //     const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            //     const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            //     expect(retornoInterpretador.erros).toHaveLength(0);
            // });

            // it("Sucesso - Média de Vetor", async () => {
            //     // Aqui vamos simular a resposta para duas variáveis de `leia()`.
            //     const respostas = [
            //         90, 80, 50, 100, 60, 70, 75, 85, 89, 91, 
            //         74, 79, 99, 90, 65, 78, 100, 67, 93, 88
            //     ];
            //     interpretador.interfaceEntradaSaida = {
            //         question: (mensagem: string, callback: Function) => {
            //             callback(respostas.pop());
            //         }
            //     };

            //     const retornoLexador = lexador.mapear([
            //         'algoritmo "media-vetor"',
            //         'var',
            //         'media:vetor[1..10] de real',
            //         'i:inteiro',
            //         'n1,n2:real',
            //         'inicio',
            //         'para i de 1 ate 10 faca',
            //         '     escreval ("Digite a nota do",i,"º Aluno")',
            //         '     leia (n1,n2)',
            //         '     media[i]<-(n1+n2)/2',
            //         'fimpara',
            //         'escreval ("-")',
            //         'para i de 1 ate 10 faca',
            //         '       escreval ("Media do",i,"º aluno: ", media[i])',
            //         'fimpara',
            //         'fimalgoritmo'
            //     ], -1);

            //     const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            //     const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            //     expect(retornoInterpretador.erros).toHaveLength(0);
            // });

            // it('Sucesso - Procedimento', async () => {
            //     // Aqui vamos simular a resposta para duas variáveis de `leia()`.
            //     const respostas = [
            //         2, 3
            //     ];
            //     interpretador.interfaceEntradaSaida = {
            //         question: (mensagem: string, callback: Function) => {
            //             callback(respostas.pop());
            //         }
            //     };

            //     const retornoLexador = lexador.mapear([
            //         'algoritmo "semnome"',
            //         '// Função :',
            //         '// Autor :',
            //         '// Data : 27/02/2014',
            //         '// Seção de Declarações ',
            //         'var',
            //         'a,b:inteiro',
            //         'procedimento mostranumero (a:inteiro;b:inteiro)',
            //         '',
            //         'inicio',
            //         '',
            //         'se a > b entao',
            //         '     escreval ("A variavel escolhida é ",a)',
            //         'senao',
            //         '     escreval ("A variavel escolhida é ",b)',
            //         'fimse',
            //         'fimprocedimento',
            //         '',
            //         'inicio',
            //         'escreval ("Digite dois valores: ")',
            //         'leia (a,b)',
            //         'mostranumero (a,b)',
            //         '',
            //         'fimalgoritmo'
            //     ], -1);
            //     const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
    
            //     const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            //     expect(retornoInterpretador.erros).toHaveLength(0);
            // });

            // it('Sucesso - Operadores Lógicos', async () => {
            //     const retornoLexador = lexador.mapear([
            //         'algoritmo "Exemplo Xou"',
            //         'var A, B, C, resultA, resultB, resultC: logico',
            //         'inicio',
            //         'A <- verdadeiro',
            //         'B <- verdadeiro',
            //         'C <- falso',
            //         'resultA <- A ou B',
            //         'escreval("A ", resultA)',
            //         'resultA <- A xou B',
            //         'escreval("A ", resultA)',
            //         'resultA <- nao B',
            //         'escreval("A ", resultA)',
            //         'resultB <- B',
            //         'resultA <- (A e B) ou (A xou B)',
            //         'resultB <- (A ou B) e (A e C)',
            //         'resultC <- A ou C e B xou A e nao B',
            //         'escreval("A ", resultA)',
            //         'escreval("B ", resultB)',
            //         'escreval("C ", resultC)',
            //         'fimalgoritmo'
            //     ], -1);
            //     const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);
    
            //     const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            //     expect(retornoInterpretador.erros).toHaveLength(0);
            // });
        });
    });
});
