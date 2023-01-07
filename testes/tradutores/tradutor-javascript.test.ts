import { Binario, Variavel, Literal } from '../../fontes/construtos';
import { Se, Bloco, Escreva } from '../../fontes/declaracoes';
import { Simbolo } from '../../fontes/lexador';
import { TradutorJavaScript } from '../../fontes/tradutores/tradutor-javascript';

import tiposDeSimbolos from '../../fontes/tipos-de-simbolos/delegua';
import { Delegua } from '../../fontes/delegua';

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
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it('para/sustar -> for/break', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'para (var i = 0; i < 5; i = i + 1) {',
                        'se(i == 3) {',
                            'sustar;',
                        '}',
                        'escreva(i);',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/break/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('para/continue -> for/continue', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'para (var i = 0; i < 5; i = i + 1) {',
                        'se(i == 3) {',
                            'continua',
                        '}',
                        'escreva(i);',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/continue/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('para -> for', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'para (var i = 0; i < 5; i = i + 1) {',
                        'escreva(i);',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/for (let i = 0; i < 5; i = i + 1) {/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
        });

        it('enquanto -> while', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'var i = 0;',
                    'fazer {',
                        'escreva(i);',
                        'i = i + 1;',
                    '} enquanto (i < 5)'
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let i = 0/i);
            expect(resultado).toMatch(/do {/i);
            expect(resultado).toMatch(/console\.log\(i\)/i);
            // expect(resultado).toMatch(/i = i + 1/i);
            expect(resultado).toMatch(/}/i);
            expect(resultado).toMatch(/while \(i < 5\)/i);
        });

        it('enquanto -> do while', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'enquanto (verdadeiro) {',
                        'escreva("sim");',
                    '}'
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/while \(true\) {/i);
            expect(resultado).toMatch(/console\.log\('sim'\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('enquanto -> while', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'enquanto (verdadeiro) {',
                        'escreva(\'sim\');',
                    '}'
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/while (true) {/i);
            expect(resultado).toMatch(/console\.log\(\'sim\'\)/i);
            expect(resultado).toMatch(/}/i);
        });

        it('tente - pegue - finalmente -> try - catch - finally', () => {
            const retornoLexador = delegua.lexador.mapear(
                [
                    'tente { ',
                        '1 > "2";',                      
                        'escreva("sucesso");',
                    '}',
                    'pegue {',
                        'escreva("Ocorreu uma exceção.");',
                    '} finalmente {',
                        'escreva("Ocorrendo exceção ou não, eu sempre executo");',
                    '}',
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

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
            const retornoLexador = delegua.lexador.mapear(
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
                    '}'
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

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
            const retornoLexador = delegua.lexador.mapear(
                [
                    'classe Teste {',
                        'construtor(valor1) {',
                            'escreva("começou")',
                        '}',
                        'testeFuncao(valor2) {',
                            'escreva("olá");',
                            'retorna \'teste\'',
                        '}',
                    '}'
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

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
            const retornoLexador = delegua.lexador.mapear(
                [
                    'classe Teste {',
                        'construtor() {',
                            'escreva("começou")',
                        '}',
                    '}'
                ],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/export class Teste {/i);
            expect(resultado).toMatch(/constructor()/i);
            expect(resultado).toMatch(/console\.log\('começou'\)/i);
        });

        it('se -> if, código', () => {
            const retornoLexador = delegua.lexador.mapear(['se (a == 1) {', '    escreva(10)', '}'], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });

        it('senão -> else, código', () => {
            const retornoLexador = delegua.lexador.mapear(
                ['se (a == 1) {', '    escreva(10)', '} senão {', '   escreva(20)', '}'],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
            expect(resultado).toMatch(/else/i);
            expect(resultado).toMatch(/console\.log\(20\)/i);
        });

        it('se senão 01 -> if else, código', () => {
            const retornoLexador = delegua.lexador.mapear(
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
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

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
            const retornoLexador = delegua.lexador.mapear(
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
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

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
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/let texto = 'Olá Mundo'/i);
            expect(resultado).toMatch(/console\.log\(texto\)/i);
        });

        it('escreva -> console.log com operação lógica', () => {
            const codigo = ['escreva(1 == 2)'];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

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
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            // expect(resultado).toMatch(/let soma = 1 + 1/i);
            expect(resultado).toMatch(/let subtracao = 1 - 1/i);
            // expect(resultado).toMatch(/let diferente = 1 !== 1/i);
            // expect(resultado).toMatch(/let igual = 1 === 1/i);
            // expect(resultado).toMatch(/let divisao = 1 / 1/i);
            expect(resultado).toMatch(/let menor = 1 < 1/i);
            expect(resultado).toMatch(/let maior = 1 > 1/i);
            // expect(resultado).toMatch(/let maiorOuIgual = 1 >= 1/i);
            // expect(resultado).toMatch(/let menorOuIgual = 1 <= 1/i);
            // expect(resultado).toMatch(/let multiplicacao = 1 * 1/i);
            // expect(resultado).toMatch(/let modulo = 1 % 1/i);
            // expect(resultado).toMatch(/let exponenciacao = 1 ** 1/i);
            expect(resultado).toMatch(
                /console\.log\(soma, subtracao, diferente, igual, divisao, menor, maior, maiorOuIgual, menorOuIgual, multiplicacao, modulo, exponenciacao\)/i
            );
        });

        it('chamada de função com parametros -> function', () => {
            const codigo = ['funcao minhaFuncao(a, b, c) { }', 'minhaFuncao(a, b, c)'];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/minhaFuncao\(a, b, c\)/i);
        });

        it('chamada de função sem parametros -> function', () => {
            const codigo = ['funcao minhaFuncao() { }', 'minhaFuncao()'];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/minhaFuncao()/i);
        });

        it('função com retorno nulo -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna nulo }'];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return null/i);
        });

        it('função com retorno lógico de texto e número -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == 1 }"];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return '1' === 1/i);
        });

        it('função com retorno lógico de número -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna 1 == 1 }'];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 1 === 1/i);
        });

        it('função com retorno lógico de texto -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == '1' }"];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return '1' === '1'/i);
        });

        it('função com retorno número -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna 10 }'];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 10/i);
        });

        it('função com retorno texto -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função com retorno -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função -> function - com parametro', () => {
            const retornoLexador = delegua.lexador.mapear(
                ['funcao minhaFuncaoComParametro(teste) {', '    escreva(teste)', '}'],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/console\.log\(teste\)/i);
        });

        it('função -> function - sem parametro', () => {
            const retornoLexador = delegua.lexador.mapear(
                ['funcao minhaFuncaoSemParametro() {', "    escreva('teste')", '}'],
                -1
            );
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/function/i);
            expect(resultado).toMatch(/minhaFuncao/i);
            expect(resultado).toMatch(/console\.log\(\'teste\'\)/i);
        });

        it('se -> if, código', () => {
            const retornoLexador = delegua.lexador.mapear(['se (a == 1) {', '    escreva(10)', '}'], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if/i);
            expect(resultado).toMatch(/a === 1/i);
            expect(resultado).toMatch(/console\.log\(10\)/i);
        });
    });
});
