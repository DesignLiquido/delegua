import { LexadorVisuAlg } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoVisuAlg } from '../../fontes/avaliador-sintatico/dialetos';

describe('Avaliador sintático (VisuAlg)', () => {
    describe('analisar()', () => {
        let lexador: LexadorVisuAlg;
        let avaliadorSintatico: AvaliadorSintaticoVisuAlg;

        beforeEach(() => {
            lexador = new LexadorVisuAlg();
            avaliadorSintatico = new AvaliadorSintaticoVisuAlg();
        });

        describe('Cenário de sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    ['algoritmo "olá-mundo"', 'inicio', 'escreva("Olá mundo")', 'fimalgoritmo'],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(3);
            });

            it('Sucesso - Atribuição', () => {
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

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.erros).toHaveLength(0);
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(8);
            });

            it('Sucesso - Enquanto', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Números de 1 a 10 (com enquanto...faca)"',
                        'var j: inteiro',
                        'inicio',
                        'j <- 1',
                        'enquanto j <= 10 faca',
                        '   escreva (j)',
                        '   j <- j + 1',
                        'fimenquanto',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
            });

            it('Sucesso - Escolha', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Times"',
                        'var time: caractere',
                        'inicio',
                        'escreva ("Entre com o nome de um time de futebol: ")',
                        'leia (time)',
                        'escolha time',
                        '    caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                        '        escreval ("É um time carioca.")',
                        '    caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                        '        escreval ("É um time paulista.")',
                        '    outrocaso',
                        '        escreval ("É de outro estado.")',
                        'fimescolha',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
            });

            it('Sucesso - Função', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'Algoritmo "exemplo-funcoes"',
                        'Var',
                        '   n: inteiro',
                        '   m: inteiro',
                        '   res: inteiro',
                        'Inicio',
                        '   funcao soma: inteiro',
                        '   var aux: inteiro',
                        '   inicio',
                        '      aux <- n + m',
                        '      retorne aux',
                        '   fimfuncao',
                        '   n <- 4',
                        '   m <- -9',
                        '   res <- soma',
                        '   escreva(res)',
                        'Fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(10);
            });

            it('Sucesso - Interrompa', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Números de 1 a 10 (com interrompa)"',
                        'var x: inteiro',
                        'inicio',
                        'x <- 0',
                        'repita',
                        '   x <- x + 1',
                        '   escreva (x)',
                        '   se x = 10 entao',
                        '      interrompa',
                        '   fimse',
                        'ate falso',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
            });

            it('Sucesso - Leia', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'Algoritmo "Soma 5"',
                        'Var',
                        '   n1, n2, n3, n4, n5: inteiro',
                        'Inicio',
                        '      leia(n1, n2, n3, n4, n5)',
                        '      escreva(n1 + n2 + n3 + n4 + n5)',
                        'Fimalgoritmo',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes.length).toBeGreaterThan(0);
            });

            it('Sucesso - Para', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Numeros de 1 a 10"',
                        'var j: inteiro',
                        'inicio',
                        '    para j de 1 ate 10 faca',
                        '        escreva (j)',
                        '    fimpara',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            it('Sucesso - Para (usando seta de ateribuiÇão)', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Numeros de 1 a 10"',
                        'var j: inteiro',
                        'inicio',
                        '    para j <- 1 ate 10 faca',
                        '        escreva (j)',
                        '    fimpara',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });

            it('Sucesso - Procedimento', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "semnome"',
                        'var',
                        'a,b:inteiro',
                        'procedimento mostranumero (a:inteiro;b:inteiro)',
                        'inicio',
                        'se a > b entao',
                        '     escreval ("A variavel escolhida é ",a)',
                        'senao',
                        '     escreval ("A variavel escolhida é ",b)',
                        'fimse',
                        'fimprocedimento',
                        'inicio',
                        'escreval ("Digite dois valores: ")',
                        'leia (a,b)',
                        'mostranumero (a,b)',
                        '',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(8);
            });

            it('Sucesso - Repita', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Números de 1 a 10 (com repita)"',
                        'var j: inteiro',
                        'inicio',
                        'j <- 1',
                        'repita',
                        '   escreva (j)',
                        '   j <- j + 1',
                        'ate j > 10',
                        'fimalgoritmo',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(5);
            });

            it('Sucesso - Xou', () => {
                const retornoLexador = lexador.mapear(
                    [
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
                        'fimalgoritmo',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(24);
            });

            it('Sucesso - Aleatorio - Números', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Exemplo Xou"',
                        'var',
                        'numero: inteiro',
                        'inicio',
                        'aleatorio 1, 5',
                        'leia(numero)',
                        'fimalgoritmo',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(4);
            });
        });

        describe('Cenário de falha', () => {
            it('Falha - Programa vazio', () => {
                const retornoLexador = lexador.mapear([''], 1);
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: "Esperada expressão 'algoritmo' para inicializar programa.",
                    })
                );
            });

            it('Falha - Programa sem algoritmo', () => {
                const retornoLexador = lexador.mapear(['inicio'], 1);
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: "Esperada expressão 'algoritmo' para inicializar programa.",
                    })
                );
            });

            it("Falha - Programa sem palavra chave após 'algoritmo'", () => {
                const retornoLexador = lexador.mapear(['algoritmo'], 1);
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: "Esperada cadeia de caracteres após palavra-chave 'algoritmo'.",
                    })
                );
            });

            it("Falha - Esperado quebra de linha para definição do segmento 'algoritmo'", () => {
                const retornoLexador = lexador.mapear(['algoritmo "Falha"'], 1);
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, 1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: "Esperado quebra de linha após definição do segmento 'algoritmo'.",
                    })
                );
            });

            it('Falha - Palavra sem fim', () => {
                const retornoLexador = lexador.mapear(
                    ['algoritmo "Falha-string"', 'inicio', 'escreva("Olá falha)', 'fimalgoritmo'],
                    -1
                );

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrowError();
                // expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                //     expect.objectContaining({
                //         name: 'TypeError',
                //         message: "Cannot read property 'tipo' of undefined",
                //     })
                // );
            });

            it('Falha - Enquanto sem expressão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Números de 1 a 10 (com enquanto...faca)"',
                        'var j: inteiro',
                        'inicio',
                        'j <- 1',
                        'enquanto faca',
                        '   escreva (j)',
                        '   j <- j + 1',
                        'fimenquanto',
                        'fimalgoritmo',
                    ],
                    -1
                );

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: 'Esperado expressão.',
                    })
                );
            });

            it('Falha - Escolha sem expressão', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Times"',
                        'var time: caractere',
                        'inicio',
                        'escreva ("Entre com o nome de um time de futebol: ")',
                        'leia (time)',
                        'escolha',
                        '    caso "Flamengo", "Fluminense", "Vasco", "Botafogo"',
                        '        escreval ("É um time carioca.")',
                        '    caso "São Paulo", "Palmeiras", "Santos", "Corínthians"',
                        '        escreval ("É um time paulista.")',
                        '    outrocaso',
                        '        escreval ("É de outro estado.")',
                        'fimescolha',
                        'fimalgoritmo',
                    ],
                    -1
                );

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: 'Esperado expressão.',
                    })
                );
            });

            it(`Falha - Programa não terminado por 'fimalgoritmo'`, () => {
                const retornoLexador = lexador.mapear(['algoritmo "Falha"', 'inicio'], -1);

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrowError();
            });

            it('Falha - Aleatorio', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo "Exemplo Xou"',
                        'var',
                        'numero: inteiro',
                        'inicio',
                        'aleatorio 1, ',
                        'leia(numero)',
                        'fimalgoritmo',
                    ],
                    -1
                );

                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrowError();
                expect(() => avaliadorSintatico.analisar(retornoLexador, -1)).toThrow(
                    expect.objectContaining({
                        name: 'Error',
                        message: "Esperado um número após ','.",
                    })
                );
            });
        });
    });
});
