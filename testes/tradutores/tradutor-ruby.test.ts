import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorRuby } from '../../fontes/tradutores';

describe('Tradutor Delégua -> Ruby', () => {
    const tradutor: TradutorRuby = new TradutorRuby();
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
    });

    it('Olá mundo', async () => {
        const retornoLexador = lexador.mapear(
            ['escreva("Olá mundo")'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/puts\('Olá mundo'\)/i);
    });

    it('Literais - vetores com primitivas', async () => {
        const retornoLexador = lexador.mapear(
            ['[1, 2, 3].adicionar(1)'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/\[1, 2, 3\].push\(1\)/i);
    });

    it('Literais - dicionários', async () => {
        const retornoLexador = lexador.mapear(
            [`escreva({ 'chave 1': 'valor' })`],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('puts({');
        expect(resultado).toContain("'chave 1' => 'valor'");
        expect(resultado).toContain('})');
    });

    it('Funções nativas de vetor e texto', async () => {
        const retornoLexador = lexador.mapear(
            [
                'var vetor = [1, 2];',
                'vetor.adicionar(3);',
                'vetor.empilhar(4);',
                'vetor.removerUltimo();',
                'vetor.inverter();',
                'vetor.inclui(2)',
                'vetor.ordenar()',
                'vetor.removerPrimeiro();',

                'var nome = \'delégua > égua\';',
                'nome = nome.maiusculo();',
                'nome = nome.minusculo();',
            ],
            -1
        );
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/vetor = \[1, 2\]/i);
        expect(resultado).toMatch(/vetor.push\(3\)/i);
        expect(resultado).toMatch(/vetor.push\(4\)/i);
        expect(resultado).toMatch(/vetor.pop/i);
        expect(resultado).toMatch(/vetor.reverse/i)
        expect(resultado).toMatch(/vetor.include\?\(2\)/i)
        expect(resultado).toMatch(/vetor.sort!/i)
        expect(resultado).toMatch(/vetor.shift/i);

        expect(resultado).toMatch(/nome.upcase/i);
        expect(resultado).toMatch(/nome.downcase/i);
    });

    it('Agrupamento', async () => {
        const retornoLexador = lexador.mapear(
            ['escreva((2 * 3) + (4 ** 2))'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/puts\(\(2 \* 3\) \+ \(4 \*\* 2\)\)/i);
    });

    it('Atribuir', async () => {
        const retornoLexador = lexador.mapear(
            ['var a = 1;', 'a += 2'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/a = 1/i);
        expect(resultado).toMatch(/a \+= 2/i);
    });

    it('Soma com incremento', async () => {
        const retornoLexador = lexador.mapear(
            ['var a = 2;', 'escreva(a)'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/a = 2/i);
        expect(resultado).toMatch(/puts\(a\)/i);
    });

    it('Escreva verdadeiro e falso com operadores lógicos E', async () => {
        const retornoLexador = lexador.mapear(
            ['escreva(verdadeiro e verdadeiro)'],
            -1
        );
        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/puts\(true && true\)/i);
    });

    it('Escreva verdadeiro e falso com operadores lógicos OU', async () => {
        const retornoLexador = lexador.mapear(
            ['escreva(verdadeiro ou verdadeiro)'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/puts\(true \|\| true\)/i);
    });

    it('Escreva valores literais - nulo, número, booleano', async () => {
        const retornoLexador = lexador.mapear(
            ['escreva(nulo, 123, verdadeiro, falso)'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toMatch(/puts\(nil, 123, true, false\)/i);
    });

    it('Para Cada "em" - vetor variável', async () => {
        const retornoLexador = lexador.mapear(
            [
                'var vetor = [1, 2, 3, 4, 5];',
                'para cada elemento em vetor {',
                '    escreva(elemento);',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('vetor = [1, 2, 3, 4, 5]');
        expect(resultado).toContain('vetor.each do |elemento|');
        expect(resultado).toContain('puts(elemento)');
        expect(resultado).toContain('end');
    });

    it('Função simples -> def', async () => {
        const retornoLexador = lexador.mapear(
            [
                'funcao minhaFuncao() {',
                '    escreva("olá");',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('def minhaFuncao()');
        expect(resultado).toContain("puts('olá')");
        expect(resultado).toContain('end');
    });

    it('Função com retorno número -> def', async () => {
        const retornoLexador = lexador.mapear(
            [
                'funcao soma(a, b) {',
                '    retorna a + b;',
                '}'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('def soma(a, b)');
        expect(resultado).toContain('return a + b');
        expect(resultado).toContain('end');
    });

    it('Chamada de função -> def', async () => {
        const retornoLexador = lexador.mapear(
            [
                'funcao ola() {',
                '    escreva("olá");',
                '}',
                'ola();'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('def ola()');
        expect(resultado).toContain('ola()');
    });

    it('Chamada de função com parâmetros -> def', async () => {
        const retornoLexador = lexador.mapear(
            [
                'funcao soma(a, b) {',
                '    retorna a + b;',
                '}',
                'escreva(soma(2, 3));'
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('def soma(a, b)');
        expect(resultado).toContain('puts(soma(2, 3))');
    });

    it('leia -> gets', async () => {
        const retornoLexador = lexador.mapear(
            ['var nome = leia("Digite seu nome: ");'],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain("print('Digite seu nome: '); gets.chomp");
    });

    it('Classe simples', async () => {
        const retornoLexador = lexador.mapear(
            [
                'classe Pessoa {',
                '    construtor(nome) {',
                '        isto.nome = nome;',
                '    }',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('class Pessoa');
        expect(resultado).toContain('def initialize(nome)');
        expect(resultado).toContain('@nome = nome');
        expect(resultado).toContain('end');
    });

    it('Herança de classes', async () => {
        const retornoLexador = lexador.mapear(
            [
                'classe Animal {',
                '}',
                'classe Cachorro herda Animal {',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('class Animal');
        expect(resultado).toContain('class Cachorro < Animal');
    });

    it('Classe vazia - sem pass', async () => {
        const retornoLexador = lexador.mapear(
            [
                'classe MinhaClasse {',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('class MinhaClasse');
        expect(resultado).toContain('end');
        expect(resultado).not.toContain('pass');
    });

    it('tente - pegue - finalmente -> begin - rescue - ensure', async () => {
        const retornoLexador = lexador.mapear(
            [
                'tente {',
                '    escreva("tentando");',
                '} pegue {',
                '    escreva("erro");',
                '} finalmente {',
                '    escreva("fim");',
                '}',
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('begin');
        expect(resultado).toContain('rescue');
        expect(resultado).toContain('ensure');
        expect(resultado).toContain('end');
    });

    it('Comentários', async () => {
        const retornoLexador = lexador.mapear(
            [
                '// Comentário de uma linha',
                '/* Comentário',
                'de múltiplas',
                'linhas */',
            ],
            -1
        );

        const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
        const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

        expect(resultado).toBeTruthy();
        expect(resultado).toContain('# Comentário de uma linha');
        expect(resultado).toContain('=begin');
        expect(resultado).toContain('=end');
    });

    describe('Condicionais', () => {
        it('se -> if, código', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 1;',
                    'se (a > 0) {',
                    '    escreva("positivo");',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain('if a > 0');
            expect(resultado).toContain("puts('positivo')");
            expect(resultado).toContain('end');
        });

        it('senão -> else, código', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = -1;',
                    'se (a > 0) {',
                    '    escreva("positivo");',
                    '} senao {',
                    '    escreva("negativo");',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain('if a > 0');
            expect(resultado).toContain('else');
            expect(resultado).toContain('end');
        });

        it('se senão 01 -> if/else, código', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 0;',
                    'se (a > 0) {',
                    '    escreva("maior");',
                    '} senao {',
                    '    escreva("menor");',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain('if a > 0');
            expect(resultado).toContain('else');
        });

        it('se senão 02 -> if/elsif/else, código', async () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 0;',
                    'se (a > 0) {',
                    '    escreva("positivo");',
                    '} senao se (a < 0) {',
                    '    escreva("negativo");',
                    '} senao {',
                    '    escreva("zero");',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain('if a > 0');
            expect(resultado).toContain('elsif a < 0');
            expect(resultado).toContain('else');
            expect(resultado).toContain('end');
        });

        it('se ternário -> expressão condicional', async () => {
            const retornoLexador = lexador.mapear(
                ['var resultado = 5 > 3 ? "maior" : "menor";'],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toContain("5 > 3 ? 'maior' : 'menor'");
        });
    });

    describe('Funções Anônimas -> Lambda', () => {
        it('Lambda simples com um parâmetro e expressão aritmética', async () => {
            const codigo = [
                'var numeros = [1, 2, 3, 4, 5]',
                'var dobrados = numeros.mapear(funcao(x) { retorna x * 2 })',
                'escreva(dobrados)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('numeros = [1, 2, 3, 4, 5]');
            expect(resultado).toContain('numeros.map(&lambda { |x| x * 2 })');
            expect(resultado).toContain('puts(dobrados)');
        });

        it('Lambda com múltiplos parâmetros', async () => {
            const codigo = [
                'var numeros = [1, 2, 3]',
                'var resultado = numeros.mapear(funcao(x, indice) { retorna x + indice })',
                'escreva(resultado)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lambda { |x, indice| x + indice }');
        });

        it('Lambda sem parâmetros', async () => {
            const codigo = [
                'var vetor = [1, 2, 3]',
                'var constantes = vetor.mapear(funcao() { retorna 42 })',
                'escreva(constantes)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lambda { 42 }');
        });

        it('Lambda com expressão lógica', async () => {
            const codigo = [
                'var numeros = [1, 2, 3, 4, 5]',
                'var pares = numeros.mapear(funcao(n) { retorna n % 2 == 0 })',
                'escreva(pares)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('lambda { |n| n % 2 == 0 }');
        });

        it('Lambda com retorno de texto', async () => {
            const codigo = [
                'var nomes = ["Ana", "João", "Maria"]',
                'var saudacoes = nomes.mapear(funcao(nome) { retorna "Olá, " + nome })',
                'escreva(saudacoes)'
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain("lambda { |nome| 'Olá, ' + nome }");
        });
    });
});
