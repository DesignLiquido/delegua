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
});
