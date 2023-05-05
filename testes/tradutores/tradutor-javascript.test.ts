import { Binario, Variavel, Literal } from '../../fontes/construtos';
import { Se, Bloco, Escreva } from '../../fontes/declaracoes';
import { Lexador, Simbolo } from '../../fontes/lexador';
import { TradutorJavaScript } from '../../fontes/tradutores/tradutor-javascript';
import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';

describe('Tradutor Delégua -> JavaScript', () => {
    const tradutor: TradutorJavaScript = new TradutorJavaScript();

    describe('Programático', () => {
        it('se -> if, programático', () => {
            const se = new Se(
                new Binario(
                    -1,
                    new Variavel(-1, new Simbolo(tiposDeSimbolos.IDENTIFICADOR, 'a', null, 1, -1)),
                    new Simbolo(tiposDeSimbolos.IGUAL_IGUAL, '', null, 1, -1),
                    new Literal(-1, 1, 1)
                ),
                new Bloco(-1, 1, [new Escreva(2, -1, [new Literal(-1, 1, 10)])]),
                null,
                null
            );
            const resultado = tradutor.traduzir([se]);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });
    });

    describe('Código', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
        });

        it('bit a bit', () => {
            const retornoLexador = lexador.mapear(
                [
                    'escreva(8 | 1)',
                    'escreva(8 & 1)',
                    'escreva(8 ^ 1)',
                    'escreva(~2)',
                    'var a = 3',
                    'var c = -a + 3'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/console\.log\(8 | 1\)/i);
            expect(resultado).toMatch(/console\.log\(8 & 1\)/i);
            expect(resultado).toMatch(/console\.log\(8 \^ 1\)/i);
            expect(resultado).toMatch(/console\.log\(~2\)/i);
            expect(resultado).toMatch(/let a = 3/i);
            expect(resultado).toMatch(/let c = -a \+ 3/i);
        });

        it('vetor acesso indice -> array/index', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var vetor = [1, \'2\']',
                    'vetor[0] = 3',
                    'vetor[1] = vetor[0]'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let vetor = \[1, \'2\'\];/i);
            expect(resultado).toMatch(/vetor\[0\] = 3/i);
            expect(resultado).toMatch(/vetor\[1\] = vetor\[0\]/i);
        });

        it('vetor -> array - com valores', () => {
            const retornoLexador = lexador.mapear(
                ['var vetor = [1, \'2\']'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let vetor = \[1, \'2\'\];/i);
        });

        it('vetor -> array - vazio', () => {
            const retornoLexador = lexador.mapear(
                ['var vetor = []'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let vetor = \[\]/i);
        });

        it('declarando variável const/constante/fixo', () => {
            const retornoLexador = lexador.mapear(
                [
                    'const a = 1;',
                    'constante b = 2;',
                    'fixo c = 3;',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/const a = 1;/i);
            expect(resultado).toMatch(/const b = 2;/i);
            expect(resultado).toMatch(/const c = 3;/i);
        });

        it('declarando variável não inicializada', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a;',
                    'variavel b;'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let a;/i);
            expect(resultado).toMatch(/let b;/i);
        });

        it('definindo funcao com variavel', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = funcao(parametro1, parametro2) { escreva(\'Oi\')\nescreva(\'Olá\') }',
                    'a(1, 2)'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let a = function\(parametro1, parametro2\) {/i);
            expect(resultado).toMatch(/console\.log\('Oi'\)/i);
            expect(resultado).toMatch(/console\.log\('Olá'\)/i);
            expect(resultado).toMatch(/a\(1, 2\)/i);
        });

        it('herda -> extends', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    'corre() {',
                    'escreva("correndo");',
                    '}',
                    '}',
                    'classe Cachorro herda Animal {}',
                    'var thor = Cachorro();',
                    'thor.corre();',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/export class Animal {/i);
            expect(resultado).toMatch(/corre\(\)/i);
            expect(resultado).toMatch(/console\.log\('correndo'\)/i);
            expect(resultado).toMatch(/class Cachorro extends Animal {/i);
            expect(resultado).toMatch(/let thor = new Cachorro\(\)/i);
            expect(resultado).toMatch(/thor.corre\(\)/i);
        });

        it('agrupamento', () => {
            const retornoLexador = lexador.mapear(
                ['var agrupamento = (2 * 2) + 5 - 1 ** (2 + 3 - 4)', 'escreva(agrupamento)'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let agrupamento = \(2 \* 2\) \+ 5 - 1 \** \(2 \+ 3 - 4\)/i);
            expect(resultado).toMatch(/console\.log\(agrupamento\)/i);
        });

        it('isto -> this', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Teste {',
                    'construtor(abc){',
                    'isto.valor = abc',
                    '}',
                    'mostrarValor() {',
                    'escreva(isto.valor)',
                    '}',
                    '}',
                    'var teste = Teste(100);',
                    'teste.mostrarValor()',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/export class Teste {/i);
            expect(resultado).toMatch(/constructor\(abc\)/i);
            expect(resultado).toMatch(/this.valor = abc/i);
            expect(resultado).toMatch(/mostrarValor\(\) {/i);
            expect(resultado).toMatch(/console\.log\(this.valor\)/i);
            expect(resultado).toMatch(/let teste = new Teste\(100\)/i);
            expect(resultado).toMatch(/teste.mostrarValor\(\)/i);
        });

        it('para/sustar -> for/break', () => {
            const retornoLexador = lexador.mapear(
                ['para (var i = 0; i < 5; i = i + 1) {', 'se(i == 3) {', 'sustar;', '}', 'escreva(i);', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for \(/i);
            expect(resultado).toMatch(/if \(/i);
            expect(resultado).toMatch(/\(\i === 3\)/i);
            expect(resultado).toMatch(/break/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('para/continue -> for/continue', () => {
            const retornoLexador = lexador.mapear(
                ['para (var i = 0; i < 5; i = i + 1) {', 'se(i == 3) {', 'continua', '}', 'escreva(i);', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for \(/i);
            expect(resultado).toMatch(/if \(i === 3\)/i);
            expect(resultado).toMatch(/continue/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('para -> for', () => {
            const retornoLexador = lexador.mapear(
                ['para (var i = 0; i < 5; i = i + 1) {', 'escreva(i);', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for \(let i = 0; i < 5; i = i \+ 1\) {/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('\'para\' sem parenteses -> for', () => {
            const retornoLexador = lexador.mapear(
                ['para var i = 0; i < 5; i = i + 1 {', 'escreva(i);', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for \(let i = 0; i < 5; i = i \+ 1\) {/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('para cada \'em\' - vetor variável', async () => {
            const retornoLexador = lexador.mapear([
                "var v = [1, 2, 3]",
                "para cada elemento em v {",
                "   escreva('Valor: ', elemento)",
                "}",
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let v = \[1, 2, 3\]/i);
            expect(resultado).toMatch(/for \(let elemento in v\) {/i);
            expect(resultado).toMatch(/console\.log\(\'Valor: \', elemento\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('para cada \'em\' - vetor variável', async () => {
            const retornoLexador = lexador.mapear([
                "para cada elemento em [1, 2, 3] {",
                "   escreva('Valor: ', elemento)",
                "}",
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for \(let elemento in \[1, 2, 3\]\) {/i);
            expect(resultado).toMatch(/console\.log\(\'Valor: \', elemento\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('para cada elemento \'de\' - vetor variável', async () => {
            const retornoLexador = lexador.mapear([
                "var v = [1, 2, 3]",
                "para cada elemento de v {",
                "   escreva('Valor: ', elemento)",
                "}",
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let v = \[1, 2, 3\]/i);
            expect(resultado).toMatch(/for \(let elemento in v\) {/i);
            expect(resultado).toMatch(/console\.log\(\'Valor: \', elemento\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('para cada elemento \'de\' - vetor variável', async () => {
            const retornoLexador = lexador.mapear([
                "para cada elemento de [1, 2, 3] {",
                "   escreva('Valor: ', elemento)",
                "}",
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for \(let elemento in \[1, 2, 3\]\) {/i);
            expect(resultado).toMatch(/console\.log\(\'Valor: \', elemento\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('enquanto -> while', () => {
            const retornoLexador = lexador.mapear(
                ['var i = 0;', 'fazer {', 'escreva(i);', 'i = i + 1;', '} enquanto (i < 5)'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let i = 0/i);
            expect(resultado).toMatch(/do {/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
            expect(resultado).toMatch(/i = i \+ 1/i);
            expect(resultado).toMatch(/}/i);
            expect(resultado).toMatch(/while \(i < 5\)/i);
        });

        it('enquanto -> do while', () => {
            const retornoLexador = lexador.mapear(['enquanto (verdadeiro) {', 'escreva("sim");', '}'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/while \(true\) {/i);
            expect(resultado).toMatch(/console\.log\('sim'\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('enquanto -> while', () => {
            const retornoLexador = lexador.mapear(['enquanto (verdadeiro) {', "escreva('sim');", '}'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/while \(true\) {/i);
            expect(resultado).toMatch(/console\.log\(\'sim\'\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('tente - pegue - finalmente -> try - catch - finally', () => {
            const retornoLexador = lexador.mapear(
                [
                    'tente { ',
                    '   1 > "2";',
                    '   escreva("sucesso");',
                    '}',
                    'pegue {',
                    '   escreva("Ocorreu uma exceção.");',
                    '} finalmente {',
                    '   escreva("Ocorrendo exceção ou não, eu sempre executo");',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/try {/i);
            expect(resultado).toMatch(/1 > \'2\'/i);
            expect(resultado).toMatch(/console\.log\('sucesso'\)/i);
            expect(resultado).toMatch(/console\.log\('Ocorreu uma exceção.'\)/i);
            expect(resultado).toMatch(/console\.log\('Ocorrendo exceção ou não, eu sempre executo'\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('escolha -> switch/case', () => {
            const retornoLexador = lexador.mapear(
                [
                    'escolha (2) {',
                    'caso "1":',
                    'escreva("correspondente à opção 1");',
                    'escreva("escreva de novo 1");',
                    'caso 1:',
                    'caso 2:',
                    'escreva("correspondente à opção 2");',
                    'escreva("escreva de novo 2");',
                    'escreva("escreva de novo 3");',
                    'padrao:',
                    'escreva("Sem opção correspondente");',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/switch \(2\) /i);
            expect(resultado).toMatch(/case '1':/i);
            expect(resultado).toMatch(/console\.log\('correspondente à opção 1'\)/i);
            expect(resultado).toMatch(/console\.log\('escreva de novo 1'\)/i);
            expect(resultado).toMatch(/case 1:/i);
            expect(resultado).toMatch(/case 2:/i);
            expect(resultado).toMatch(/console\.log\('correspondente à opção 2'\)/i);
            expect(resultado).toMatch(/console\.log\('escreva de novo 2'\)/i);
            expect(resultado).toMatch(/console\.log\('escreva de novo 3'\)/i);
            // expect(resultado).toMatch(/default:'\)/i);
            expect(resultado).toMatch(/console\.log\('Sem opção correspondente'\)/i);
        });

        it('classe com parametros -> class', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Teste {',
                    'construtor(valor1) {',
                    'escreva("começou")',
                    '}',
                    'testeFuncao(valor2) {',
                    'escreva("olá");',
                    "retorna 'teste'",
                    '}',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/export class Teste {/i);
            expect(resultado).toMatch(/constructor()/i);
            expect(resultado).toMatch(/console\.log\('começou'\)/i);
            expect(resultado).toMatch(/testeFuncao\(valor2\)/i);
            expect(resultado).toMatch(/console\.log\('olá'\)/i);
            expect(resultado).toMatch(/return 'teste'/i);
        });

        it('classe sem parametros -> class', () => {
            const retornoLexador = lexador.mapear(
                ['classe Teste {', 'construtor() {', 'escreva("começou")', '}', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/export class Teste {/i);
            expect(resultado).toMatch(/constructor()/i);
            expect(resultado).toMatch(/console\.log\('começou'\)/i);
        });

        it('se -> if, código', () => {
            const retornoLexador = lexador.mapear(['se (a == 1) {', '    escreva(10)', '}'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });

        it('senão -> else, código', () => {
            const retornoLexador = lexador.mapear(
                ['se (a == 1) {', '    escreva(10)', '} senão {', '   escreva(20)', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
            expect(resultado).toMatch(/else/i);
            expect(resultado).toMatch(/console\.log\(20\)/i);
        });

        it('se senão 01 -> if else, código', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 20',
                    'se (a == 10) {',
                    '   escreva(10)',
                    '} senão se (a == 20) {',
                    '   escreva(20)',
                    '} senão {',
                    "   escreva('Não é 10 e não é 20')",
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 10/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
            expect(resultado).toMatch(/else if/i);
            expect(resultado).toMatch(/a === 20/i);
            expect(resultado).toMatch(/console\.log\(20\)/i);
            expect(resultado).toMatch(/else/i);
            expect(resultado).toMatch(/console\.log\('Não é 10 e não é 20'\)/i);
        });

        it('se senão 02 -> if else, código', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 20',
                    'se (a == 10) {',
                    '   escreva(10)',
                    '} senão se (a == 20) {',
                    '   escreva(20)',
                    '} senão se (a == 30) {',
                    '   escreva(30)',
                    '} senão {',
                    "   escreva('Não é nenhum desses valores: 10, 20, 30')",
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 10/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
            expect(resultado).toMatch(/else if/i);
            expect(resultado).toMatch(/a === 20/i);
            expect(resultado).toMatch(/console\.log\(20\)/i);
            expect(resultado).toMatch(/else if/i);
            expect(resultado).toMatch(/a === 30/i);
            expect(resultado).toMatch(/console\.log\(30\)/i);
            expect(resultado).toMatch(/else/i);
            expect(resultado).toMatch(/console\.log\('Não é nenhum desses valores: 10, 20, 30'\)/i);
        });

        it('escreva -> console.log', () => {
            const codigo = ["var texto = 'Olá Mundo'", 'escreva(texto)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let texto = 'Olá Mundo'/i);
            expect(resultado).toMatch(/console\.log\(texto\)/i);
        });

        it('escreva -> console.log com operação lógica', () => {
            const codigo = ['escreva(1 == 2)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/console\.log\(1 === 2\)/i);
        });

        it('operadores lógicos', () => {
            const codigo = [
                'var soma = 1 + 1',
                'var subtracao = 1 - 1',
                'var diferente = 1 != 1',
                'var igual = 1 == 1',
                'var divisao = 1 / 1',
                'var menor = 1 < 1',
                'var maior = 1 > 1',
                'var maiorOuIgual = 1 >= 1',
                'var menorOuIgual = 1 <= 1',
                'var multiplicacao = 1 * 1',
                'var modulo = 1 % 1',
                'var exponenciacao = 1 ** 1',
                'escreva(soma, subtracao, diferente, igual, divisao, menor, maior, maiorOuIgual, menorOuIgual, multiplicacao, modulo, exponenciacao)',
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let soma = 1 \+ 1/i);
            expect(resultado).toMatch(/let subtracao = 1 - 1/i);
            expect(resultado).toMatch(/let diferente = 1 !== 1/i);
            expect(resultado).toMatch(/let igual = 1 === 1/i);
            expect(resultado).toMatch(/let divisao = 1 \/ 1/i);
            expect(resultado).toMatch(/let menor = 1 < 1/i);
            expect(resultado).toMatch(/let maior = 1 > 1/i);
            expect(resultado).toMatch(/let maiorOuIgual = 1 >= 1/i);
            expect(resultado).toMatch(/let menorOuIgual = 1 <= 1/i);
            expect(resultado).toMatch(/let multiplicacao = 1 \* 1/i);
            expect(resultado).toMatch(/let modulo = 1 % 1/i);
            expect(resultado).toMatch(/let exponenciacao = 1 \** 1/i);
            expect(resultado).toMatch(
                /console\.log\(soma, subtracao, diferente, igual, divisao, menor, maior, maiorOuIgual, menorOuIgual, multiplicacao, modulo, exponenciacao\)/i
            );
        });

        it('chamada de função com parametros -> function', () => {
            const codigo = ['funcao minhaFuncao(a, b, c) { }', 'minhaFuncao(a, b, c)'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/minhaFuncao\(a, b, c\)/i);
        });

        it('chamada de função sem parametros -> function', () => {
            const codigo = ['funcao minhaFuncao() { }', 'minhaFuncao()'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/minhaFuncao()/i);
        });

        it('função com retorno nulo -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna nulo }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return null/i);
        });

        it('função com retorno lógico de texto e número -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == 1 }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return '1' === 1/i);
        });

        it('função com retorno lógico de número -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna 1 == 1 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 1 === 1/i);
        });

        it('função com retorno lógico de texto -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == '1' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return '1' === '1'/i);
        });

        it('função com retorno número -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna 10 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 10/i);
        });

        it('função com retorno texto -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função com retorno -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função -> function - com parametro', () => {
            const retornoLexador = lexador.mapear(
                ['funcao minhaFuncaoComParametro(teste) {', '    escreva(teste)', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/console\.log\(teste\)/i);
        });

        it('função -> function - sem parametro', () => {
            const retornoLexador = lexador.mapear(
                ['funcao minhaFuncaoSemParametro() {', "    escreva('teste')", '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/console\.log\(\'teste\'\)/i);
        });

        it('se -> if, código', () => {
            const retornoLexador = lexador.mapear(['se (a == 1) {', '    escreva(10)', '}'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });

        it('condicional \'se\' com parenteses -> if com operadores lógicos, código', () => {
            const retornoLexador = lexador.mapear(
                [
                    'se (a == 1 ou a == 2) {',
                    'escreva(10)', 
                    '}',
                    'se (a > 0 e a == 3) {',
                    'escreva(5)', 
                    '}'
                ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1 || a === 2/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
            expect(resultado).toMatch(/a === 3 && a > 0/i);
            expect(resultado).toMatch(/console\.log\(5\)/i);
        });

        it('condicional \'se\' sem parenteses -> if com operadores lógicos, código', () => {
            const retornoLexador = lexador.mapear(
                [
                    'se a == 1 ou a == 2 {',
                    'escreva(10)', 
                    '}',
                    'se a > 0 e a == 3 {',
                    'escreva(5)', 
                    '}'
                ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1 || a === 2/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
            expect(resultado).toMatch(/a === 3 && a > 0/i);
            expect(resultado).toMatch(/console\.log\(5\)/i);
        });

        it('importar', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var lodash = importar\(\'lodash\'\)',
                ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let lodash = \'importar\(\) não é suportado por este padrão de JavaScript\'/i);
        });
        
        it('leia', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var nome = leia\(\'Digite seu nome:\'\)',
                ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let nome = \'leia\(\) não é suportado por este padrão de JavaScript.\'/i);
        });
    });
});
