import { Lexador } from '../fontes/lexador';
import { AvaliadorSintatico } from '../fontes/avaliador-sintatico';
import { AnalisadorSemantico } from '../fontes/analisador-semantico';
import { DiagnosticoSeveridade } from '../fontes/interfaces/erros';

describe('Analisador semântico', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let analisadorSemantico: AnalisadorSemantico;

    describe('analisar()', () => {
        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
            analisadorSemantico = new AnalisadorSemantico();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const retornoLexador = lexador.mapear(["escreva('Olá mundo')"], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - Definição Tipo Variável', () => {
                const retornoLexador = lexador.mapear([
                    "var t: texto = \"Variável com tipo\"",
                    "const n: inteiro = 10",
                    "var v1: texto[] = [\'oi\']",
                    "var v2: inteiro[] = [1]",
                    "const a: vetor = ['1', '2', '3']",
                    "const b: vetor = [1, 2, 3]",
                    "const c: qualquer[] = [1, 2, 3]",
                    "const d: qualquer[] = [1, '2', 3, 'Olá Mundo']",
                    "const f: qualquer = [1, '2', 3, 'Olá Mundo']",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                expect(retornoAvaliadorSintatico).toBeTruthy();
                expect(retornoAvaliadorSintatico.declaracoes).toHaveLength(9);
            });

            it('Sucesso - Atribuindo tipos válidos para variáveis', () => {
                const retornoLexador = lexador.mapear([
                    "var a: inteiro = 1",
                    "a = 123",
                    "var b: texto = 'abc'",
                    "b = 'cde'",
                    "var f: inteiro[] = [0, 2]",
                    "f = [3, 4]",
                    "var g: texto[] = ['a', 'b']",
                    "g = ['1', '2']"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Atribuindo variável após declaração', () => {
                const retornoLexador = lexador.mapear([
                    "var variavel1: texto",
                    "variavel1 = 'teste'",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });

            it('Sucesso - Função com definição de tipos', () => {
                const retornoLexador = lexador.mapear([
                    // "var a = funcao (valor1: inteiro, valor2: qualquer, valor3: texto): texto {",
                    // "   retorna \"a\"",
                    // "}",
                    "funcao aa (valor1: texto, valor2: real, valor3: qualquer): real {",
                    "   retorna 10",
                    "}",
                    "funcao aaa (valor1: texto, valor2: real, valor3: inteiro): vazio {",
                    "   ",
                    "}"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
            });
        });

        describe('Cenários de falha', () => {
            it('Atribuindo variável que não existe', () => {
                const retornoLexador = lexador.mapear([
                    "b = 1"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuição de constante + reatribuição de constante', () => {
                const retornoLexador = lexador.mapear([
                    "const a = 1",
                    "a = 2"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Atribuindo tipos inválidos para variáveis', () => {
                const retornoLexador = lexador.mapear([
                    "var a: inteiro = 123",
                    "a = 'abc'",
                    "var b: texto = 'abc'",
                    "b = 123",
                    "var f: inteiro[] = [0, 2]",
                    "f = 1",
                    "var g: texto[] = ['a', 'b']",
                    "g = '2'",
                    "var h: inteiro = 1",
                    "h = [1, 2, 3]",
                    "var i: texto = 'abc'",
                    "i = ['1', '2']",
                    "var j: inteiro[] = [1, 2]",
                    "j = ['3', '4']",
                    "var k: texto[] = ['1', '2']",
                    "k = [3, 4]"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(8);
            });

            it('Declaração de variáveis inválidas', () => {
                const retornoLexador = lexador.mapear([
                    "var t: texto = 1",
                    "const n: inteiro = \"10\"",
                    "var v1: texto[] = [1, 2]",
                    "var v2: inteiro[] = ['1']",
                    "var v3: inteiro[] = 1"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Atribuição inválida para \'t\', é esperado um \'texto\'.');
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe('Atribuição inválida para \'n\', é esperado um \'número\'.');
                expect(retornoAnalisadorSemantico.diagnosticos[2].mensagem).toBe('Atribuição inválida para \'v1\', é esperado um vetor de \'texto\'.');
                expect(retornoAnalisadorSemantico.diagnosticos[3].mensagem).toBe('Atribuição inválida para \'v2\', é esperado um vetor de \'inteiros\' ou \'real\'.');
                expect(retornoAnalisadorSemantico.diagnosticos[4].mensagem).toBe('Atribuição inválida para \'v3\', é esperado um vetor de elementos.');
            });

            it('Retorno vazio', () => {
                const retornoLexador = lexador.mapear([
                    "funcao olaMundo (): vazio {",
                    "   retorna \"Olá Mundo!!!\"",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('A função não pode ter nenhum tipo de retorno.');
            });

            it('Não retornando o tipo que a função definiu - texto', () => {
                const retornoLexador = lexador.mapear([
                    "funcao executar(valor1, valor2): texto {",
                    "   var resultado = valor1 + valor2",
                    "   retorna 10",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Esperado retorno do tipo \'texto\' dentro da função.');
            });

            it('Não retornando o tipo que a função definiu - inteiro', () => {
                const retornoLexador = lexador.mapear([
                    "funcao executar(valor1, valor2): inteiro {",
                    "   var resultado = valor1 + valor2",
                    "   retorna 'a'",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Esperado retorno do tipo \'inteiro\' dentro da função.');
            });

            it('Retorno vazio mas com retorno de valor', () => {
                const retornoLexador = lexador.mapear([
                    "funcao executar(valor1, valor2): vazio {",
                    "   var resultado = valor1 + valor2",
                    "   retorna resultado",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('A função não pode ter nenhum tipo de retorno.');
            });

            it('Função sem retorno de valor', () => {
                const retornoLexador = lexador.mapear([
                    "funcao executar(valor1, valor2): texto {",
                    "   var resultado = valor1 + valor2",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Esperado retorno do tipo \'texto\' dentro da função.');
            });

            it('Parametro com definição de tipo inválido', () => {
                const retornoLexador = lexador.mapear([
                    "funcao executar(valor1: algum, valor2): texto {",
                    "   retorna \'Olá Mundo!!!\'",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('O tipo \'algum\' não é válido.');
            });

            it('Declaração de retorno da função inválido.', () => {
                const retornoLexador = lexador.mapear([
                    "funcao executar(valor1: inteiro, valor2): XXX {",
                    "   retorna \'Olá Mundo!!!\'",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Declaração de retorno da função é inválido.');
            });

            it('Escolha com tipos diferentes em \'caso\'', () => {
                const retornoLexador = lexador.mapear([
                    'var opcao = leia(\'Digite a opção desejada: \')',
                    'escolha opcao {',
                    'caso 0:',
                    'caso 1: // Avisar aqui que tipo de `opcao` não é o mesmo tipo do literal 1',
                    'facaAlgumaCoisa()',
                    'caso \'1\': // Aqui o tipo está correto, então não precisa avisar.',
                    'facaAlgumaCoisa()',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('\'caso 0:\' não é do mesmo tipo esperado em \'escolha\'');
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe('\'caso 1:\' não é do mesmo tipo esperado em \'escolha\'');
            });

            it('Leia só pode receber texto', () => {
                const retornoLexador = lexador.mapear([
                    'var opcao: inteiro = leia(\'Digite a opção desejada: \')',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Atribuição inválida para \'opcao\', Leia só pode receber tipo \'texto\'.');
            });

            it('Escreva com variável que não existe', () => {
                const retornoLexador = lexador.mapear([
                    'var t = \'teste\'',
                    'escreva(XXX,\' outro teste\')',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Variável \'XXX\' não existe.');
            });

            it('Atribuição de função', () => {
                const retornoLexador = lexador.mapear([
                    'var f = função(a, b) {',
                    '   escreva(a + b)',
                    '}',
                    'f(1)',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Função \'f\' espera 2 parametros.');
            });

            it('Chamada de função direta', () => {
                const retornoLexador = lexador.mapear([
                    'função f(a, b) {',
                    '   escreva(a + b)',
                    '}',
                    'f(1)',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Função \'f\' espera 2 parametros.');
            });

            it('Chamada de função que não existe', () => {
                const retornoLexador = lexador.mapear([
                    'função f(a, b) {',
                    '   escreva(a + b)',
                    '}',
                    'x()',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Chamada da função \'x\' não existe.');
            });

            it('Chamada de função com tipos inválidos na passagem dos parametros', () => {
                const retornoLexador = lexador.mapear([
                    'função f(a:texto, b:inteiro, c: texto, d) {',
                    '   escreva(a + b)',
                    '}',
                    'f(1, \'teste0\', \'teste1\', 2)',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('O valor passado para o parâmetro \'a\' é diferente do esperado pela função.');
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe('O valor passado para o parâmetro \'b\' é diferente do esperado pela função.');
            });

            it('Função anônima com mais de 255 parâmetros', () => {
                let acumulador = '';
                for (let i = 1; i <= 256; i++) {
                    acumulador += 'a' + i + ', ';
                }

                acumulador = acumulador.substring(0, acumulador.length - 2);

                const funcaoCom256Argumentos1 = 'var f1 = funcao(' + acumulador + ') {}';
                const funcaoCom256Argumentos2 = 'funcao f2(' + acumulador + ') {}';

                const retornoLexador = lexador.mapear([
                    funcaoCom256Argumentos1,
                    funcaoCom256Argumentos2
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('Não pode haver mais de 255 parâmetros');
                expect(retornoAnalisadorSemantico.diagnosticos[1].mensagem).toBe('Não pode haver mais de 255 parâmetros');
            });
        });

        describe('Cenários enquanto', () => {
            describe('Cenários de sucesso', () => {
                it('com condicional verdadeiro', () => {
                    const retornoLexador = lexador.mapear([
                        "enquanto verdadeiro {  ",
                        "    escreva(\"sim\");  ",
                        "    sustar;            ",
                        "}                      ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com condicional falso', () => {
                    const retornoLexador = lexador.mapear([
                        "enquanto falso {  ",
                        "    escreva(\"sim\");  ",
                        "    sustar;            ",
                        "}                      ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com variavel definida com valor válido', () => {
                    const retornoLexador = lexador.mapear([
                        "const condicional = verdadeiro     ",
                        "enquanto condicional {             ",
                        "    escreva(\"sim\");              ",
                        "    sustar;                        ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com variável e expressão binária', () => {
                    const retornoLexador = lexador.mapear([
                        "const valor = 1                    ",
                        "enquanto valor != 5 {              ",
                        "    escreva(\"sim\");              ",
                        "    valor++;                       ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('com variável e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "const valor = 1                    ",
                        "enquanto (valor != 5) {            ",
                        "    escreva(\"sim\");              ",
                        "    valor++;                       ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('sucesso - verificar valores lógicos nas operações binárias', () => {
                    const retornoLexador = lexador.mapear([
                        "var x = 5 > 2;                     ",
                        "var y = 10 < 11;                   ",
                        "enquanto (x e y) {                 ",
                        "    escreva(\"sim\");              ",
                        "    sustar;                        ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('sucesso - verificar operações aritméticas', () => {
                    const retornoLexador = lexador.mapear([
                        "var x = 1;                           ",
                        "var y = 2;                           ",
                        "enquanto (x + y < 10) {sustar;}      ",
                        "enquanto (x - y < 10) {sustar;}      ",
                        "enquanto (x * y < 10) {sustar;}      ",
                        "enquanto (x / y < 10) {sustar;}      ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('sucesso - verificar função declarada', () => {
                    const retornoLexador = lexador.mapear([
                        "funcao funcaoExistente() {       ",
                        "  retorna verdadeiro;            ",
                        "}                                ",
                        "enquanto (funcaoExistente()) {   ",
                        "    escreva('teste');            ",
                        "    sustar;                      ",
                        "}                                ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
            describe('Cenários de falha', () => {
                it('com condicional não declarada', () => {
                    const retornoLexador = lexador.mapear([
                        "enquanto condicional {  ",
                        "    escreva(\"sim\");   ",
                        "    sustar;             ",
                        "}                       ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('com variavel definida com valor inválido', () => {
                    const retornoLexador = lexador.mapear([
                        "const condicional = \"invalido\"   ",
                        "enquanto condicional {             ",
                        "    escreva(\"sim\");              ",
                        "    sustar;                        ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('com variável não declarada e expressão binária', () => {
                    const retornoLexador = lexador.mapear([
                        "enquanto valor != 5 {              ",
                        "    escreva(\"sim\");              ",
                        "    valor++;                       ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('com variável não declarada e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "enquanto (valor != 5) {            ",
                        "    escreva(\"sim\");              ",
                        "    valor++;                       ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('falha - verificar valores lógicos nas operações binárias e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "var x = 5;                         ",
                        "var y = 10;                        ",
                        "enquanto (x e y) {                 ",
                        "    escreva(\"sim\");              ",
                        "    sustar;                        ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });

                it('falha - verificar valores lógicos nas operações binárias sem agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "var x = 5;                         ",
                        "var y = 10;                        ",
                        "enquanto x e y {                   ",
                        "    escreva(\"sim\");              ",
                        "    sustar;                        ",
                        "}                                  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });

                it('falha - verificar operações aritméticas', () => {
                    const retornoLexador = lexador.mapear([
                        "var x = 'texto';                   ",
                        "var y = 2;                         ",
                        "enquanto (x + y < 10) {sustar;}    ",
                        "enquanto (x - y < 10) {sustar;}    ",
                        "enquanto (x * y < 10) {sustar;}    ",
                        "enquanto (x / y < 10) {sustar;}    ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(4);
                });

                it('falha - verificar operação divisão por zero', () => {
                    const retornoLexador = lexador.mapear([
                        "var x = 3;                        ",
                        "var y = 0;                         ",
                        "enquanto (x / y < 10) {sustar;}    ",
                    ], -1);

                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('falha - verificar função não declarada', () => {
                    const retornoLexador = lexador.mapear([
                        "enquanto (funcaoNaoExistente()) {",
                        "   escreva('teste');",
                        "   sustar;",
                        "}",
                        "enquanto funcaoNaoExistente() {",
                        "   escreva('teste');",
                        "   sustar;",
                        "}",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(2);
                });
            });
        });

        describe('Cenários tipo de', () => {
            describe('Cenários de sucesso', () => {
                it('com variável definida com valor válido', () => {
                    const retornoLexador = lexador.mapear([
                        "const condicional = verdadeiro     ",
                        "tipo de condicional                ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('tipo de com variável definida e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "const a = 1      ",
                        "const b = 2      ",
                        "tipo de (a + b)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });

            describe('Cenários de falha', () => {

                it('tipo de com variável não definida', () => {
                    const retornoLexador = lexador.mapear([
                        "tipo de condicional                ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('tipo de com variável não definida e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "tipo de (a)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('tipo de binario com variável não definida e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "const a = 1      ",
                        "tipo de (a + b)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });

        });

        describe('Cenários falhar', () => {
            describe('Cenários de sucesso', () => {
                it('Sucesso - falhar com variável definida com valor válido', () => {
                    const retornoLexador = lexador.mapear([
                        "const valor = 'teste'      ",
                        "falhar 'falhar ' + valor   ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - falhar tipo de binario com variável não definida e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "const a = 1      ",
                        "const b = 1      ",
                        "falhar (a + b)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
            describe('Cenários de falha', () => {
                it('Falhar com variável não definida', () => {
                    const retornoLexador = lexador.mapear([
                        "falhar 'falhar ' + valor   ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });

                it('Falhar tipo de binario com variável não definida e agrupamento', () => {
                    const retornoLexador = lexador.mapear([
                        "const a = 1      ",
                        "falhar (a + b)  ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });
        });

        describe('Cenários conversão implicita', () => {
            describe('Cenários de sucesso', () => {
                it('Sucesso - conversão implicita com variável definida com valor válido', () => {
                    const retornoLexador = lexador.mapear([
                        "const valor = 2 + 2",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
            describe('Cenários de aviso', () => {
                it('Aviso - conversão implicita com variável definida com valor válido', () => {
                    const retornoLexador = lexador.mapear([
                        "const valor = 2 + '2'",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos.filter(item => item.severidade === DiagnosticoSeveridade.AVISO)).toHaveLength(1);
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                });
            });
        });

        describe('Cenários variáveis não inicializada', () => {
            describe('Cenários de sucesso', () => {
                it('Sucesso - variável de classe inicializada na declaração', () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste {}",
                        "var teste: Teste = Teste();",
                        "escreva(teste); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - variável de classe inicializada após declaração', () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste {}",
                        "var teste: Teste;",
                        "teste = Teste();",
                        "escreva(teste); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - variável tipo texto inicializada na declaração', () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste {}",
                        "var teste: Texto = 'abc';",
                        "escreva(teste); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });

                it('Sucesso - variável tipo texto inicializada após declaração', () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste {}",
                        "var teste: Texto;",
                        "teste = 'abc';",
                        "escreva(teste); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(0);
                });
            });
            describe('Cenários de falha', () => {
                it('Aviso - variável de classe não inicializada', () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste {}",
                        "var teste: Teste;",
                        "escreva(teste); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                    expect(retornoAnalisadorSemantico.diagnosticos.filter(item => item.severidade === DiagnosticoSeveridade.AVISO)).toHaveLength(1);
                });

                it('Aviso - variável tipo texto não inicializada', () => {
                    const retornoLexador = lexador.mapear([
                        "classe Teste {}",
                        "var teste: Texto;",
                        "escreva(teste); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                    expect(retornoAnalisadorSemantico.diagnosticos.filter(item => item.severidade === DiagnosticoSeveridade.AVISO)).toHaveLength(1);
                });

                it('Erro - escreva sem parametro', () => {
                    const retornoLexador = lexador.mapear([
                        "escreva(); ",
                    ], -1);
                    const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                    const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
                    expect(retornoAnalisadorSemantico).toBeTruthy();
                    expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
                    expect(retornoAnalisadorSemantico.diagnosticos.filter(item => item.severidade === DiagnosticoSeveridade.ERRO)).toHaveLength(1);
                    expect(retornoAnalisadorSemantico.diagnosticos[0].mensagem).toBe('É preciso ter um ou mais parametros para \'escreva(...)\'');
                });
            });
        });
    });
});
