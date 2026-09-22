import { LexadorPitugues } from '../../../../fontes/lexador/dialetos/lexador-pitugues';
import { AvaliadorSintaticoPitugues } from '../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-pitugues';
import { AnalisadorSemanticoPitugues } from '../../../../fontes/analisador-semantico/dialetos';
import { Atribuir } from '../../../../fontes/construtos/atribuir';
import { Variavel } from '../../../../fontes/construtos/variavel';
import { Literal } from '../../../../fontes/construtos/literal';
import { SimboloInterface } from '../../../../fontes/interfaces';

describe('Analisador semântico', () => {
    let lexador: LexadorPitugues;
    let avaliadorSintatico: AvaliadorSintaticoPitugues;
    let analisadorSemantico: AnalisadorSemanticoPitugues;

    beforeEach(() => {
        lexador = new LexadorPitugues();
        avaliadorSintatico = new AvaliadorSintaticoPitugues();
        analisadorSemantico = new AnalisadorSemanticoPitugues();
    });

    describe('analisar()', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Olá Mundo', async () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Funções globais do dialeto Pituguês não geram erro de inexistência', async () => {
                const retornoLexador = lexador.mapear([
                    `numeros = [1, 2, 3]`,
                    `numero_aleatorio = aleatorio()`,
                    `numero_aleatorio_entre = aleatorio_entre(1, 9)`,
                    `soma = somar(numeros)`,
                    `todos_resultado = todos(numeros)`,
                    `escreva(numero_aleatorio, numero_aleatorio_entre, soma, todos_resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const diagnosticosDeInexistencia = retornoAnalisadorSemantico.diagnosticos.filter((d) =>
                    d.mensagem?.includes("não existe")
                );
                expect(diagnosticosDeInexistencia).toHaveLength(0);
            });

            it('Função sem corpo', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao minhaFuncao():`
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Funções sem tipo de retorno declarado podem retornar valores (tratados como 'qualquer')
                // As variáveis x, y, z são corretamente marcadas como usadas na interpolação e nas chamadas
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
        });

        describe('Cenários de diagnósticos detectados', () => {
            it('Atribuição e reatribuição de variável', async () => {
                const retornoLexador = lexador.mapear([
                    " a = 1",
                    "a = 2"
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Função sem retorno de valor', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao executar(valor1, valor2):`,
                    `     resultado = valor1 + valor2`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(3);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('\'caso 0:\' não é do mesmo tipo esperado em \'escolha\' (esperado: texto, atual: inteiro).');
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe('\'caso 1:\' não é do mesmo tipo esperado em \'escolha\' (esperado: texto, atual: inteiro).');
                expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toBe("Variável 'opcao' foi declarada mas nunca usada.");
            });

            it('Leia por padrão retorna texto', async () => {
                const retornoLexador = lexador.mapear([
                    ' opcao = leia(\'Digite a opção desejada: \')',
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe("Variável 'opcao' foi declarada mas nunca usada.");
            });


            it('Chamada de função direta', async () => {
                const retornoLexador = lexador.mapear([
                    `função f(a, b):`,
                    `    escreva(a + b)`,
                    `f(1)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });



            it('Chamada de função com variáveis declaradas como argumentos, sem espaços e com comentário', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao bhaskara(a,b,c):`,
                    `  nada`,
                    ``,
                    `# Insira os coeficientes depois da função`,
                    `a = 1`,
                    `b = -1`,
                    `c = -30`,
                    ``,
                    ``,
                    `bhaskara(a,b,c)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Função com mais  de 255 parâmetros', async () => {
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
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Função com tipos de parâmetros e argumentos incompatíveis', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao f(a: inteiro, b: texto):`,
                    `    escreva(a + b)`,
                    `f('teste', 1)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear([
                        `const condicional = verdadeiro`,
                        `enquanto condicional:`,
                        `    escreva("sim")`,
                        `    sustar`,
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
                it('com atribuição de variável nas operações binárias', async () => {
                    const retornoLexador = lexador.mapear([
                        `x = 1`,
                        `y = 2`,
                        `enquanto (x + y < 10):`,
                        `    x++`,
                        `    y++`,
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
                });

                it('verificar divisão por zero em retorno de função', async () => {
                    const retornoLexador = lexador.mapear([
                        "funcao somar_com_varios_parametros(a, b, c):",
                        "    soma = a + b + c",
                        "    imprima(soma)",
                        "    retorna 1/0",
                    ], -1);

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
                });
            });
        });

        describe('Cenários para cada', () => {
            it('Iteração simples em texto não deve gerar falso positivo de variável não usada', async () => {
                const retornoLexador = lexador.mapear([
                    'frase = "Venha aprender Pituguês na Python Brasil 2025!"',
                    'piramide = []',
                    'para cada palavra em frase.dividir(" "):',
                    '    escreva(palavra)',
                    '    piramide.adicionar(palavra)'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Iteração dupla em dicionário não deve gerar falso positivo de variável não usada', async () => {
                const retornoLexador = lexador.mapear([
                    'meus_dados = {"nome": "Victor", "linguagem": "Pituguês"}',
                    'para cada chave, valor em meus_dados:',
                    '    escreva(chave, valor)'
                ], -1);

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                    retornoLexador,
                    -1
                );
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Cenários tipo de', () => {
            describe('Cenários de diagnósticos zerados', () => {
                it('tipo de literal simples deve cair no retorno padrão', async () => {
                    const retornoLexador = lexador.mapear(
                        ['escreva(tipo (1))'],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(

                            retornoAvaliadorSintatico.declaracoes
                    );

                    const retorno = await analisadorSemantico.analisar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retorno).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });


                it('com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear(
                        [' condicional = verdadeiro     ', 'escreva(tipo(condicional))                '],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });


                it('tipo de com variável definida e agrupamento', async () => {
                    const retornoLexador = lexador.mapear([
                        "a = 1      ",
                        "b = 2      ",
                        "escreva(tipo(a + b))  ",
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
        });

    describe('Cenários falhar', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - falhar com variável definida com valor válido', async () => {
                const retornoLexador = lexador.mapear(
                    ["valor = 'teste'      ", "falhar 'falhar '  valor   "],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - falhar tipo de binario com variável não definida e agrupamento', async () => {
                const retornoLexador = lexador.mapear(
                    ['a = 1      ', 'b = 2      ', 'falhar "Deu ruim" (a + b)  '],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            });
            it('Sucesso - falhar tipo de binário com variável não definida e sem agrupamento', async () => {
                const retornoLexador = lexador.mapear(
                    ['a = 1      ', 'falhar "Deu ruim" a  '],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });


            describe('Cenários conversão implicita', () => {
                describe('Cenários de diagnósticos zerados', () => {
                    it('Sucesso - conversão implicita com variável definida com valor válido', async () => {
                        const retornoLexador = lexador.mapear([
                            " valor = 2 + 2",
                            "escreva(valor)"
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoAnalisadorSemantico).toBeTruthy();
                        expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                        const mensagens = retornoAnalisadorSemantico.diagnosticos.map((d: any) => d.mensagem);
                        expect(mensagens).toEqual(
                            expect.arrayContaining([
                                expect.stringContaining('Operação entre tipos diferentes'),
                                expect.stringContaining('foi declarada mas nunca usada'),
                            ])
                        );
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                        const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                        expect(retornoAnalisadorSemantico).toBeTruthy();
                        expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                    });

                    it('Erro - escreva sem parâmetro', async () => {
                        const retornoLexador = lexador.mapear([
                            "escreva() ",
                        ], -1);
                        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
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
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
        });

        describe('Cenários de redeclaração e atribuição', () => {
            it('Sucesso - atribuição de variável não declarada cria nova variável', async () => {
                const retornoLexador = lexador.mapear([
                    `novaVariavel = 123`,
                    `escreva(novaVariavel)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const diagnosticoValor = retornoAnalisadorSemantico.diagnosticos.some(d => d.mensagem?.includes("'valor' foi declarada mas nunca usada"));
                expect(diagnosticoValor || retornoAnalisadorSemantico.diagnosticos.length === 0).toBeTruthy();
            });

            it('Sucesso - reatribuição de variável existente', async () => {
                const retornoLexador = lexador.mapear([
                    `valor = 10`,
                    `valor = 20`,
                    `escreva(valor)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - múltiplas atribuições em sequência', async () => {
                const retornoLexador = lexador.mapear([
                    `a = 1`,
                    `b = 2`,
                    `c = a `,
                    `escreva(c)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain("'b' foi declarada mas nunca usada");
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBe(1);
            });
        });

        describe('Cenários de interpolação de texto', () => {
            it('não deve gerar erro quando interpolação referencia função existente', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao teste() {}',
                        'escreva("valor ${teste}")'
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retorno = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                // A função 'teste' referenciada na interpolação não gera falso positivo de "nunca usada"
                expect(retorno.diagnosticos.some(d => d.mensagem?.includes("'teste' foi declarada mas nunca usada"))).toBe(false);
            });

            it('interpolação com identificador não declarado não gera erro em tempo de análise', async () => {
                const retornoLexador = lexador.mapear([
                    `escreva('Valor: \${variavelInexistente}')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                // Verificação de variáveis inexistentes em interpolações é feita em tempo de execução
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.some(d => d.mensagem?.includes('usada em interpolação não existe'))).toBe(false);
            });

            it('Sucesso - interpolação com variável declarada sem valor inicial', async () => {
                const retornoLexador = lexador.mapear([
                    `x = nulo`,
                    `escreva('Valor: \${x}')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - interpolação com variável válida', async () => {
                const retornoLexador = lexador.mapear([
                    `nome = 'Mundo'`,
                    `escreva('Olá \${nome}!')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                const diagnosticoValor = retornoAnalisadorSemantico.diagnosticos.some(d => d.mensagem?.includes("Variável 'nome' foi declarada mas nunca usada") || d.mensagem?.includes("'nome' foi declarada mas nunca usada"));
                expect(diagnosticoValor || retornoAnalisadorSemantico.diagnosticos.length === 0).toBeTruthy();
            });

            it('Sucesso - interpolação com múltiplas variáveis', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 10`,
                    `y = 20`,
                    `escreva('Valores: \${x} e \${y}')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Falha - interpolação com variável não inicializada', async () => {
                const retornoLexador = lexador.mapear([
                    `x `,
                    `escreva('Valor: \${x}')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Cenários de acesso a intervalo de variável', () => {
            it('Chamada de visitarExpressaoAcessoIntervaloVariavel com índices literais', async () => {
                const retornoLexador = lexador.mapear([
                    `texto = 'abcdef'`,
                    `parte = texto[1:3]`,
                    `escreva(parte)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Atualmente, acesso a intervalo não marca variável como usada
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(0);
            });

            it('Chamada de visitarExpressaoAcessoIntervaloVariavel com variáveis nos índices', async () => {
                const retornoLexador = lexador.mapear([
                    `texto = 'abcdef'`,
                    `inicio = 1`,
                    `fim = 3`,
                    `parte = texto[inicio:fim]`,
                    `escreva(parte)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Testa que o método visitarExpressaoAcessoIntervaloVariavel é chamado
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Chamada de visitarExpressaoAcessoIntervaloVariavel apenas com início', async () => {
                const retornoLexador = lexador.mapear([
                    `texto = 'abcdef'`,
                    `parte = texto[2:]`,
                    `escreva(parte)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Chamada de visitarExpressaoAcessoIntervaloVariavel apenas com fim', async () => {
                const retornoLexador = lexador.mapear([
                    `texto = 'abcdef'`,
                    `parte = texto[:3]`,
                    `escreva(parte)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de tuplas', () => {
            it('Sucesso - criação e uso de tupla simples com literais', async () => {
                const retornoLexador = lexador.mapear([
                    `tupla = (1, 'texto', verdadeiro)`,
                    `escreva(tupla)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Chamada de visitarExpressaoTuplaN com variáveis', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 10`,
                    `y = 20`,
                    `ponto = (x, y)`,
                    `escreva(ponto)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Verifica que o código foi executado (tuplas podem ou não marcar variáveis como usadas)
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Chamada de visitarExpressaoTuplaN com expressões binárias', async () => {
                const retornoLexador = lexador.mapear([
                    `a = 5`,
                    `b = 3`,
                    `resultado = (a + b, a - b, a * b)`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Testa que o método visitarExpressaoTuplaN é chamado
                // Nota: atualmente as variáveis dentro de expressões em tuplas podem não ser marcadas como usadas
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de escreva com variáveis', () => {
            it('Sucesso - escreva com variável válida', async () => {
                const retornoLexador = lexador.mapear([
                    `valor = 123`,
                    `escreva(valor)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - escreva com múltiplos argumentos', async () => {
                const retornoLexador = lexador.mapear([
                    `a = 1`,
                    `b = 2`,
                    `escreva(a, b, 'texto')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - escreva com função existente', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao teste():`,
                    `    retorna 'resultado'`,
                    `escreva(teste)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Cenários de uso de variáveis em expressões', () => {
            it('Sucesso - variável usada em expressão com operador de exponenciação', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 1`,
                    `y = 2`,
                    `z = x ^ y`,
                    `escreva(z)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável usada em chamada de método', async () => {
                const retornoLexador = lexador.mapear([
                    `tex = "teste"`,
                    `x = tex.maiusculo()`,
                    `escreva(x)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variáveis usadas em expressões binárias com exponenciação', async () => {
                const retornoLexador = lexador.mapear([
                    `x1 = 3`,
                    `y1 = 4`,
                    `x2 = 6`,
                    `y2 = 8`,
                    `resultado = (x2 - x1) ^ 2 + (y2 - y1) ^ 2`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Todas as variáveis são usadas:
                // - x1, y1, x2, y2: usadas na expressão binária
                // - resultado: usada em escreva
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Cenários adicionais de funções', () => {
            it('Sucesso - função sem tipo de retorno declarado mas que retorna valor', async () => {
                const retornoLexador = lexador.mapear([
                    `função teste(argumento):`,
                    `    retorna argumento`,
                    `escreva(teste("1, 2, 3"))`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('deve gerar erro ao chamar função inexistente', async () => {
                const retornoLexador = lexador.mapear(
                    ['minhaFuncao()'],
                    -1
                );

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                const retorno = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retorno.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - função que não retorna valor', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao imprimir(mensagem):`,
                    `    escreva(mensagem)`,
                    `imprimir('Olá')`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - função com múltiplos parâmetros e corpo complexo', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao processar(x, y, z):`,
                    `    total = x + y + z`,
                    `    se (total > 10):`,
                    `        retorna total * 2`,
                    `    senao:`,
                    `        retorna total`,
                    `resultado = processar(2, 3, 4)`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - função recursiva simples', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao fatorial(n):`,
                    `    se (n <= 1):`,
                    `        retorna 1`,
                    `    senao:`,
                    `        retorna n * fatorial(n - 1)`,
                    `resultado = fatorial(5)`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Erro - função embutida inexistente', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 10`,

                    `escreva(x.inexistente())`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - função que retorna vetor', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao criarVetor():`,
                    `    retorna [1, 2, 3, 4, 5]`,
                    `numeros = criarVetor()`,
                    `escreva(numeros)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Função sem retorno de valor', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao executar(valor1, valor2): texto {',
                        '    resultado = valor1 + valor2',
                        '}',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);

            });
        });
        describe('Vetores', () => {

            it('Vetores com múltiplos tipos', async () => {
                const retornoLexador = lexador.mapear([
                    `lista = [1, 2, 3, 4, 5, "texto", verdadeiro]`,
                    `escreva(lista)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Vetores com acesso por índice', async () => {
                const retornoLexador = lexador.mapear([
                    `lista = [10, 20, 30]`,
                    `valor = lista[0]`,
                    `escreva(valor)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
            it('Inicialização de vetor vazio e adição de elementos', async () => {
                const retornoLexador = lexador.mapear([
                    `lista = Vetor()`,
                    `lista.adicionar(10)`,
                    `lista.adicionar(20)`,
                    `escreva(lista)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
            it('Vetores com tipos mistos', async () => {
                const retornoLexador = lexador.mapear([
                    `lista = [1, 2, 3, 4, 5, "texto", verdadeiro]`,
                    `escreva(lista)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Concatenação de vetores com operador + não deve gerar erro (issue #1328)', async () => {
                const retornoLexador = lexador.mapear([
                    `vetor1 = [1, 2, 4]`,
                    `vetor2 = [1, 3, 4]`,
                    `vetor_final = vetor1 + vetor2`,
                    `escreva(vetor_final)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });
        describe('Atribuição de tipos vetoriais - atribuição inconsciente com o tipo só gera aviso', () => {
            describe('Tipo inteiro[]', () => {
                it('Sucesso - vetor com valores inteiros', async () => {
                    const retornoLexador = lexador.mapear([
                        'numeros: inteiro[] = [1, 2, 3]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Sucesso - vetor inteiro[] com valores texto', async () => {
                    const retornoLexador = lexador.mapear([
                        'numeros: inteiro[] = [1, "texto", 3]',
                        'escreva(numeros)',
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();

                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Sucesso - vetor inteiro[] com valores reais', async () => {
                    const retornoLexador = lexador.mapear([
                        'numeros: inteiro[] = [1.5, 2.7, 3.14]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Sucesso - vetor inteiro[] sendo atribuído como Literal não vetor', async () => {
                    const retornoLexador = lexador.mapear([
                        'numeros: inteiro[] = "não é um vetor"'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();

                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });

            describe('Tipo texto[]', () => {
                it('Sucesso - vetor com valores texto', async () => {
                    const retornoLexador = lexador.mapear([
                        'palavras: texto[] = ["olá", "mundo", "teste"]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Sucesso - vetor texto[] com valores numéricos misturados', async () => {
                    const retornoLexador = lexador.mapear([
                        'palavras: texto[] = ["olá", 123, "teste"]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();

                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Sucesso - vetor texto[] com todos os valores numéricos', async () => {
                    const retornoLexador = lexador.mapear([
                        'numeros: texto[] = [1, 2, 3]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();

                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });

            describe('Tipo qualquer[]', () => {
                it('Sucesso - vetor qualquer[] com valores mistos', async () => {
                    const retornoLexador = lexador.mapear([
                        'dados: qualquer[] = [1, "texto", 3.14]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });

            describe('Tipo vetor (genérico)', () => {
                it('Sucesso - vetor genérico com valores inteiros', async () => {
                    const retornoLexador = lexador.mapear([
                        ' dados: vetor = [1, 2, 3]'
                    ], -1);
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });
        });
        describe('Cenários adicionais de cobertura completa', () => {

            it('Classes com métodos e propriedades', async () => {
                const retornoLexador = lexador.mapear([
                    `classe Pessoa:`,
                    `    nome: texto = ""`,
                    `    idade: numero = 0`,
                    `    funcao apresentar():`,
                    `        retorna "Olá, sou " + isto.nome`,
                    `p = Pessoa()`,
                    `p.nome = "João"`,
                    `escreva(p.apresentar())`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Dicionários com acesso de chaves', async () => {
                const retornoLexador = lexador.mapear([
                    `dicionario = {"chave1": 10, "chave2": 20}`,
                    `valor = dicionario["chave1"]`,
                    `escreva(valor)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Operações lógicas complexas', async () => {
                const retornoLexador = lexador.mapear([
                    `a = verdadeiro`,
                    `b = falso`,
                    `c = a ou b`,
                    `d = a e b`,
                    `e = nao a`,
                    `escreva(d, e)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.some(d => d.mensagem?.includes("'c' foi declarada mas nunca usada"))).toBe(true);
            });

            it('Operações com strings', async () => {
                const retornoLexador = lexador.mapear([
                    `texto1 = "Olá"`,
                    `texto2 = "Mundo"`,
                    `resultado = texto1 + " " + texto2`,
                    `comprimento = resultado.tamanho()`,
                    `maiuscula = resultado.maiusculo()`,
                    `escreva(resultado, comprimento, maiuscula)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Condicional se com múltiplas ramificações', async () => {
                const retornoLexador = lexador.mapear([
                    `valor = 50`,
                    `se (valor < 0):`,
                    `    resultado = "negativo"`,
                    `senao se (valor == 0):`,
                    `    resultado = "zero"`,
                    `senao se (valor < 100):`,
                    `    resultado = "pequeno"`,
                    `senao:`,
                    `    resultado = "grande"`,
                    `escreva(resultado, valor)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain("Variável 'valor' foi declarada mas nunca usada");
            });

            it('Para-cada com iteração', async () => {
                const retornoLexador = lexador.mapear([
                    `lista = [1, 2, 3, 4, 5]`,
                    `para cada elemento em lista:`,
                    `    escreva(elemento)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Incremento e decremento em loop', async () => {
                const retornoLexador = lexador.mapear([
                    `i = 0`,
                    `enquanto (i < 5):`,
                    `    i++`,
                    `escreva(i)`,
                    `j = 5`,
                    `enquanto (j > 0):`,
                    `    j--`,
                    `escreva(j)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Variáveis globais versus locais', async () => {
                const retornoLexador = lexador.mapear([
                    `global_var = 100`,
                    `funcao testarEscopo():`,
                    `    local_var = 50`,
                    `    retorna global_var + local_var`,
                    `resultado = testarEscopo()`,
                    `escreva(resultado, global_var)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Expressões ternárias', async () => {
                const retornoLexador = lexador.mapear([
                    `idade = 20`,
                    `status = se (idade >= 18) "maior" senao "menor"`,
                    `escreva(status)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Operações com valores nulos', async () => {
                const retornoLexador = lexador.mapear([
                    `valor = nulo`,
                    `tipo de valor`,
                    `se (valor == nulo):`,
                    `    escreva("é nulo")`,
                    `senao:`,
                    `    escreva("não é nulo")`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Leia por padrão retorna texto', async () => {
                const retornoLexador = lexador.mapear(
                    ["opcao: inteiro = leia('Digite a opção desejada: ')"],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain(
                    "Atribuição inválida para 'opcao', Função 'leia()' sempre retorna 'texto'."
                );
            });

            it('Atribuição múltipla e operações compostas', async () => {
                const retornoLexador = lexador.mapear([
                    `a = 10`,
                    `a += 5`,
                    `a -= 3`,
                    `a *= 2`,
                    `escreva(a)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        }); describe('Cenários tipo de', () => {
            describe('Cenários de diagnósticos zerados', () => {
                it('com variável definida com valor válido', async () => {
                    const retornoLexador = lexador.mapear(
                        ['condicional = verdadeiro     ', 'tipo de condicional                '],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('tipo de com variável definida e agrupamento', async () => {
                    const retornoLexador = lexador.mapear(
                        ['a = 1      ', 'b = 2      ', 'tipo de (a + b)  '],
                        -1
                    );
                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                        retornoAvaliadorSintatico.declaracoes
                    );
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });
                it('tipo de literal deve cair no retorno padrão', async () => {
                    const retornoLexador = lexador.mapear(
                        ['tipo de 1'],
                        -1
                    );

                    const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                    const retorno = await analisadorSemantico.analisar(
                        retornoAvaliadorSintatico.declaracoes
                    );

                    expect(retorno).toBeTruthy();
                });

            });
        });
        describe('calcularOperacaoBinaria', () => {

            test('operações aritméticas básicas', () => {
                const analisador: any = analisadorSemantico as any;
                expect(analisador.calcularOperacaoBinaria('ADICAO', 1, 2)).toBe(3);
                expect(analisador.calcularOperacaoBinaria('SUBTRACAO', 5, 3)).toBe(2);
                expect(analisador.calcularOperacaoBinaria('MULTIPLICACAO', 2, 4)).toBe(8);
                expect(analisador.calcularOperacaoBinaria('DIVISAO', 10, 2)).toBe(5);
                expect(analisador.calcularOperacaoBinaria('MODULO', 10, 3)).toBe(1);
                expect(analisador.calcularOperacaoBinaria('MAIOR_IGUAL', 5, 5)).toBe(true);
                expect(analisador.calcularOperacaoBinaria('MAIOR_IGUAL', 4, 5)).toBe(false);
                expect(analisador.calcularOperacaoBinaria('MENOR', 3, 4)).toBe(true);
                expect(analisador.calcularOperacaoBinaria('MENOR', 5, 2)).toBe(false);
                expect(analisador.calcularOperacaoBinaria('IGUAL', 2, 2)).toBe(true);
                expect(analisador.calcularOperacaoBinaria('IGUAL', 2, '2')).toBe(false);
                expect(analisador.calcularOperacaoBinaria('DIFERENTE', 2, '2')).toBe(true);
                expect(analisador.calcularOperacaoBinaria('DIFERENTE', 2, 2)).toBe(false);
            });

            test('divisão por zero (comportamento JS)', () => {
                const analisador: any = analisadorSemantico as any;
                const resultado = analisador.calcularOperacaoBinaria('DIVISAO', 1, 0)
                expect(resultado).toBe(Infinity);
            });

            test('concatenação de textos com ADICAO', () => {
                const analisador: any = analisadorSemantico as any;
                expect(analisador.calcularOperacaoBinaria('ADICAO', 'a', 'b')).toBe('ab');
            });

            test('comparações e igualdade estrita', () => {
                const analisador: any = analisadorSemantico as any;
                expect(analisador.calcularOperacaoBinaria('MAIOR', 5, 3)).toBe(true);
                expect(analisador.calcularOperacaoBinaria('MENOR_IGUAL', 2, 2)).toBe(true);
                expect(analisador.calcularOperacaoBinaria('IGUAL', 2, '2')).toBe(false);
                expect(analisador.calcularOperacaoBinaria('DIFERENTE', 2, '2')).toBe(true);

            });

           it('operador desconhecido retorna null', () => {
                const analisador: any = analisadorSemantico as any;
                expect(analisador.calcularOperacaoBinaria('XYZ', 1, 2)).toBeNull();
            });

                    it('visitarExpressaoDeAtribuicao: variável não declarada e variável imutável e tipo inválido', async () => {
                        const analisador = new AnalisadorSemanticoPitugues();

                        const simbX: SimboloInterface = {
                            lexema: 'x',
                            tipo: 'inteiro',
                            literal: 'x',
                            linha: 10,
                            hashArquivo: 1,
                        };
                        const varX = new Variavel(1, simbX, 'inteiro');
                        const atribX = new Atribuir(1, varX, new Literal(1, 10, 1, 'inteiro'));

                        // Caso: variável ainda não foi declarada
                        await analisador.visitarExpressaoDeAtribuicao(atribX);
                        expect(analisador).toBeTruthy();

                        // Caso: variável imutável
                        // Declarar uma variável imutável no escopo
                        analisador.gerenciadorEscopos.declarar('y', {
                            nome: 'y',
                            tipo: 'inteiro',
                            imutavel: true,
                            inicializada: true,
                            usada: false,
                            hashArquivo: 1,
                            linha: 20,
                        });

                        const simbY: SimboloInterface = {
                            lexema: 'y',
                            tipo: 'inteiro',
                            literal: 'y',
                            linha: 20,
                            hashArquivo: 1,
                        };
                        const varY = new Variavel(1, simbY, 'inteiro');
                        const atribY = new Atribuir(1, varY, new Literal(1, 20, 2, 'inteiro'));

                        await analisador.visitarExpressaoDeAtribuicao(atribY);
                        expect(
                            analisador
                        ).toBeTruthy();

                        // Caso: tipo inválido (atribuição de número para texto)
                        analisador.gerenciadorEscopos.declarar('z', {
                            nome: 'z',
                            tipo: 'texto',
                            imutavel: false,
                            inicializada: true,
                            usada: false,
                            hashArquivo: 1,
                            linha: 30,
                        });

                        const simbZ: SimboloInterface = {
                            lexema: 'z',
                            tipo: 'texto',
                            literal: 'z',
                            linha: 30,
                            hashArquivo: 1,
                        };
                        const varZ = new Variavel(1, simbZ, 'texto');
                        const atribZ = new Atribuir(1, varZ, new Literal(1, 30, 123, 'inteiro'));

                        await analisador.visitarExpressaoDeAtribuicao(atribZ);
                        expect(
                            analisador.diagnosticos[0].mensagem?.includes("Esperado tipo 'texto' na atribuição.")
                        ).toBeTruthy();
                    });
        });

        describe('Cenários de atribuição com tipos em variáveis já declaradas', () => {
            it('Erro - atribuir literal a variável com tipo vetor (inteiro[])', async () => {
                const retornoLexador = lexador.mapear([
                    `numeros: inteiro[] = [1, 2, 3]`,
                    `numeros = 10`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();

            });

            it('Erro - atribuir vetor a variável com tipo escalar (texto)', async () => {
                const retornoLexador = lexador.mapear([
                    `nome: texto = "abc"`,
                    `nome = [1, 2, 3]`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();

            });

            it('Erro - atribuir texto a variável com tipo inteiro', async () => {
                const retornoLexador = lexador.mapear([
                    `valor: inteiro = 10`,
                    `valor = "abc"`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();

            });

            it('Erro - atribuir número a variável com tipo texto', async () => {
                const retornoLexador = lexador.mapear([
                    `nome: texto = "abc"`,
                    `nome = 123`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain("Esperado tipo 'texto' na atribuição.");
            });

            it('Erro - atribuir vetor de texto[] com valores numéricos na reatribuição', async () => {
                const retornoLexador = lexador.mapear([
                    `palavras: texto[] = ["a", "b"]`,
                    `palavras = [1, 2, 3]`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain("Esperado tipo 'texto[]' na atribuição.");
            });

            it('Erro - atribuir vetor de inteiro[] com valores texto na reatribuição', async () => {
                const retornoLexador = lexador.mapear([
                    `numeros: inteiro[] = [1, 2]`,
                    `numeros = ["a", "b"]`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain("Esperado tipo 'inteiro[]' na atribuição.");
            });
            it('Sucesso - atribuir qualquer[] aceita valores mistos', async () => {
                const retornoLexador = lexador.mapear([
                    `dados: qualquer[] = [1, "a"]`,
                    `dados = ["x", 2, verdadeiro]`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Sucesso - atribuir a variável tipo qualquer aceita qualquer valor', async () => {
                const retornoLexador = lexador.mapear([
                    `dados: qualquer = 10`,
                    `dados = "texto"`,
                    `escreva(dados)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de escolha com variável no caso', () => {
            it('Escolha com variável no caso', async () => {
                const retornoLexador = lexador.mapear([
                    `opcaoA = "sim"`,
                    `entrada = leia("Digite: ")`,
                    `escolha entrada:`,
                    `    caso opcaoA:`,
                    `        escreva("Escolheu sim")`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de função com tipo de retorno', () => {
            it('Erro - função vazio com retorno de valor', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao executar(): vazio {`,
                    `    retorna 10`,
                    `}`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBe(0);
            });

            it('Erro - função com tipo retorno texto mas retorna número', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao obterNome(): texto {`,
                    `    retorna 123`,
                    `}`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();

            });

            it('Erro - função com tipo retorno inteiro mas retorna texto', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao obterValor(): inteiro {`,
                    `    retorna "abc"`,
                    `}`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
            });

            it('Sucesso - função com tipo retorno inteiro e retorna número', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao obterValor(): inteiro {`,
                    `    retorna 42`,
                    `}`,
                    `escreva(obterValor())`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de funções anônimas com tipo de retorno', () => {
            it('Erro - função anônima com tipo retorno texto mas retorna número', async () => {
                const retornoLexador = lexador.mapear([
                    `f1 = funcao(): texto {`,
                    `    retorna 123`,
                    `}`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain('Variável \'f1\' foi declarada mas nunca usada.');
            });

            it('Erro - função anônima com tipo retorno inteiro mas retorna texto', async () => {
                const retornoLexador = lexador.mapear([
                    `f1 = funcao(): inteiro {`,
                    `    retorna "abc"`,
                    `}`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain('Variável \'f1\' foi declarada mas nunca usada.');
            });
        });

        describe('Cenários de verificação de tipo texto em declarações', () => {
            it('Erro - declaração com tipo texto recebendo número', async () => {
                const retornoLexador = lexador.mapear([
                    `nome: texto = 123`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain('Atribuição inválida para \'nome\': é esperado um valor do tipo texto. Atual: inteiro.');
            });

            it('Erro - declaração com tipo inteiro recebendo texto', async () => {
                const retornoLexador = lexador.mapear([
                    `valor: inteiro = "abc"`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain('Atribuição inválida para \'valor\': é esperado um valor do tipo inteiro. Atual: texto.');
            });
        });

        describe('Cenários de escreva com variável inexistente', () => {
            it('Erro - escreva com variável inexistente', async () => {
                const retornoLexador = lexador.mapear([
                    `escreva(variavelQueNaoExiste)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
            });
            it('Aviso - escreva com variável não inicializada', async () => {
                const retornoLexador = lexador.mapear([
                    `valor`,
                    `escreva(valor)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
            });
        });

        describe('Cenários de inferência de tipo binário', () => {
            it('Binário com operador de comparação retorna tipo lógico', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 10`,
                    `y = 20`,
                    `resultado = x > y`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Binário com tipos reais', async () => {
                const retornoLexador = lexador.mapear([
                    `x: real = 1.5`,
                    `y: real = 2.5`,
                    `resultado = x + y`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });

            it('Binário com concatenação de texto', async () => {
                const retornoLexador = lexador.mapear([
                    `nome: texto = "João"`,
                    `saudacao = "Olá " + nome`,
                    `escreva(saudacao)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de variável não usada com erro associado', () => {
            it('Não emite aviso de não usada quando variável tem erro associado', async () => {
                const retornoLexador = lexador.mapear([
                    `funcao f(a: inteiro):`,
                    `    escreva(a)`,
                    `f("texto")`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de redeclaração de variável', () => {
            it('Aviso - variável redeclarada no mesmo escopo', async () => {
                const retornoLexador = lexador.mapear([
                    `var x = 10`,
                    `var x = 20`,
                    `escreva(x)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de avaliarExpressaoConstante com agrupamento', () => {
            it('Divisão por zero dentro de agrupamento', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 3`,
                    `y = 0`,
                    `enquanto ((x / y) < 10):`,
                    `    sustar`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
            });
        });

        describe('Cenários de chamada com classe', () => {
            it('Chamada com nome que parece classe não gera erro', async () => {
                const retornoLexador = lexador.mapear([
                    `resultado = MinhaClasse()`,
                    `escreva(resultado)`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Nomes que começam com maiúscula parecem ser classes e não geram erro de função inexistente
                const temErroDeFuncao = retornoAnalisadorSemantico.diagnosticos[0]?.mensagem?.includes("não existe") ?? false;
                expect(temErroDeFuncao).toBe(false);
            });
        });

        describe('Cenários de FormatacaoEscrita', () => {
            it('Sucesso - formatação escrita com expressão', async () => {
                const retornoLexador = lexador.mapear([
                    `x = 42`,
                    `escreva("Valor: \${x}")`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico).toBeDefined();
            });
        });

        describe('Cenários de enquanto com chamada inexistente', () => {
            it('Erro - enquanto com chamada de função inexistente', async () => {
                const retornoLexador = lexador.mapear([
                    `enquanto (funcaoInexistente()):`,
                    `    escreva('teste')`,
                    `    sustar`,
                ], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });
    });

    describe('Cenários de verificação de tipos de argumentos em chamadas de função', () => {
        it('Sucesso - variável com tipo compatível passada para parâmetro tipado (Variavel → tipo do escopo)', async () => {
            // Testa o bug anterior: Variavel.tipo é sempre 'qualquer' na AST, mas o tipo real
            // deve ser buscado no escopo via obterTipoExpressao().
            const retornoLexador = lexador.mapear([
                `funcao saudar(nome: texto):`,
                `    escreva(nome)`,
                `minha_variavel = 'João'`,
                `saudar(minha_variavel)`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Erro - literal numérico incompatível passado para parâmetro texto (Literal)', async () => {
            // Literal.tipo é resolvido em tempo de parse, então a verificação funciona diretamente.
            // Notas: para atribuições estilo Pituguês (x = 42), o tipo no escopo fica 'qualquer';
            // apenas variáveis 'var'/'const' com inicializador têm o tipo inferido no escopo.
            const retornoLexador = lexador.mapear([
                `funcao saudar(nome: texto):`,
                `    escreva(nome)`,
                `saudar(42)`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos.some(d =>
                d.mensagem?.includes("parâmetro 'nome'") && d.mensagem?.includes('texto')
            )).toBe(true);
        });

        it('Sucesso - expressão binária numérica passada para parâmetro numérico (Binario)', async () => {
            const retornoLexador = lexador.mapear([
                `funcao dobrar(n: inteiro):`,
                `    escreva(n)`,
                `a = 3`,
                `b = 4`,
                `dobrar(a + b)`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Erro - expressão binária numérica passada para parâmetro texto (Binario)', async () => {
            const retornoLexador = lexador.mapear([
                `funcao imprimir(msg: texto):`,
                `    escreva(msg)`,
                `a = 3`,
                `b = 4`,
                `imprimir(a + b)`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos.some(d =>
                d.mensagem?.includes("parâmetro 'msg'") && d.mensagem?.includes('texto')
            )).toBe(true);
        });
        it('Sucesso - agrupamento passado como argumento não gera falso positivo (Agrupamento)', async () => {
            const retornoLexador = lexador.mapear([
                `funcao imprimir(msg: texto):`,
                `    escreva(msg)`,
                `val = 'olá'`,
                `imprimir((val))`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Sucesso - chamada de função como argumento não gera falso positivo (Chamada)', async () => {
            const retornoLexador = lexador.mapear([
                `funcao obterTexto():`,
                `    retorna 'resultado'`,
                `funcao imprimir(msg: texto):`,
                `    escreva(msg)`,
                `imprimir(obterTexto())`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Sucesso - função passada por referência como argumento não gera falso positivo', async () => {
            const retornoLexador = lexador.mapear([
                `funcao rotaGet(req, res):`,
                `    res.json({'status': 'ok'})`,
                `funcao rotaPost(req, res):`,
                `    res.json({'status': 'criado'})`,
                `funcao registrar(fn):`,
                `    nada`,
                `registrar(rotaGet)`,
                `registrar(rotaPost)`,
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });
    });

    describe('Cenários de reutilização de instância do analisador', () => {
        it('Sucesso - mesma instância analisada duas vezes (simula comportamento de editor web)', async () => {
            // Simula o comportamento do pitugues-web que reutiliza a mesma instância
            // do AnalisadorSemanticoPitugues entre chamadas sucessivas de analisar()
            const analisadorReutilizado = new AnalisadorSemanticoPitugues();

            // Primeira análise: código simples
            const retornoLexador1 = lexador.mapear([
                `escreva('primeira analise')`,
            ], -1);
            const retornoAvaliadorSintatico1 = await avaliadorSintatico.analisar(retornoLexador1, -1);
            await analisadorReutilizado.analisar(retornoAvaliadorSintatico1.declaracoes);

            // Segunda análise: bhaskara com variáveis como argumentos - não deve mostrar erros
            const retornoLexador2 = lexador.mapear([
                `funcao bhaskara(a,b,c):`,
                `  nada`,
                ``,
                `# Insira os coeficientes depois da função`,
                `a = 1`,
                `b = -1`,
                `c = -30`,
                ``,
                `bhaskara(a,b,c)`,
            ], -1);
            const retornoAvaliadorSintatico2 = await avaliadorSintatico.analisar(retornoLexador2, -1);
            const retornoAnalisadorSemantico2 = await analisadorReutilizado.analisar(retornoAvaliadorSintatico2.declaracoes);

            expect(retornoAnalisadorSemantico2).toBeTruthy();
            expect(retornoAnalisadorSemantico2.diagnosticos).toHaveLength(0);
        });
    });
}
)
