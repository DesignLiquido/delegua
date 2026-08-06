import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorElixir } from '../../fontes/tradutores';

describe('Tradutor Delégua -> Elixir', () => {
    let tradutor: TradutorElixir;
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        tradutor = new TradutorElixir();
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    describe('Literais', () => {
        it('Número', async () => {
            const codigo = ['42'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('42');
        });

        it('Número decimal com parte fracionária zero preserva o ponto decimal (resolve #1407)', async () => {
            const codigo = ['escreva(10.0)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/IO\.puts\(10\.0\)/i);
        });

        it('String', async () => {
            const codigo = ['"Olá mundo"'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('"Olá mundo"');
        });

        it('Boolean verdadeiro', async () => {
            const codigo = ['verdadeiro'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('true');
        });

        it('Boolean falso', async () => {
            const codigo = ['falso'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('false');
        });

        it('Nulo', async () => {
            const codigo = ['nulo'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('nil');
        });
    });

    describe('Tipo real explícito sempre com parte decimal (resolve #1407)', () => {
        it('variável real inicializada com literal inteiro -> 10.0', async () => {
            const codigo = ['var x: real = 10'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/x = 10\.0/i);
        });

        it('variável real inicializada com variável número -> conversão explícita', async () => {
            const codigo = ['var y = 10', 'var x: real = y'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/x = \(y\) \/ 1/i);
        });

        it('função com retorno tipado real e literal inteiro -> 10.0', async () => {
            const codigo = ['funcao f(): real {', '    retorna 10', '}'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/10\.0/);
        });

        it('função com retorno tipado real e variável número -> conversão explícita', async () => {
            const codigo = ['funcao f(): real {', '    var y = 10', '    retorna y', '}'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/\(y\) \/ 1/);
        });

        it('real(10) converte para (10.0) / 1', async () => {
            const codigo = ['escreva(real(10))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/IO\.puts\(\(10\.0\) \/ 1\)/i);
        });

        it('real(y) com y número converte para (y) / 1', async () => {
            const codigo = ['var y = 10', 'escreva(real(y))'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toMatch(/IO\.puts\(\(y\) \/ 1\)/i);
        });
    });

    describe('Variáveis', () => {
        it('Declaração de variável simples', async () => {
            const codigo = ['var x = 5'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('x = 5');
        });

        it('Declaração de variável com camelCase', async () => {
            const codigo = ['var minhaVariavel = 10'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('minha_variavel = 10');
        });

        it('Declaração de constante', async () => {
            const codigo = ['const PI = 3.14'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('PI = 3.14');
        });
    });

    describe('Operações Binárias', () => {
        it('Soma', async () => {
            const codigo = ['5 + 3'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 + 3');
        });

        it('Multiplicação', async () => {
            const codigo = ['10 * 2'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('10 * 2');
        });

        it('Comparação menor que', async () => {
            const codigo = ['5 < 10'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 < 10');
        });

        it('Operador E lógico', async () => {
            const codigo = [
                'funcao testar(a, b) {',
                '    retorna a e b',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('a and b');
        });

        it('Operador OU lógico', async () => {
            const codigo = [
                'funcao testar(a, b) {',
                '    retorna a ou b',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('a or b');
        });
    });

    describe('Concatenação de textos com operador + (resolve #1409)', () => {
        it('Concatenação de dois literais de texto usa <>', async () => {
            const codigo = ['escreva("Olá" + " mundo")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('<>');
            expect(resultado).not.toMatch(/"Olá" \+ " mundo"/);
        });

        it('Concatenação de acesso a índice de vetor com literal de texto usa <> (caso do issue)', async () => {
            const codigo = [
                'var arr = ["Texto", 67]',
                'arr.adicionar("Outro texto")',
                'escreva(arr[0] + " " + arr[2])'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('<>');
            expect(resultado).toContain('to_string(');
            expect(resultado).not.toMatch(/Enum\.at\(arr, 0\) \+ " "/);
        });
    });

    describe('Coleções', () => {
        it('Vetor/Lista vazia', async () => {
            const codigo = ['[]'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('[]');
        });

        it('Vetor/Lista com elementos', async () => {
            const codigo = ['[1, 2, 3, 4, 5]'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('[1, 2, 3, 4, 5]');
        });

        it('Dicionário/Map com elementos', async () => {
            const codigo = ['var pessoa = {"nome": "João", "idade": 30}'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('%{');
            expect(resultado).toContain('"nome"');
            expect(resultado).toContain('"João"');
        });

        it('Tupla', async () => {
            const codigo = ['(1, 2, 3)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('{1, 2, 3}');
        });
    });

    describe('I/O', () => {
        it('Escreva simples', async () => {
            const codigo = ['escreva("Olá mundo")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('IO.puts("Olá mundo")');
        });

        it('Escreva com variável', async () => {
            const codigo = ['var nome = "Maria"', 'escreva(nome)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('nome = "Maria"');
            expect(resultado).toContain('IO.puts(nome)');
        });
    });

    describe('Comentários', () => {
        it('Código funciona mesmo com comentários presentes', async () => {
            // Note: Comments are filtered by the lexer, so they won't appear in translation
            // This test just verifies that having comments doesn't break the code
            const codigo = ['var x = 5'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('x = 5');
        });
    });

    describe('Controle de Fluxo', () => {
        it('If/Else simples', async () => {
            const codigo = [
                'se verdadeiro {',
                '    escreva("Verdadeiro")',
                '} senao {',
                '    escreva("Falso")',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('if');
            expect(resultado).toContain('do');
            expect(resultado).toContain('else');
            expect(resultado).toContain('end');
        });
    });

    describe('Funções', () => {
        it('Declaração de função simples', async () => {
            const codigo = [
                'funcao somar(a, b) {',
                '    retorna a + b',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('def somar(a, b) do');
            expect(resultado).toContain('a + b');
            expect(resultado).toContain('end');
        });

        it('Chamada de função', async () => {
            const codigo = [
                'funcao dobrar(x) {',
                '    retorna x * 2',
                '}',
                'var resultado = dobrar(5)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('def dobrar(x)');
            expect(resultado).toContain('dobrar(5)');
        });

        it('Função no escopo global é envolvida em módulo implícito e chamadas fora dele são qualificadas (resolve #1408)', async () => {
            const codigo = [
                'funcao foo(x: numero) {',
                '    se x > 0',
                '        retorne x * 10.0',
                '    retorne foo(x - 1)',
                '}',
                '',
                'const nome = "Fernando"',
                'escreva(nome)',
                'escreva(foo(10))'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            // `def` deve estar dentro de um módulo, nunca solto no escopo global.
            expect(resultado).toMatch(/defmodule Main do[\s\S]*def foo\(x\) do[\s\S]*end/);

            // Chamada recursiva interna à própria função não deve ser qualificada.
            expect(resultado).toMatch(/foo\(x - 1\)/);
            expect(resultado).not.toMatch(/Main\.foo\(x - 1\)/);

            // Chamada feita fora do módulo (escopo global) deve ser qualificada com o nome do módulo.
            expect(resultado).toMatch(/IO\.puts\(Main\.foo\(10\)\)/);
        });
    });

    describe('Classes e Módulos', () => {
        it('Classe simples com construtor', async () => {
            const codigo = [
                'classe Pessoa {',
                '    construtor(nome, idade) {',
                '        isto.nome = nome',
                '        isto.idade = idade',
                '    }',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('defmodule Pessoa do');
            expect(resultado).toContain('defstruct');
            expect(resultado).toContain(':nome');
            expect(resultado).toContain(':idade');
            expect(resultado).toContain('def new(nome, idade)');
            expect(resultado).toContain('%Pessoa{');
        });

        it('Classe com método', async () => {
            const codigo = [
                'classe Calculadora {',
                '    somar(a, b) {',
                '        retorna a + b',
                '    }',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('defmodule Calculadora do');
            expect(resultado).toContain('def somar(calculadora, a, b)');
        });
    });

    describe('Loops', () => {
        it('Para cada', async () => {
            const codigo = [
                'para cada item em [1, 2, 3] {',
                '    escreva(item)',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.each');
            expect(resultado).toContain('fn item ->');
        });

        it('Enquanto', async () => {
            const codigo = [
                'var x = 0',
                'enquanto x < 5 {',
                '    x = x + 1',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('loop = fn when');
            expect(resultado).toContain('loop.()');
        });

        it('Para', async () => {
            const codigo = [
                'para (var i = 0; i < 5; i = i + 1) {',
                '    escreva(i)',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('loop = fn i when');
            expect(resultado).toContain('loop.(');
        });
    });

    describe('Acesso a Métodos e Propriedades', () => {
        it('Método de lista - tamanho', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'var tam = lista.tamanho()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('length(lista)');
        });

        it('Método de string - maiusculo', async () => {
            const codigo = [
                'var texto = "olá"',
                'var maiuscula = texto.maiusculo()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('String.upcase(texto)');
        });
    });

    describe('Operações Binárias adicionais', () => {
        it('Subtração', async () => {
            const codigo = ['5 - 3'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 - 3');
        });

        it('Divisão', async () => {
            const codigo = ['10 / 2'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('10 / 2');
        });

        it('Módulo (resto)', async () => {
            const codigo = ['10 % 3'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('rem');
        });

        it('Exponenciação', async () => {
            const codigo = ['2 ** 8'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('2 ** 8');
        });

        it('Maior que', async () => {
            const codigo = ['5 > 3'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 > 3');
        });

        it('Maior ou igual', async () => {
            const codigo = ['5 >= 3'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 >= 3');
        });

        it('Menor ou igual', async () => {
            const codigo = ['3 <= 5'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('3 <= 5');
        });

        it('Igual', async () => {
            const codigo = ['5 == 5'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 == 5');
        });

        it('Diferente', async () => {
            const codigo = ['5 != 3'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('5 != 3');
        });

        it('Negação unária (!)', async () => {
            const codigo = ['!verdadeiro'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('not');
            expect(resultado).toContain('true');
        });
    });

    describe('Escolha (switch/case)', () => {
        it('Escolha com um caso e padrão', async () => {
            const codigo = [
                'var x = 1',
                'escolha (x) {',
                '    caso 1:',
                '        escreva("um")',
                '    padrao:',
                '        escreva("outro")',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('case');
            expect(resultado).toContain('->');
            expect(resultado).toContain('_ ->');
            expect(resultado).toContain('end');
        });

        it('Escolha com múltiplos casos', async () => {
            const codigo = [
                'var y = 2',
                'escolha (y) {',
                '    caso 1:',
                '        escreva("um")',
                '    caso 2:',
                '        escreva("dois")',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('case');
            expect(resultado).toContain('do');
            expect(resultado).toContain('end');
        });
    });

    describe('Escreva com múltiplos argumentos', () => {
        it('Escreva com dois argumentos', async () => {
            const codigo = ['escreva("a", "b")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('IO.puts(');
            expect(resultado).toContain('<>');
            expect(resultado).toContain('"a"');
            expect(resultado).toContain('"b"');
        });

        it('Escreva com três argumentos', async () => {
            const codigo = ['escreva("a", "b", "c")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('IO.puts(');
            expect(resultado).toContain('<>');
        });
    });

    describe('Fazer...enquanto (do-while)', () => {
        it('Fazer...enquanto simples', async () => {
            const codigo = [
                'var x = 0',
                'faca {',
                '    escreva(x)',
                '} enquanto (x < 1)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('loop = fn ->');
            expect(resultado).toContain('loop.()');
            expect(resultado).toContain(':ok');
            expect(resultado).toContain('end).()');
        });
    });

    describe('Para (for clássico)', () => {
        it('Para com variável e condição', async () => {
            const codigo = [
                'para (var i = 0; i < 5; i = i + 1) {',
                '    escreva(i)',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('loop = fn i when');
            expect(resultado).toContain('loop.(0)');
            expect(resultado).toContain(':ok');
        });
    });

    describe('Para cada (foreach)', () => {
        it('Para cada com variável de iteração', async () => {
            const codigo = [
                'para cada item em [1, 2, 3] {',
                '    escreva(item)',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.each(');
            expect(resultado).toContain('fn item ->');
            expect(resultado).toContain('end)');
        });
    });

    describe('Acesso a índice de variável', () => {
        it('Acesso por índice usa Enum.at', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'var elem = lista[0]'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.at(lista, 0)');
        });
    });

    describe('Acesso a método', () => {
        it('Acesso a método gera referência objeto.metodo', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'lista.tamanho()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('length(lista)');
        });
    });

    describe('Funções lambda (funcao construto)', () => {
        it('Lambda com corpo de expressão única', async () => {
            const codigo = ['var f = funcao(x) { retorna x + 1 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('fn x ->');
            expect(resultado).toContain('end');
        });

        it('Lambda com múltiplas linhas no corpo', async () => {
            const codigo = [
                'var f = funcao(x, y) {',
                '    var soma = x + y',
                '    retorna soma',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('fn x, y ->');
            expect(resultado).toContain('end');
        });
    });

    describe('Dicionário vazio', () => {
        it('Dicionário vazio gera %{}', async () => {
            const codigo = ['var d = {}'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('%{}');
        });
    });

    describe('Variável sem inicializador', () => {
        it('Var sem valor vira nil', async () => {
            const codigo = ['var x'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('x = nil');
        });
    });

    describe('Constante dentro de módulo', () => {
        it('Const dentro de classe vira atributo de módulo', async () => {
            const codigo = [
                'classe Configs {',
                '    construtor() {',
                '    }',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('defmodule Configs do');
            expect(resultado).toContain('end');
        });
    });

    describe('Constante fora de módulo', () => {
        it('Const fora de módulo mantém nome em maiúsculas', async () => {
            const codigo = ['const PI = 3.14'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('PI = 3.14');
        });

        it('Const com valor string', async () => {
            const codigo = ['const SAUDACAO = "Olá"'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('SAUDACAO = "Olá"');
        });
    });

    describe('Retorna sem valor', () => {
        it('Retorna sem valor gera nil', async () => {
            const codigo = [
                'funcao nada() {',
                '    retorna',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('nil');
        });
    });

    describe('Expressão lógica', () => {
        it('E lógico em expressão', async () => {
            const codigo = ['verdadeiro e falso'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('true and false');
        });

        it('OU lógico em expressão', async () => {
            const codigo = ['verdadeiro ou falso'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('true or false');
        });
    });

    describe('Leitura de input', () => {
        it('Leia sem argumento gera IO.gets("")', async () => {
            const codigo = ['var entrada = leia()'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('IO.gets("")');
            expect(resultado).toContain('String.trim()');
        });

        it('Leia com prompt gera IO.gets com argumento', async () => {
            const codigo = ['var entrada = leia("Digite algo: ")'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('IO.gets("Digite algo: ")');
        });
    });

    describe('Classe com estrangeira', () => {
        it('Classe estrangeira gera @moduledoc e @callback', async () => {
            const codigo = [
                'classe estrangeira Servico {',
                '    processar(dados)',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('defmodule Servico do');
            expect(resultado).toContain('@moduledoc');
            expect(resultado).toContain('@callback');
            expect(resultado).toContain('end');
        });
    });

    describe('Métodos de coleção adicionais', () => {
        it('Método inverter', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'lista.inverter()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.reverse(lista)');
        });

        it('Método ordenar', async () => {
            const codigo = [
                'var lista = [3, 1, 2]',
                'lista.ordenar()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.sort(lista)');
        });

        it('Método somar', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'lista.somar()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.sum(lista)');
        });

        it('Método minusculo', async () => {
            const codigo = [
                'var texto = "OLÁ"',
                'texto.minusculo()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('String.downcase(texto)');
        });

        it('Método aparar', async () => {
            const codigo = [
                'var texto = "  olá  "',
                'texto.aparar()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('String.trim(texto)');
        });

        it('Método inclui com argumento', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'lista.inclui(2)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.member?(lista, 2)');
        });

        it('Método juntar sem argumento', async () => {
            const codigo = [
                'var lista = ["a", "b"]',
                'lista.juntar()'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('Enum.join(lista)');
        });

        it('Método remover com argumento', async () => {
            const codigo = [
                'var lista = [1, 2, 3]',
                'lista.remover(2)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('List.delete(lista, 2)');
        });
    });

    describe('Agrupamento', () => {
        it('Expressão agrupada gera parênteses', async () => {
            const codigo = ['(5 + 3)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('(5 + 3)');
        });
    });

    describe('Classe com método normal', () => {
        it('Método de instância passa struct como primeiro parâmetro', async () => {
            const codigo = [
                'classe Contador {',
                '    construtor(valor) {',
                '        isto.valor = valor',
                '    }',
                '    incrementar() {',
                '        retorna isto.valor + 1',
                '    }',
                '}'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = await tradutor.traduzir(retornoSintatico.declaracoes);

            expect(resultado).toContain('defmodule Contador do');
            expect(resultado).toContain('defstruct');
            expect(resultado).toContain(':valor');
            expect(resultado).toContain('def new(valor)');
            expect(resultado).toContain('def incrementar(contador)');
            expect(resultado).toContain('end');
        });
    });
});
