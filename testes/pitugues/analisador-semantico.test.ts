import { LexadorPitugues } from '../../fontes/lexador/dialetos/lexador-pitugues';
import { AvaliadorSintaticoPitugues } from '../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';
import { AnalisadorSemanticoPitugues } from '../../fontes/analisador-semantico/dialetos';

describe('Analisador semântico', () => {
    let lexador: LexadorPitugues;
    let avaliadorSintatico: AvaliadorSintaticoPitugues;
    let analisadorSemantico: AnalisadorSemanticoPitugues;

    describe('analisar()', () => {
        beforeEach(() => {
            lexador = new LexadorPitugues();
            avaliadorSintatico = new AvaliadorSintaticoPitugues();
            analisadorSemantico = new AnalisadorSemanticoPitugues();
        });

        describe('Cenários de diagnósticos zerados', () => {
            it('Olá Mundo', async () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });            

            it('Função sem corpo', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao minhaFuncao():`
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);  
            });

            it('Absoluto', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao maior(x, y):`,
                    `    retorna (x + y + (x - y).absoluto()) \ 2`,
                    
                    ` x = inteiro(leia("Digite o primeiro número: "))`,
                    ` y = inteiro(leia("Digite o segundo número: "))`,
                    ` z = inteiro(leia("Digite o terceiro número: "))`,
                    ` maior_numero = maior(x, maior(y, z))`,
                    `escreva("\${maior_numero} eh o maior")`,
                ], -1);
                
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Antes das correções: 3 diagnósticos (1 sobre tipo de retorno + 2 sobre variáveis não usadas)
                // Após as correções: 1 diagnóstico (apenas sobre tipo de retorno, pois x, y, z agora são corretamente marcadas como usadas)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            describe('Declaração se ... senão se ... senão', () => {
                it('Caso com os três blocos', async () => {
                    const retornoLexador = lexador.mapear(
                        [
                            `funcao achePlaneta(coordenadas):`,
                            `    se (coordenadas == "x:20;y:10"):`,
                            `        retorna "Planeta Xalax"`,
                            `    senao se (coordenadas == "x:42;y:84"):`,
                            `        retorna "Planeta Haskell"`,
                            `    senao:`,
                            `        retorna "Planeta Kyron"`,
                            `escreva('O \${achePlaneta("x:42;y:84")} é para onde temos que ir!')`
                        ], -1
                    );
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
        });

        describe('Cenários de diagnósticos detectados', () => {
            it('Atribuição de constante + reatribuição de constante', async () => {
                const retornoLexador = lexador.mapear([
                    " a = 1",
                    "a = 2"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            
            it('Não retornando o tipo que a função definiu - texto', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao executar(valor1, valor2):`,
                    `     resultado = valor1 + valor2`,
                    `    retorna 10`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Não retornando o tipo que a função definiu - inteiro', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao executar(valor1, valor2):`,
                    `     resultado = valor1 + valor2`,
                    `    retorna 'a'`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Função sem retorno de valor', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao executar(valor1, valor2):`,
                    `     resultado = valor1 + valor2`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Escolha com tipos diferentes em \'caso\'', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao facaAlgumaCoisa():`,
                    `    escreva(123)`,
                    ` opcao = leia('Digite a opção desejada: ')`,
                    `escolha opcao:`,
                    `    caso 0:`,
                    `    caso 1:`,
                    `        facaAlgumaCoisa()`,
                    `    caso '1':`,
                    `        facaAlgumaCoisa()`,
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(3);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('\'caso 0:\' não é do mesmo tipo esperado em \'escolha\' (esperado: texto, atual: número).');
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe('\'caso 1:\' não é do mesmo tipo esperado em \'escolha\' (esperado: texto, atual: número).');
                expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toBe("Variável 'opcao' foi declarada mas nunca usada.");
            });

            it('Leia por padrão retorna texto', async () => {
                const retornoLexador = lexador.mapear([
                    ' opcao = leia(\'Digite a opção desejada: \')',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe("Variável 'opcao' foi declarada mas nunca usada.");
            });

            it('Atribuição de função', async () => {
                const retornoLexador = lexador.mapear([
                    ` f = função(a, b):`,
                    `    escreva(a + b)`,
                    `f(1)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Função \'f\' espera 2 parâmetros. Atual: 1.');
            });

            it('Chamada de função direta', async () => {
                const retornoLexador = lexador.mapear([
                    `função f(a, b):`,
                    `    escreva(a + b)`,
                    `f(1)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Função \'f\' espera 2 parâmetros. Atual: 1.');
            });

            it('Chamada de função com tipos inválidos na passagem dos parametros', async () => {
                const retornoLexador = lexador.mapear([
                    `função f(a, b, c, d):`,
                    `    escreva(a + b)`,
                    `f(1, 'teste0', 'teste1', 2)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Funções anônimas com mais de 255 parâmetros', async () => {
                let acumulador = '';
                for (let i = 1; i <= 256; i++) {
                    acumulador += 'a' + i + ', ';
                }

                acumulador = acumulador.substring(0, acumulador.length - 2);

                const funcaoCom256Argumentos1 = ' f1 = funcao(' + acumulador + ') {}';
                const funcaoCom256Argumentos2 = 'funcao f2(' + acumulador + ') {}';

                const retornoLexador = lexador.mapear([
                    funcaoCom256Argumentos1,
                    funcaoCom256Argumentos2
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Cenários enquanto', () => {
            describe('Cenários de diagnósiticos zerados', () => {
                it('com condicional verdadeiro', async () => {
                    const retornoLexador = lexador.mapear([
                        `enquanto verdadeiro:`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com condicional falso', async () => {
                    const retornoLexador = lexador.mapear([
                        `enquanto falso:`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com iavel definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear([
                        `const condicional = verdadeiro`,
                        `enquanto condicional:`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com variável e expressão binária', async () => {
                    const retornoLexador = lexador.mapear([
                        `const valor = 1`,
                        `enquanto valor != 5:`,
                        `    escreva("sim")`,
                        `    valor++`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com variável e agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        `valor = 1`,
                        `enquanto (valor != 5):`,
                        `    escreva("sim")`,
                        `    valor++`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('sucesso - verificar valores lógicos nas operações binárias', async () => {
                    const retornoLexador = lexador.mapear([
                        ` x = 5 > 2`,
                        ` y = 10 < 11`,
                        `enquanto (x e y):`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('sucesso - verificar operações aritméticas', async () => {
                    const retornoLexador = lexador.mapear([
                        ` x = 1`,
                        ` y = 2`,
                        `enquanto (x + y < 10): sustar`,
                        `enquanto (x - y < 10): sustar`,
                        `enquanto (x * y < 10): sustar`,
                        `enquanto (x / y < 10): sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('sucesso - verificar função declarada', async () => {
                    const retornoLexador = lexador.mapear([
                        `funcao funcaoExistente():`,
                        `    retorna verdadeiro`,
                        `enquanto (funcaoExistente()):`,
                        `    escreva('teste')`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
            describe('Cenários de diagnósticos detectados', () => {

                it('com iavel definida com valor inválido', async () => {
                    const retornoLexador = lexador.mapear([
                        `const condicional = "invalido"`,
                        `enquanto condicional:`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                // TODO: Mudar este teste ao reimplementar operações bit a bit com números.
                it('verificar valores lógicos nas operações binárias e agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        ` x = 5`,
                        ` y = 10`,
                        `enquanto (x e y):`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });

                it('verificar valores lógicos nas operações binárias sem agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        ` x = 5`,
                        ` y = 10`,
                        `enquanto x e y:`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });

                it('verificar operações aritméticas', async () => {
                    const retornoLexador = lexador.mapear([
                        ` x = 'texto'`,
                        ` y = 2`,
                        `enquanto (x + y < 10): sustar`,
                        `enquanto (x - y < 10): sustar`,
                        `enquanto (x * y < 10): sustar`,
                        `enquanto (x / y < 10): sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(4);
                });

                it('verificar operação divisão por zero', async () => {
                    const retornoLexador = lexador.mapear([
                        " x = 3",
                        " y = 0",
                        "enquanto (x / y < 10) ",
                        "   sustar",
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
                });
            });
        });

        describe('Cenários tipo de', () => {
            describe('Cenários de diagnósticos zerados', () => {
                it('com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear([
                        "condicional = verdadeiro     ",
                        "tipo de condicional                ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('tipo de com variável definida e agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        "a = 1      ",
                        "b = 2      ",
                        "tipo de (a + b)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });
            });
        });

        describe('Cenários falhar', () => {
            describe('Cenários de diagnósticos zerados', () => {
                it('Sucesso - falhar com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear([
                        " valor = 'teste'      ",
                        "falhar 'falhar ' + valor   ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Sucesso - falhar tipo de binario com variável não definida e agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        " a = 1      ",
                        " b = 1      ",
                        "falhar (a + b)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });
            });
        });

        describe('Cenários conversão implicita', () => {
            describe('Cenários de diagnósticos zerados', () => {
                it('Sucesso - conversão implicita com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear([
                        " valor = 2 + 2",
                        "escreva(valor)"
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });

            describe('Cenários de aviso', () => {
                it('Aviso - conversão implicita com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear([
                        " valor = 2 + '2'",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });
        });

        describe('Cenários variáveis não inicializada', () => {
            describe('Cenários de diagnósticos zerados', () => {
                it('Sucesso - variável de classe inicializada na declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste:",
                        " teste: Teste = Teste()",
                        "escreva(teste) ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - variável de classe inicializada após declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste:",
                        "   teste: Teste",
                        "teste = Teste()",
                        "escreva(teste) ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - variável tipo texto inicializada na declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste:",
                        "   teste = 'abc'",
                        "escreva(teste) ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - variável tipo texto inicializada após declaração', async () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste:",
                        " teste",
                        "teste = 'abc'",
                        "escreva(teste) ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
            describe('Cenários de diagnósticos detectados', () => {
                it('Aviso - variável tipo texto não inicializada', async () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste:",
                        " teste",
                        "escreva(teste) ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Erro - escreva sem parâmetro', async () => {
                    const retornoLexador = lexador.mapear([
                        "escreva() ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
        });

        describe('Cenários de chamadas de método em variáveis', () => {
            it('Sucesso - variável usada em chamada de método e resultado atribuído a outra variável', async () => {
                const retornoLexador = lexador.mapear([
                    `tex = "Eu sou um abacaxi"`,
                    `div = tex.dividir(" ")`,
                    `escreva(div)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Não deve haver diagnósticos porque:
                // 1. 'tex' é usada na chamada de método .dividir()
                // 2. 'div' é usada na chamada escreva()
                // 3. O inicializador de 'div' é uma Chamada (método que retorna array), não um Vetor literal
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - múltiplas variáveis com chamadas de método encadeadas', async () => {
                const retornoLexador = lexador.mapear([
                    `texto = "olá-mundo-teste"`,
                    `partes = texto.dividir("-")`,
                    `escreva(partes)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável usada em expressão binária simples', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 1`,
                    `y = 2`,
                    `z = x + y`,
                    `escreva(z)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Não deve haver avisos: x e y são usadas em z = x + y, z é usada em escreva
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável usada em função embutida', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 1`,
                    `y = inteiro(x)`,
                    `escreva(y)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // x é usada em inteiro(x), y é usada em escreva(y)
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável usada em chamada de método COM argumento', async () => {
                const retornoLexador = lexador.mapear([
                    `abc = "teste"`,
                    `xyz = abc.dividir(" ")`,
                    `escreva(xyz)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável usada em chamada de método SEM argumento', async () => {
                const retornoLexador = lexador.mapear([
                    `abc = "teste"`,
                    `xyz = abc.maiusculo()`,
                    `escreva(xyz)`,
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });
    });
    describe('Comando quebrar', () => {
        describe('Cenários com laço for', () => {
            it('Sucesso - dentro do laço for', async () => {
                const retornoLexador = lexador.mapear([
                    `para ( i = 0; i < 10; i++):`,
                    `    se (i == 5):`,
                    `        quebrar`,
                ], -1)
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Sucesso - dentro do laço enquanto', async () => {
                const retornoLexador = lexador.mapear([
                    `enquanto (verdadeiro):`,
                    `    se (i == 5):`,
                    `        quebrar`,
                ], -1)
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Sucesso - dentro do laço faça...enquanto', async () => {
                const retornoLexador = lexador.mapear([
                    `faça:`,
                    `    se (i == 5):`,
                    `        quebrar`,
                    `enquanto (verdadeiro):`,
                ], -1)
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });   
    });
}
)
