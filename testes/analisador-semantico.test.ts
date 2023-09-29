import { Lexador } from '../fontes/lexador';
import { AvaliadorSintatico } from '../fontes/avaliador-sintatico';
import { AnalisadorSemantico } from '../fontes/analisador-semantico';

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
                expect(retornoAnalisadorSemantico.erros).toHaveLength(0);
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
                expect(retornoAnalisadorSemantico.erros).toHaveLength(0);
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
                expect(retornoAnalisadorSemantico.erros).toHaveLength(0);
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
                expect(retornoAnalisadorSemantico.erros).toHaveLength(1);
            });

            it('Atribuição de constante + reatribuição de constante', () => {
                const retornoLexador = lexador.mapear([
                    "const a = 1",
                    "a = 2"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros).toHaveLength(1);
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
                expect(retornoAnalisadorSemantico.erros).toHaveLength(8);
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Atribuição inválida para \'t\', é esperado um \'texto\'.');
                expect(retornoAnalisadorSemantico.erros[1].mensagem).toBe('Atribuição inválida para \'n\', é esperado um \'número\'.');
                expect(retornoAnalisadorSemantico.erros[2].mensagem).toBe('Atribuição inválida para \'v1\', é esperado um vetor de \'texto\'.');
                expect(retornoAnalisadorSemantico.erros[3].mensagem).toBe('Atribuição inválida para \'v2\', é esperado um vetor de \'inteiros\' ou \'real\'.');
                expect(retornoAnalisadorSemantico.erros[4].mensagem).toBe('Atribuição inválida para \'v3\', é esperado um vetor de elementos.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('A função não pode ter nenhum tipo de retorno.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Esperado retorno do tipo \'texto\' dentro da função.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Esperado retorno do tipo \'inteiro\' dentro da função.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('A função não pode ter nenhum tipo de retorno.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Esperado retorno do tipo \'texto\' dentro da função.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('O tipo \'algum\' não é válido.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Declaração de retorno da função é inválido.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('\'caso 0:\' não é do mesmo tipo esperado em \'escolha\'');
                expect(retornoAnalisadorSemantico.erros[1].mensagem).toBe('\'caso 1:\' não é do mesmo tipo esperado em \'escolha\'');
            });

            it.skip('Escolha com tipos diferentes em \'caso\'', () => {
                const retornoLexador = lexador.mapear([
                    'var opcao = leia(\'Digite a opção desejada: \')',
                    'escolha opcao {',
                        // 'cas:x1 ako',
                        'caso 1: // Avisar aqui que tipo de `opcao` não é o mesmo tipo do literal 1',
                            'facaAlgumaCoisa()',
                        'cas:x1 ako',
                        'caso \'1\': // Aqui o tipo está correto, então não precisa avisar.',
                            'facaAlgumaCoisa()',
                    '}',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                // expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('\'caso 0:\' não é do mesmo tipo esperado em \'escolha\'');
                // expect(retornoAnalisadorSemantico.erros[1].mensagem).toBe('\'caso 1:\' não é do mesmo tipo esperado em \'escolha\'');
            });

            it('Leia só pode receber texto', () => {
                const retornoLexador = lexador.mapear([
                    'var opcao: inteiro = leia(\'Digite a opção desejada: \')',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Atribuição inválida para \'opcao\', Leia só pode receber tipo \'texto\'.');
            });

            it('Escreva com variável que não existe', () => {
                const retornoLexador = lexador.mapear([
                    'var t = \'teste\'',
                    'escreva(XXX,\' outro teste\')',
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Variável \'XXX\' não existe.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Função \'f\' espera 2 parametros.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Função \'f\' espera 2 parametros.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('Chamada da função \'x\' não existe.');
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
                expect(retornoAnalisadorSemantico.erros[0].mensagem).toBe('O valor passado para o parâmetro \'a\' é diferente do esperado pela função.');
                expect(retornoAnalisadorSemantico.erros[1].mensagem).toBe('O valor passado para o parâmetro \'b\' é diferente do esperado pela função.');
            });
        });
    });
});
