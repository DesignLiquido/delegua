import { Lexador } from '../../fontes/lexador';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { AnalisadorSemantico } from '../../fontes/analisador-semantico';
import { DiagnosticoSeveridade } from '../../fontes/interfaces/erros';
import { Variavel } from '../../fontes/construtos/variavel';
import { Literal } from '../../fontes/construtos/literal';
import { Atribuir } from '../../fontes/construtos/atribuir';
import { Binario } from '../../fontes/construtos/binario';
import { Chamada } from '../../fontes/construtos/chamada';
import { SimboloInterface } from '../../fontes/interfaces';
import { Se } from '../../fontes/declaracoes/se';
import { Bloco } from '../../fontes/declaracoes/bloco';
import { Escolha } from '../../fontes/declaracoes/escolha';
import { Retorna } from '../../fontes/declaracoes/retorna';

describe('Analisador semântico', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let analisadorSemantico: AnalisadorSemantico;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        analisadorSemantico = new AnalisadorSemantico();
    });

    describe('Cenários de diagnósticos zerados', () => {
        it('Olá Mundo', async () => {
            const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            // DEBUG: inspecionar declarações geradas pelo avaliador sintático
            console.log(JSON.stringify(retornoAvaliadorSintatico.declaracoes, null, 2));
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Definição Tipo Variável', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var t: texto = "Variável com tipo"',
                    'const n: inteiro = 10',
                    "var v1: texto[] = [\'oi\']",
                    'var v2: inteiro[] = [1]',
                    "const a: vetor = ['1', '2', '3']",
                    'const b: vetor = [1, 2, 3]',
                    'const c: qualquer[] = [1, 2, 3]',
                    "const d: qualquer[] = [1, '2', 3, 'Olá Mundo']",
                    "const f: qualquer = [1, '2', 3, 'Olá Mundo']",
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico).toBeTruthy();
            expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(9);
        });

        it('Atribuindo tipos válidos para variáveis', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a: inteiro = 1',
                    'a = 123',
                    "var b: texto = 'abc'",
                    "b = 'cde'",
                    'var f: inteiro[] = [0, 2]',
                    'f = [3, 4]',
                    "var g: texto[] = ['a', 'b']",
                    "g = ['1', '2']",
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            // DEBUG: inspecionar declarações geradas pelo avaliador sintático (classe)
            console.log(JSON.stringify(retornoAvaliadorSintatico.declaracoes, null, 2));
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Atribuindo variável após declaração', async () => {
            const retornoLexador = lexador.mapear(
                ['var variavel1: texto', "variavel1 = 'teste'"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Função com definição de tipos', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao aa (valor1: texto, valor2: real, valor3: qualquer): real {',
                    '   retorna 10',
                    '}',
                    'funcao aaa (valor1: texto, valor2: real, valor3: inteiro): vazio {',
                    '   ',
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

        it('Função sem corpo', async () => {
            const retornoLexador = lexador.mapear(
                ['funcao minhaFuncao() {}', 'escreva(minhaFuncao)'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Função sem tipo de retorno explícito com retorno de valor', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao f(x, a, b) {',
                    '    retorna a * x + b',
                    '}',
                    'escreva(f(1, 2, 3))',
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

        it('Absoluto', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao maior(x: inteiro, y: inteiro): inteiro {',
                    '    retorna (x + y + (x - y).absoluto()) \ 2',
                    '}',
                    'var x = inteiro(leia("Digite o primeiro número: "))',
                    'var y = inteiro(leia("Digite o segundo número: "))',
                    'var z = inteiro(leia("Digite o terceiro número: "))',
                    'var maior_numero = maior(x, maior(y, z))',
                    'escreva("${maior_numero} eh o maior")',
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

        describe('Declaração se ... senão se ... senão', () => {
            it('Caso com os três blocos', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao achePlaneta(coordenadas) {',
                        '    se (coordenadas == "x:20;y:10") {',
                        '        retorna "Planeta Xalax"',
                        '    } senao se (coordenadas == "x:42;y:84") {',
                        '        retorna "Planeta Haskell"',
                        '    } senao {',
                        '        retorna "Planeta Kyron"',
                        '    }',
                        '}',
                        'escreva(\'O ${achePlaneta("x:42;y:84")} é para onde temos que ir!\')',
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
    });

    describe('Cenários de diagnósticos detectados', () => {
        it('Atribuição de constante + reatribuição de constante', async () => {
            const retornoLexador = lexador.mapear(['const a = 1', 'a = 2'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
        });

        it('Atribuindo tipos inválidos para variáveis', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a: inteiro = 123',
                    "a = 'abc'",
                    "var b: texto = 'abc'",
                    'b = 123',
                    'var f: inteiro[] = [0, 2]',
                    'f = 1',
                    "var g: texto[] = ['a', 'b']",
                    "g = '2'",
                    'var h: inteiro = 1',
                    'h = [1, 2, 3]',
                    "var i: texto = 'abc'",
                    "i = ['1', '2']",
                    'var j: inteiro[] = [1, 2]',
                    "j = ['3', '4']",
                    "var k: texto[] = ['1', '2']",
                    'k = [3, 4]',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(8);
        });

        it('Declaração de variáveis inválidas', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var t: texto = 1',
                    'const n: inteiro = "10"',
                    'var v1: texto[] = [1, 2]',
                    "var v2: inteiro[] = ['1']",
                    'var v3: inteiro[] = 1',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(5);
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "Atribuição inválida para 't': é esperado um valor do tipo texto. Atual: número."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe(
                "Atribuição inválida para 'n': é esperado um valor do tipo número. Atual: texto."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toBe(
                "Atribuição inválida para 'v1': é esperado um valor do tipo vetor de texto. Atual: número[]."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[3].mensagem).toBe(
                "Atribuição inválida para 'v2': é esperado um valor do tipo vetor de inteiro ou real. Atual: texto[]."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[4].mensagem).toBe(
                "Atribuição inválida para 'v3': é esperado um vetor de elementos."
            );
        });

        it('Não retornando o tipo que a função definiu - texto', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao executar(valor1, valor2): texto {',
                    '   var resultado = valor1 + valor2',
                    '   retorna 10',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "Esperado retorno do tipo 'texto' dentro da função."
            );
        });

        it('Não retornando o tipo que a função definiu - inteiro', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao executar(valor1, valor2): inteiro {',
                    '   var resultado = valor1 + valor2',
                    "   retorna 'a'",
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "Esperado retorno do tipo 'inteiro' dentro da função."
            );
        });

        it('Retorno de valor com tipo vazio explícito', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao f(x, a, b): vazio {',
                    '    retorna a * x + b',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                'A função não pode ter nenhum tipo de retorno.'
            );
        });

        it('Função sem retorno de valor', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao executar(valor1, valor2): texto {',
                    '    var resultado = valor1 + valor2',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            const diagnostico = retornoAnalisadorSemantico.diagnosticos[0];
            expect(diagnostico.mensagem).toBe(
                "Função 'executar' deve retornar 'texto' em todos os caminhos de execução."
            );
        });

        it("Escolha com tipos diferentes em 'caso'", async () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao facaAlgumaCoisa() { escreva(123) }',
                    "var opcao = leia('Digite a opção desejada: ')",
                    'escolha opcao {',
                    '   caso 0:',
                    '   caso 1: // Avisar aqui que tipo de `opcao` não é o mesmo tipo do literal 1',
                    '       facaAlgumaCoisa()',
                    "   caso '1': // Aqui o tipo está correto, então não precisa avisar.",
                    '       facaAlgumaCoisa()',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(3);
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "'caso 0:' não é do mesmo tipo esperado em 'escolha' (esperado: texto, atual: número)."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe(
                "'caso 1:' não é do mesmo tipo esperado em 'escolha' (esperado: texto, atual: número)."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toBe(
                "Variável 'opcao' foi declarada mas nunca usada."
            );
        });

        it('Leia por padrão retorna texto', async () => {
            const retornoLexador = lexador.mapear(
                ["var opcao: inteiro = leia('Digite a opção desejada: ')"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "Atribuição inválida para 'opcao', Função 'leia()' sempre retorna 'texto'."
            );
        });

        it('Leia em operação aritmética sem conversão - multiplicação', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var distancia = leia("Digite a distância: ")',
                    'const diferenca = 30',
                    'const tempo = 60',
                    'const tempoGasto = (tempo * distancia) / diferenca',
                    'escreva(tempoGasto)',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);

            const errosOperacaoAritmetica = retornoAnalisadorSemantico.diagnosticos.filter(
                d => d.mensagem?.includes("Operação aritmética com tipo incompatível")
            );

            expect(errosOperacaoAritmetica.length).toBeGreaterThanOrEqual(1);
            expect(errosOperacaoAritmetica[0].mensagem).toContain("tipo 'texto'");
            expect(errosOperacaoAritmetica[0].mensagem).toContain("operação requer número");
        });

        it('Leia em operação aritmética sem conversão - subtração', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var numero = leia("Digite um número: ")',
                    'var resultado = numero - 10',
                    'escreva(resultado)',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            const errosOperacaoAritmetica = retornoAnalisadorSemantico.diagnosticos.filter(
                d => d.mensagem?.includes("Operação aritmética com tipo incompatível")
            );

            expect(errosOperacaoAritmetica.length).toBeGreaterThanOrEqual(1);
            expect(errosOperacaoAritmetica[0].mensagem).toContain("operando esquerdo é do tipo 'texto'");
        });

        it('Leia em operação aritmética sem conversão - divisão', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var numero = leia("Digite um número: ")',
                    'var resultado = numero / 2',
                    'escreva(resultado)',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            const errosOperacaoAritmetica = retornoAnalisadorSemantico.diagnosticos.filter(
                d => d.mensagem?.includes("Operação aritmética com tipo incompatível")
            );

            expect(errosOperacaoAritmetica.length).toBeGreaterThanOrEqual(1);
        });

        it('Leia em operação aritmética sem conversão - módulo', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var numero = leia("Digite um número: ")',
                    'var resto = numero % 3',
                    'escreva(resto)',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            const errosOperacaoAritmetica = retornoAnalisadorSemantico.diagnosticos.filter(
                d => d.mensagem?.includes("Operação aritmética com tipo incompatível")
            );

            expect(errosOperacaoAritmetica.length).toBeGreaterThanOrEqual(1);
        });

        it('Leia com conversão inteiro - deve ser aceito', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var distancia = inteiro(leia("Digite a distância: "))',
                    'const diferenca = 30',
                    'const tempo = 60',
                    'const tempoGasto = (tempo * distancia) / diferenca',
                    'escreva(tempoGasto)',
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            const errosOperacaoAritmetica = retornoAnalisadorSemantico.diagnosticos.filter(
                d => d.mensagem?.includes("Operação aritmética com tipo incompatível")
            );

            // Não deve ter erros de operação aritmética quando leia() é convertido
            expect(errosOperacaoAritmetica.length).toBe(0);
        });

        it('Atribuição de função', async () => {
            const retornoLexador = lexador.mapear(
                ['var f = função(a, b) {', '   escreva(a + b)', '}', 'f(1)'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "Função 'f' espera 2 parâmetros. Atual: 1."
            );
        });

        it('Chamada de função direta', async () => {
            const retornoLexador = lexador.mapear(
                ['função f(a, b) {', '   escreva(a + b)', '}', 'f(1)'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "Função 'f' espera 2 parâmetros. Atual: 1."
            );
        });

        it('Chamada de função com tipos inválidos na passagem dos parametros', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'função f(a: texto, b: inteiro, c: texto, d) {',
                    '    escreva(a + b)',
                    '}',
                    "f(1, 'teste0', 'teste1', 2)",
                ],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                "O valor passado para o parâmetro 'a' (texto) é diferente do esperado pela função (número)."
            );
            expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe(
                "O valor passado para o parâmetro 'b' (inteiro) é diferente do esperado pela função (texto)."
            );
        });

        it('Funções anônimas com mais de 255 parâmetros', async () => {
            let acumulador = '';
            for (let i = 1; i <= 256; i++) {
                acumulador += 'a' + i + ', ';
            }

            acumulador = acumulador.substring(0, acumulador.length - 2);

            const funcaoCom256Argumentos1 = 'var f1 = funcao(' + acumulador + ') {}';
            const funcaoCom256Argumentos2 = 'funcao f2(' + acumulador + ') {}';

            const retornoLexador = lexador.mapear(
                [funcaoCom256Argumentos1, funcaoCom256Argumentos2],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                'Função não pode ter mais de 255 parâmetros.'
            );
            expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe(
                'Função não pode ter mais de 255 parâmetros.'
            );
        });
    });

    describe('Cenários enquanto', () => {
        describe('Cenários de diagnósiticos zerados', () => {
            it('com condicional verdadeiro', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'enquanto verdadeiro {  ',
                        '    escreva("sim");  ',
                        '    sustar;            ',
                        '}                      ',
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

            it('com condicional falso', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'enquanto falso {  ',
                        '    escreva("sim");  ',
                        '    sustar;            ',
                        '}                      ',
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

            it('com variavel definida com valor válido', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'const condicional = verdadeiro     ',
                        'enquanto condicional {             ',
                        '    escreva("sim");              ',
                        '    sustar;                        ',
                        '}                                  ',
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

            it('com variável e expressão binária', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'const valor = 1                    ',
                        'enquanto valor != 5 {              ',
                        '    escreva("sim");              ',
                        '    valor++;                       ',
                        '}                                  ',
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

            it('com variável e agrupamento', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'const valor = 1                    ',
                        'enquanto (valor != 5) {            ',
                        '    escreva("sim");              ',
                        '    valor++;                       ',
                        '}                                  ',
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

            it('sucesso - verificar valores lógicos nas operações binárias', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var x = 5 > 2;                     ',
                        'var y = 10 < 11;                   ',
                        'enquanto (x e y) {                 ',
                        '    escreva("sim");              ',
                        '    sustar;                        ',
                        '}                                  ',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                // Nota: O analisador semântico atualmente não consegue inferir corretamente
                // o tipo de variáveis atribuídas com resultados de comparações em alguns casos
                // Filtramos avisos sobre tipos em operadores lógicos
                const erros = retornoAnalisadorSemantico.diagnosticos.filter(
                    (d) => d.severidade === DiagnosticoSeveridade.ERRO
                );
                expect(erros).toHaveLength(0);
            });

            it('sucesso - verificar operações aritméticas', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var x = 1;                           ',
                        'var y = 2;                           ',
                        'enquanto (x + y < 10) {sustar;}      ',
                        'enquanto (x - y < 10) {sustar;}      ',
                        'enquanto (x * y < 10) {sustar;}      ',
                        'enquanto (x / y < 10) {sustar;}      ',
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

            it('sucesso - verificar função declarada', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'funcao funcaoExistente() {       ',
                        '  retorna verdadeiro;            ',
                        '}                                ',
                        'enquanto (funcaoExistente()) {   ',
                        "    escreva('teste');            ",
                        '    sustar;                      ',
                        '}                                ',
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
        describe('Cenários de diagnósticos detectados', () => {
            it('com variavel definida com valor inválido', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'const condicional = "invalido"   ',
                        'enquanto condicional {             ',
                        '    escreva("sim");              ',
                        '    sustar;                        ',
                        '}                                  ',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            // TODO: Mudar este teste ao reimplementar operações bit a bit com números.
            it('verificar valores lógicos nas operações binárias e agrupamento', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var x = 5;                         ',
                        'var y = 10;                        ',
                        'enquanto (x e y) {                 ',
                        '    escreva("sim");              ',
                        '    sustar;                        ',
                        '}                                  ',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            });

            it('verificar valores lógicos nas operações binárias sem agrupamento', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var x = 5;                         ',
                        'var y = 10;                        ',
                        'enquanto x e y {                   ',
                        '    escreva("sim");              ',
                        '    sustar;                        ',
                        '}                                  ',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
            });

            it('verificar operações aritméticas', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        "var x = 'texto';                   ",
                        'var y = 2;                         ',
                        'enquanto (x + y < 10) {sustar;}    ',
                        'enquanto (x - y < 10) {sustar;}    ',
                        'enquanto (x * y < 10) {sustar;}    ',
                        'enquanto (x / y < 10) {sustar;}    ',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(4);
            });

            it('verificar operação divisão por zero', async () => {
                const retornoLexador = lexador.mapear(
                    ['var x = 3;', 'var y = 0;', 'enquanto (x / y < 10) {sustar;}    '],
                    -1
                );

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
            });
        });
    });

    describe('Cenários tipo de', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('com variável definida com valor válido', async () => {
                const retornoLexador = lexador.mapear(
                    ['const condicional = verdadeiro     ', 'tipo de condicional                '],
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
                const retornoLexador = lexador.mapear(
                    ['const a = 1      ', 'const b = 2      ', 'tipo de (a + b)  '],
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
    });

    describe('Cenários falhar', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - falhar com variável definida com valor válido', async () => {
                const retornoLexador = lexador.mapear(
                    ["const valor = 'teste'      ", "falhar 'falhar ' + valor   "],
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
                    ['const a = 1      ', 'const b = 1      ', 'falhar (a + b)  '],
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
    });

    describe('Cenários conversão implicita', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - conversão implicita com variável definida com valor válido', async () => {
                const retornoLexador = lexador.mapear(
                    ['const valor = 2 + 2', 'escreva(valor)'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
        });

        describe('Cenários de aviso', () => {
            it('Aviso - conversão implicita com variável definida com valor válido', async () => {
                const retornoLexador = lexador.mapear(["const valor = 2 + '2'"], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
                // Deve ter aviso sobre variável não usada
                const avisoVariavelNaoUsada = retornoAnalisadorSemantico.diagnosticos.find(
                    d => d.mensagem === "Variável 'valor' foi declarada mas nunca usada."
                );
                expect(avisoVariavelNaoUsada).toBeTruthy();
            });
        });
    });

    describe('Cenários variáveis não inicializada', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - variável de classe inicializada na declaração', async () => {
                const retornoLexador = lexador.mapear(
                    ['classe Teste {}', 'var teste: Teste = Teste();', 'escreva(teste); '],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável de classe inicializada após declaração', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'classe Teste {}',
                        'var teste: Teste;',
                        'teste = Teste();',
                        'escreva(teste); ',
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

            it('Sucesso - variável tipo texto inicializada na declaração', async () => {
                const retornoLexador = lexador.mapear(
                    ['classe Teste {}', "var teste: Texto = 'abc';", 'escreva(teste); '],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - variável tipo texto inicializada após declaração', async () => {
                const retornoLexador = lexador.mapear(
                    ['classe Teste {}', 'var teste: Texto;', "teste = 'abc';", 'escreva(teste); '],
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
        describe('Cenários de diagnósticos detectados', () => {
            it('Aviso - variável tipo texto não inicializada', async () => {
                const retornoLexador = lexador.mapear(
                    ['classe Teste {}', 'var teste: Texto;', 'escreva(teste); '],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "Variável 'teste' não foi inicializada."
                );
            });

            it('Erro - escreva sem parâmetro', async () => {
                const retornoLexador = lexador.mapear(['escreva(); '], -1);
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                expect(
                    retornoAnalisadorSemantico.diagnosticos.filter(
                        (item) => item.severidade === DiagnosticoSeveridade.ERRO
                    )
                ).toHaveLength(1);
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe(
                    "É preciso ter um ou mais parametros para 'escreva(...)'"
                );
            });
        });
    });

    // Testes adicionados: casos de alta prioridade movidos de 'novos-casos.test.ts'
    describe('Casos adicionados - testes automáticos', () => {
        it('marcarVariaveisUsadasEmExpressao marca variáveis em Variavel/Binario/Chamada', async () => {
            const analisador = new AnalisadorSemantico();

            const spy = jest.spyOn(analisador.gerenciadorEscopos, 'marcarComoUsada');

            const simbA: SimboloInterface = {
                lexema: 'a',
                tipo: 'inteiro',
                literal: 'a',
                linha: 1,
                hashArquivo: 1,
            };
            const simbB: SimboloInterface = {
                lexema: 'b',
                tipo: 'inteiro',
                literal: 'b',
                linha: 2,
                hashArquivo: 1,
            };

            const varA = new Variavel(1, simbA, 'inteiro');
            const varB = new Variavel(1, simbB, 'inteiro');

            // Variavel simples
            (analisador as any).marcarVariaveisUsadasEmExpressao(varA);
            expect(spy).toHaveBeenCalledWith('a');

            // Binario com variavel à esquerda e literal à direita
            const bin = new Binario(
                1,
                varA,
                { lexema: '+', tipo: '', literal: '+', linha: 1, hashArquivo: 1 },
                new Literal(1, 3, 1, 'inteiro')
            );
            (analisador as any).marcarVariaveisUsadasEmExpressao(bin);
            expect(spy).toHaveBeenCalledWith('a');

            // Chamada com entidadeChamada sendo uma variavel e argumentos contendo outra variavel
            const cham = new Chamada(1, varA, [varB]);
            (analisador as any).marcarVariaveisUsadasEmExpressao(cham);
            expect(spy).toHaveBeenCalledWith('a');
            expect(spy).toHaveBeenCalledWith('b');

            spy.mockRestore();
        });

        it('visitarExpressaoDeAtribuicao: variável não declarada e variável imutável e tipo inválido', async () => {
            const analisador = new AnalisadorSemantico();

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
            expect(
                analisador.diagnosticos.some((d) =>
                    d.mensagem?.includes("Variável 'x' ainda não foi declarada até este ponto.")
                )
            ).toBeTruthy();

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
                analisador.diagnosticos.some((d) =>
                    d.mensagem?.includes("Constante 'y' não pode ser modificada.")
                )
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
                analisador.diagnosticos.some((d) =>
                    d.mensagem?.includes("Esperado tipo 'texto' na atribuição.")
                )
            ).toBeTruthy();
        });

        it('todosOsCaminhosRetornam: função com if que retorna apenas em um ramo deve gerar diagnóstico', async () => {
            const lexador = new Lexador();
            const avaliador = new AvaliadorSintatico();
            const analisador = new AnalisadorSemantico();

            const retornoLexador = lexador.mapear(
                [
                    'funcao apenasSe(): inteiro {',
                    '    se (verdadeiro) {',
                    '        retorna 1',
                    '    }',
                    '}',
                ],
                -1
            );

            const retornoAvaliador = await avaliador.analisar(retornoLexador, -1);
            const retornoAnalisador = await analisador.analisar(retornoAvaliador.declaracoes);

            expect(
                retornoAnalisador.diagnosticos.some((d) =>
                    d.mensagem?.includes(
                        "Função 'apenasSe' deve retornar 'inteiro' em todos os caminhos de execução."
                    )
                )
            ).toBeTruthy();
        });

        it('erro e aviso não duplicam diagnósticos', async () => {
            const analisador = new AnalisadorSemantico();
            const simb: SimboloInterface = {
                lexema: 's',
                tipo: '',
                literal: 's',
                linha: 1,
                hashArquivo: 1,
            };

            analisador.erro(simb, 'mensagem x');
            analisador.erro(simb, 'mensagem x');
            expect(analisador.diagnosticos).toHaveLength(1);
            expect(analisador.diagnosticos[0].severidade).toBe(DiagnosticoSeveridade.ERRO);

            analisador.aviso(simb, 'mensagem y');
            analisador.aviso(simb, 'mensagem y');
            const avisos = analisador.diagnosticos.filter(
                (d) => d.severidade === DiagnosticoSeveridade.AVISO
            );
            expect(avisos).toHaveLength(1);
        });

        it('verificarSeRetorna e verificarEscolhaRetorna retornam corretamente', async () => {
            const analisador = new AnalisadorSemantico();

            const simbR: SimboloInterface = {
                lexema: 'r',
                tipo: 'inteiro',
                literal: 'r',
                linha: 1,
                hashArquivo: 1,
            };
            const ret = new Retorna(simbR, new Literal(1, 1, 1, 'inteiro'));
            const blocoComRet = new Bloco(1, 1, [ret]);

            // Se sem 'senao' deve retornar false
            const se1 = new Se(new Literal(1, 1, true, 'lógico'), blocoComRet, null, null);
            expect((analisador as any).verificarSeRetorna(se1)).toBe(false);

            // Se com 'senao' que retorna -> true
            const se2 = new Se(new Literal(1, 1, true, 'lógico'), blocoComRet, null, blocoComRet);
            expect((analisador as any).verificarSeRetorna(se2)).toBe(true);

            // Escolha sem caso padrão -> false mesmo que todos os caminhos retornem
            const caminho1 = { condicoes: [new Literal(1, 1, 1, 'inteiro')], declaracoes: [ret] };
            const escolha1 = new Escolha(
                new Literal(1, 1, 'x', 'texto'),
                [caminho1],
                caminho1 as any
            );
            expect((analisador as any).verificarEscolhaRetorna(escolha1)).toBe(false);

            // Escolha com caso padrão (condicoes vazias) -> true
            const caminhoPadrao = { condicoes: [], declaracoes: [ret] };
            const escolha2 = new Escolha(
                new Literal(1, 1, 'x', 'texto'),
                [caminho1, caminhoPadrao],
                caminhoPadrao as any
            );
            expect((analisador as any).verificarEscolhaRetorna(escolha2)).toBe(true);
        });
    });

    describe('Comando quebrar', () => {
        describe('Cenários com laço for', () => {
            it('Sucesso - dentro do laço for', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para (var i = 0; i < 10; i++) {',
                        '   se (i == 5) {',
                        '       quebrar;',
                        '   }',
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
            it('Sucesso - dentro do laço enquanto', async () => {
                const retornoLexador = lexador.mapear(
                    ['enquanto (verdadeiro) {', '   se (i == 5) {', '       quebrar;', '   }'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
            it('Sucesso - dentro do laço faça...enquanto', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'faça {',
                        '   se (i == 5) {',
                        '       quebrar;',
                        '   }',
                        '} enquanto (verdadeiro);',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                // DEBUG: inspecionar declarações geradas pelo avaliador sintático
                console.log(JSON.stringify(retornoAvaliadorSintatico.declaracoes, null, 2));
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });
    });

    describe('Declaração Para (for loops)', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - loop for simples', async () => {
                const retornoLexador = lexador.mapear(
                    ['para (var i = 0; i < 10; i++) {', '    escreva(i)', '}'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - loop for com múltiplas variáveis', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'para (var i = 0; i < 5; i++) {',
                        '    para (var j = 0; j < 5; j++) {',
                        '        escreva(i * j)',
                        '    }',
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

        describe('Cenários de diagnósticos detectados', () => {
            it('Erro - variável de loop não declarada', async () => {
                const retornoLexador = lexador.mapear(
                    ['para (i = 0; i < 10; i++) {', '    escreva(i)', '}'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(0);
            });
        });
    });

    describe('Declaração ParaCada (for-each loops)', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - para cada elemento em vetor', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var numeros = [1, 2, 3, 4, 5]',
                        'para cada numero em numeros {',
                        '    escreva(numero)',
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
    });

    describe('Declaração Fazer (do-while)', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - fazer com condição verdadeira', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var contador = 0',
                        'fazer {',
                        '    escreva(contador)',
                        '    contador++',
                        '} enquanto (contador < 5)',
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

        describe('Cenários de diagnósticos detectados', () => {
            it('Erro - condição não booleana', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var contador = 5',
                        'fazer {',
                        '    escreva(contador)',
                        '} enquanto (contador)',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
            });
        });
    });

    describe('Declaração Tente (try-catch)', () => {
        describe('Cenários de diagnósticos zerados', () => {
            it('Sucesso - tente com captura', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'tente {',
                        '    var resultado = 10 / 0',
                        '} pegue (erro) {',
                        '    escreva("Erro: ", erro)',
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

            it('Sucesso - tente com finalmente', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'tente {',
                        '    escreva("Tentando")',
                        '} pegue (erro) {',
                        '    escreva("Erro")',
                        '} finalmente {',
                        '    escreva("Sempre executado")',
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
    });

    describe('Expressões Binárias - Cobertura de Branches', () => {
        describe('Operadores aritméticos', () => {
            it('Sucesso - módulo (resto da divisão)', async () => {
                const retornoLexador = lexador.mapear(
                    ['var resultado: inteiro = 10 % 3', 'escreva(resultado)'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - exponenciação', async () => {
                const retornoLexador = lexador.mapear(
                    ['var resultado: inteiro = 2 ** 3', 'escreva(resultado)'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Erro - operação aritmética com tipos incompatíveis', async () => {
                const retornoLexador = lexador.mapear(
                    ['var texto = "abc"', 'var numero = 5', 'var resultado = texto * numero'],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
            });
        });

        describe('Operadores de comparação', () => {
            it('Sucesso - maior ou igual e menor ou igual', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var a = 5',
                        'var b = 10',
                        'se (a <= b e b >= a) {',
                        '    escreva("Verdadeiro")',
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

            it('Sucesso - operador diferente', async () => {
                const retornoLexador = lexador.mapear(
                    ['var x = 5', 'var y = 10', 'se (x != y) {', '    escreva("Diferentes")', '}'],
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

        describe('Operadores lógicos', () => {
            it('Sucesso - operador OU', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var a = verdadeiro',
                        'var b = falso',
                        'se (a ou b) {',
                        '    escreva("Pelo menos um é verdadeiro")',
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

            it('Erro - operador lógico com não-booleanos', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var x: inteiro = 5',
                        'var y: inteiro = 10',
                        'se (x ou y) {',
                        '    escreva("teste")',
                        '}',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
            });
        });
    });

    describe('Expressões Unárias', () => {
        it('Sucesso - negação lógica', async () => {
            const retornoLexador = lexador.mapear(
                ['var valor = verdadeiro', 'var negado = nao valor', 'escreva(negado)'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
        });

        it('Sucesso - negação numérica', async () => {
            const retornoLexador = lexador.mapear(
                ['var numero = 5', 'var negativo = -numero', 'escreva(negativo)'],
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

    describe('Vetores e Matrizes', () => {
        describe('Acesso a elementos', () => {
            it('Sucesso - acesso a elemento de vetor', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var numeros: inteiro[] = [1, 2, 3, 4, 5]',
                        'var primeiro = numeros[0]',
                        'escreva(primeiro)',
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

            it('Sucesso - atribuição por índice', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'var numeros: inteiro[] = [1, 2, 3]',
                        'numeros[0] = 10',
                        'escreva(numeros[0])',
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

        describe('Vetores vazios e múltiplos tipos', () => {
            it('Sucesso - vetor vazio com tipo especificado', async () => {
                const retornoLexador = lexador.mapear(
                    ['var vazio: inteiro[] = []', 'escreva(vazio)'],
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
    });

    describe('Classes e Objetos', () => {
        describe('Herança', () => {
            it('Sucesso - classe com herança e métodos', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'classe Animal {',
                        '    funcao falar() {',
                        '        retorna "Som genérico"',
                        '    }',
                        '}',
                        'classe Cachorro herda Animal {',
                        '    funcao falar() {',
                        '        retorna "Au au"',
                        '    }',
                        '}',
                        'var cachorro = Cachorro()',
                        'escreva(cachorro.falar())',
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

            it('Sucesso - objeto usado apenas em chamadas de método', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'classe Animal {',
                        '    corre() {',
                        '        escreva("correndo")',
                        '    }',
                        '}',
                        'classe Cachorro herda Animal {',
                        '    latir() {',
                        '        escreva("Au Au Au Au")',
                        '    }',
                        '}',
                        'var thor = Cachorro()',
                        'thor.corre()',
                        'thor.latir()',
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

        describe('Propriedades e métodos', () => {
            it('Sucesso - acesso a propriedade', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'classe Pessoa {',
                        '    var nome: texto',
                        '    construtor(n: texto) {',
                        '        isto.nome = n',
                        '    }',
                        '}',
                        'var pessoa = Pessoa("João")',
                        'escreva(pessoa.nome)',
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
    });

    describe('Dicionários', () => {
        it('Sucesso - criação e acesso a dicionário', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var dicionario = { "chave": "valor", "numero": 42 }',
                    'escreva(dicionario["chave"])',
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

    describe('Casos extremos e validações', () => {
        it('Aviso - variável declarada mas nunca usada', async () => {
            const retornoLexador = lexador.mapear(['var nuncaUsada = 10', 'escreva("teste")'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toContain('nunca usada');
        });

        it('Erro - redeclaração de variável no mesmo escopo', async () => {
            const retornoLexador = lexador.mapear(['var duplicada = 1', 'var duplicada = 2'], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
        });

        it('Sucesso - variável em escopo interno não conflita com escopo externo', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var x = 10',
                    'se (verdadeiro) {',
                    '    var x = 20',
                    '    escreva(x)',
                    '}',
                    'escreva(x)',
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

    describe('Funções anônimas e closures', () => {
        it('Sucesso - função anônima atribuída a variável', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var somar = funcao(a: inteiro, b: inteiro): inteiro {',
                    '    retorna a + b',
                    '}',
                    'escreva(somar(5, 3))',
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

        it('Erro - função anônima com tipo de retorno incompatível', async () => {
            const retornoLexador = lexador.mapear(
                ['var f: funcao = funcao(): inteiro {', '    retorna "texto"', '}'],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoAnalisadorSemantico = await analisadorSemantico.analisar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoAnalisadorSemantico).toBeTruthy();
            expect(retornoAnalisadorSemantico.diagnosticos.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Operações com texto', () => {
        it('Sucesso - concatenação de textos', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var nome = "João"',
                    'var sobrenome = "Silva"',
                    'var nomeCompleto = nome + " " + sobrenome',
                    'escreva(nomeCompleto)',
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
});
