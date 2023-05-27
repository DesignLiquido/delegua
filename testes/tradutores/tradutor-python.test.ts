import { AvaliadorSintatico } from '../../fontes/avaliador-sintatico';
import { Lexador } from '../../fontes/lexador';
import { TradutorPython } from '../../fontes/tradutores';

describe('Tradutor Delégua -> Python', () => {
    const tradutor: TradutorPython = new TradutorPython();

    describe('Código', () => {
        let lexador: Lexador;
        let avaliadorSintatico: AvaliadorSintatico;

        beforeEach(() => {
            lexador = new Lexador();
            avaliadorSintatico = new AvaliadorSintatico();
        });

        it('Olá mundo', () => {
            const retornoLexador = lexador.mapear(
                ['escreva("Olá mundo")'], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/print\('Olá mundo'\)/i);
        });

        it('Agrupamento', () => {
            const retornoLexador = lexador.mapear(
                ['escreva((2 * 3) + (4 ^ 2))'], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/print\(\(2 \* 3\) \+ \(4 \^ 2\)\)/i);
        });

        it('Nome variáveis', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var NOME1;',
                    'var nomeCompleto1;',
                    'var NomeCompleto2;',

                    'const NOME2 = \'delegua\';',
                    'const nomeCompleto3 = \'delegua completo3\';',
                    'const NomeCompleto4 = \'delegua completo4\';',
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/nome1/i);
            expect(resultado).toMatch(/nome_completo1/i);
            expect(resultado).toMatch(/nome_completo2/i);
            expect(resultado).toMatch(/nome2/i);
            expect(resultado).toMatch(/nome_completo3/i);
            expect(resultado).toMatch(/nome_completo4/i);
        });

        it('Atribuir', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 1',
                    'var b = \'1\'',
                    'var c = verdadeiro',
                    'var d = falso',
                    'var f = nulo',
                    'const g = \'olá\'',
                    '2 * 2'
                ], 
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/a = 1/i);
            expect(resultado).toMatch(/b = \'1\'/i);
            expect(resultado).toMatch(/c = True/i);
            expect(resultado).toMatch(/d = False/i);
            expect(resultado).toMatch(/f = None/i);
            expect(resultado).toMatch(/g = \'olá\'/i);
            expect(resultado).toMatch(/2 \* 2/i);
        });

        it('Escreva verdadeiro e falso com operadores lógicos', () => {
            const retornoLexador = lexador.mapear(
                [
                    'escreva(falso)',
                    'escreva(verdadeiro)',
                    'escreva(verdadeiro == verdadeiro)',
                    'escreva(verdadeiro != verdadeiro)',
                    'escreva(falso == falso)',
                    'escreva(falso != falso)',
                    'escreva(verdadeiro e falso)',
                    'escreva(verdadeiro ou falso)',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/print\(False\)/i);
            expect(resultado).toMatch(/print\(True\)/i);
            expect(resultado).toMatch(/print\(True == True\)/i);
            expect(resultado).toMatch(/print\(True != True\)/i);
            expect(resultado).toMatch(/print\(False == False\)/i);
            expect(resultado).toMatch(/print\(False != False\)/i);
            expect(resultado).toMatch(/print\(True and False\)/i);
            expect(resultado).toMatch(/print\(True or False\)/i);
        });

        it('Escreva verdadeiro e falso com operadores lógicos', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao olaMundo () {',
                    'escreva(\'Olá Mundo!!!\')',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def olaMundo\(\):/i);
            expect(resultado).toMatch(/print\(\'Olá Mundo!!!\'\)/i);
        });

        it('Escreva verdadeiro e falso com operadores lógicos', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao olaMundo (textoQualquer) {',
                    'escreva(\'Olá Mundo!!!\', textoQualquer)',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);

            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def olaMundo\(textoQualquer\):/i);
            expect(resultado).toMatch(/print\(\'Olá Mundo!!!\', textoQualquer\)/i);
        });

        it('Para Cada \'em\' - vetor variável', async () => {
            const retornoLexador = lexador.mapear([
                "para cada elemento em [1, 2, 3] {",
                "   escreva('Valor: ', elemento)",
                "}",
            ], -1);

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/for elemento in \[1, 2, 3\]:/i);
            expect(resultado).toMatch(/print\(\'Valor: \', elemento\)/i);
        });

        it('função com retorno nulo -> def', () => {
            const codigo = ['funcao minhaFuncao() { retorna nulo }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return None/i);
        });

        it('função com retorno lógico de texto e número -> def', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == 1 }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return '1' == 1/i);
        });

        it('função com retorno lógico de número -> def', () => {
            const codigo = ['funcao minhaFuncao() { retorna 1 == 1 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 1 == 1/i);
        });

        it('função com retorno lógico de texto -> def', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == '1' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return '1' == '1'/i);
        });

        it('função com retorno número -> def', () => {
            const codigo = ['funcao minhaFuncao() { retorna 10 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 10/i);
        });

        it('função com retorno texto -> def', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função com retorno -> def', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função com retorno -> def', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('chamada de função -> def', () => {
            const codigo = [
                "funcao minhaFuncao() { retorna 'Ola Mundo!!!' }",
                "minhaFuncao()",
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
            expect(resultado).toMatch(/minhaFuncao\(\)/i);
        });

        it('chamada de função com parametros-> def', () => {
            const codigo = [
                "funcao minhaFuncao(textoQualquer) { retorna textoQualquer }",
                "minhaFuncao('Olá Mundo!!!')",
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(textoQualquer\):/i);
            expect(resultado).toMatch(/return textoQualquer/i);
            expect(resultado).toMatch(/minhaFuncao\(\'Olá Mundo!!!\'\)/i);
        });

        it('se -> if, código', () => {
            const retornoLexador = lexador.mapear(['se (a == 1) {', '    escreva(10)', '}'], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if a \=\= 1:/i);
            expect(resultado).toMatch(/print\(10\)/i);
        });

        it('senão -> else, código', () => {
            const retornoLexador = lexador.mapear(
                ['se (a == 1) {', '    escreva(10)', '} senão {', '   escreva(20)', '}'],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if a \=\= 1:/i);
            expect(resultado).toMatch(/print\(10\)/i);
            expect(resultado).toMatch(/else:/i);
            expect(resultado).toMatch(/print\(20\)/i);
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
            expect(resultado).toMatch(/if a \=\= 10:/i);
            expect(resultado).toMatch(/print\(10\)/i);
            expect(resultado).toMatch(/elif a \=\= 20:/i);
            expect(resultado).toMatch(/print\(20\)/i);
            expect(resultado).toMatch(/else:/i);
            expect(resultado).toMatch(/print\('Não é 10 e não é 20'\)/i);
        });

        it.skip('se senão 02 -> if else, código', () => {
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
            expect(resultado).toMatch(/if a \=\= 10:/i);
            expect(resultado).toMatch(/print\(10\)/i);
            expect(resultado).toMatch(/elif a \=\= 20:/i);
            expect(resultado).toMatch(/print\(20\)/i);
            expect(resultado).toMatch(/elif a \=\= 30:/i);
            expect(resultado).toMatch(/print\(30\)/i);
            expect(resultado).toMatch(/else:/i);
            expect(resultado).toMatch(/print\('Não é nenhum desses valores: 10, 20, 30'\)/i);
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
            expect(resultado).toMatch(/class Teste:/i);
            expect(resultado).toMatch(/def __init__\(self, abc\):/i);
            expect(resultado).toMatch(/self.valor = abc/i);
            expect(resultado).toMatch(/def mostrarValor\(self\):/i);
            expect(resultado).toMatch(/print\(self.valor\)/i);
            expect(resultado).toMatch(/teste = Teste\(100\)/i);
            expect(resultado).toMatch(/teste.mostrarValor\(\)/i);
        });

        it('tente - pegue - finalmente -> try - except - finally', () => {
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
            expect(resultado).toMatch(/try:/i);
            expect(resultado).toMatch(/1 > \'2\'/i);
            expect(resultado).toMatch(/print\('sucesso'\)/i);
            expect(resultado).toMatch(/except:/i);
            expect(resultado).toMatch(/print\('Ocorreu uma exceção.'\)/i);
            expect(resultado).toMatch(/finally:/i);
            expect(resultado).toMatch(/print\('Ocorrendo exceção ou não, eu sempre executo'\)/i);
        });
    });
});