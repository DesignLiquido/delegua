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

        it('funções nativas', () => {
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
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/vetor = \[1, 2\]/i);
            expect(resultado).toMatch(/vetor.append\(3\)/i);
            expect(resultado).toMatch(/vetor.append\(4\)/i);
            expect(resultado).toMatch(/vetor.pop\(\)/i);
            expect(resultado).toMatch(/vetor.reverse()/i)
            expect(resultado).toMatch(/2 in vetor/i)
            expect(resultado).toMatch(/vetor.sort()/i)
            expect(resultado).toMatch(/vetor.pop\(0\)/i);


            expect(resultado).toMatch(/nome.upper\(\)/i);
            expect(resultado).toMatch(/nome.lower\(\)/i);
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
            const retornoLexador = lexador.mapear(
                [
                    'se (a == 1) {', 
                    '    escreva(10)', 
                    '}'
                ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/if a \=\= 1:/i);
            expect(resultado).toMatch(/print\(10\)/i);
        });

        it('senão -> else, código', () => {
            const retornoLexador = lexador.mapear(
                [
                    'se (a == 1) {', 
                    '    escreva(10)', 
                    '} senão {', 
                    '    escreva(20)', 
                    '}'
                ],
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

        it('se senão 01 -> if/else, código', () => {
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

        it('se senão 02 -> if/elif/else, código', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 20',
                    'se (a == 10) {',
                    '   escreva(10)',
                    '} senão se (a == 20) {',
                    '   escreva(20)',
                    '} senão se (a == 30) {',
                    '   escreva(30)',
                    '} senão se (a == \'40\') {',
                    '   escreva(\'40\')',
                    '}',
                    'senão {',
                    "   escreva('Não é nenhum desses valores: 10, 20, 30, 40')",
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
            expect(resultado).toMatch(/elif a \=\= \'40\':/i);
            expect(resultado).toMatch(/print\(\'40\'\)/i);
            expect(resultado).toMatch(/else:/i);
            expect(resultado).toMatch(/print\('Não é nenhum desses valores: 10, 20, 30, 40'\)/i);
        });

        it('leia -> input', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var nome = leia(\'Digite seu nome: \')',
                    'escreva(nome)'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/nome = input\(\'Digite seu nome: \'\)/i);
            expect(resultado).toMatch(/print\(nome\)/i);
        });

        it('isto -> this', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Teste {',
                    '    construtor(abc) {',
                    '        isto.valor = abc',
                    '    }',
                    '    mostrarValor() {',
                    '        escreva(isto.valor)',
                    '    }',
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

        it('herda', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    '    corre() {',
                    '        escreva("correndo");',
                    '    }',
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
            expect(resultado).toMatch(/class Animal:/i);
            expect(resultado).toMatch(/def corre\(self\):/i);
            expect(resultado).toMatch(/print\('correndo'\)/i);
            expect(resultado).toMatch(/class Cachorro\(Animal\):/i);
            expect(resultado).toMatch(/pass/i);
            expect(resultado).toMatch(/thor = Cachorro\(\)/i);
            expect(resultado).toMatch(/thor.corre\(\)/i);
        });

        it('método de classe vazio - metodo de classe vazio com \'pass\'', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Cachorro {',
                    '    corre() {',
                    '    }',
                    '}',
                    'var thor = Cachorro();',
                    'thor.corre();',
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/class Cachorro:/i);
            expect(resultado).toMatch(/def corre\(self\):/i);
            expect(resultado).toMatch(/pass/i);
            expect(resultado).toMatch(/thor = Cachorro\(\)/i);
            expect(resultado).toMatch(/thor.corre\(\)/i);
        });

        it('Classes (2)', () => {
            const retornoLexador = lexador.mapear(
                [
                    'classe Animal {',
                    '    correr() {',
                    '        escreva("Correndo Loucamente");',
                    '    }',
                    '}',
                    'classe Cachorro herda Animal {',
                    '    latir() {',
                    '        escreva("Au Au Au Au");',
                    '    }',
                    '}',
                    'var nomeDoCachorro = Cachorro();',
                    'nomeDoCachorro.correr();',
                    'nomeDoCachorro.latir();'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('class Animal:');
            expect(resultado).toContain('    def correr(self):');
            expect(resultado).toContain('        print(\'Correndo Loucamente\')');
            expect(resultado).toContain('class Cachorro(Animal):');
            expect(resultado).toContain('    def latir(self):');
            expect(resultado).toContain('        print(\'Au Au Au Au\')');
            expect(resultado).toContain('nomeDoCachorro = Cachorro()');
            expect(resultado).toContain('nomeDoCachorro.correr()');
            expect(resultado).toContain('nomeDoCachorro.latir()');
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

        it('Comentários', () => {
            const retornoLexador = lexador.mapear(
                [
                    '// Isto é um comentário',
                    'escreva("Código após comentário.");'
                ],
                -1
            );
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('# Isto é um comentário');
        });

        it('Bháskara', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao bhaskara(a,b,c) {',
                    '    var d = b ** 2;',
                    '    var f = 4 * a * c;',
                    '    d = d - f;',
                    '    escreva("O valor de Delta é: " + texto(d));',
                    '    d = d ** 0.5;',
                    '    var x1 = -b + d;',
                    '    x1 = x1 / 2 * a;',
                    '    escreva("O valor de X1 é: "+ texto(x1));',
                    '    var x2 = -b-d;',
                    '    x2 = x2 / 2 * a;',
                    '    escreva("O valor de X2 é: "+ texto(x2));',
                    '    var r1 = x1 ** 2;',
                    '    r1 = a * r1;',
                    '    r1 = b * x1 + r1;',
                    '    r1 = r1 + c;',
                    '    escreva("Substituindo X1 na equação obtém-se:"+ texto(r1));',
                    '    var r2 = x2 ** 2;',
                    '    r2 = a * r2;',
                    '    r2 = b * x2 + r2;',
                    '    r2 = r2 + c;',
                    '    escreva("Substituindo X2 na equação obtém-se:"+ texto(r2));',
                    '}',
                    'var a = 1;',
                    'var b = -1;',
                    'var c = -30;',
                    'bhaskara(a,b,c);',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('print(\'O valor de Delta é: \' + str(d))');
            expect(resultado).toContain('print(\'O valor de X1 é: \' + str(x1))');
            expect(resultado).toContain('print(\'Substituindo X1 na equação obtém-se:\' + str(r1))');
            expect(resultado).toContain('print(\'Substituindo X2 na equação obtém-se:\' + str(r2))');
        });

        it('MergeSort', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var vetor1 = [8, 2, 9, 5];',
                    'var a = 0;',
                    'var aux = 0;',
                    'var i = 0;',
                    'escreva ("Vetor: Posição[0]:" + texto(vetor1[0]));',
                    'escreva ("Vetor: Posição[1]:" + texto(vetor1[1]));',
                    'escreva ("Vetor: Posição[2]:" + texto(vetor1[2]));',
                    'escreva ("Vetor: Posição[3]:" + texto(vetor1[3]));',
                    'para (i = 0; i < 3; i = i + 1) {',
                    '    se (vetor1[i] > vetor1[i+1]) {  ',
                    '        escreva ("Vetor " + texto(i));',
                    '        aux = vetor1[i];',
                    '        vetor1[i] = vetor1[i+1];',
                    '        vetor1[i+1] = aux;',
                    '        escreva(vetor1[i]);',
                    '        escreva(vetor1[i+1]);',
                    '    }',
                    '}',
                    'var vetor2 = [vetor1[0], vetor1[1]];',
                    'var vetor3 = [vetor1[2], vetor1[3]];',
                    'var vetor4 = [];',
                    'para (a = 0; a < 4; a = a + 1) {',
                    '    escreva ("vetor1(" + texto(a) + ")");',
                    '    escreva (vetor1[a]);',
                    '}',
                    'para (a = 0; a < 2; a = a + 1) {',
                    '    escreva ("vetor2(" + texto(a) + ")");',
                    '    escreva (vetor2[a]);',
                    '}',
                    'para (a = 0; a < 2; a = a + 1) {',
                    '    escreva ("vetor3(" + texto(a) + ")");',
                    '    escreva (vetor3[a]);',
                    '}',
                    'se (vetor2[0] < vetor3[0] e vetor2[1] < vetor3[1]) {',
                    '    vetor4[0] = vetor2[0];',
                    '    se (vetor3[0] < vetor2[1]) {',
                    '        vetor4[1] = vetor3[0];',
                    '        vetor4[2] = vetor2[1];',
                    '        vetor4[3] = vetor3[1];',
                    '    } senão {',
                    '        vetor4[1] = vetor2[1];',
                    '        vetor4[2] = vetor3[0];',
                    '        vetor4[3] = vetor3[1];',
                    '    }',
                    '}',
                    'para (a = 0; a < 4; a = a + 1) {',
                    '    escreva ("vetor4(" + texto(vetor4[a]) + ")");',
                    '}',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('vetor1 = [8, 2, 9, 5]');
            expect(resultado).toContain('a = 0');
            expect(resultado).toContain('aux = 0');
            expect(resultado).toContain('i = 0');
            expect(resultado).toContain('print(\'Vetor: Posição[0]:\' + str(vetor1[0]))');
            expect(resultado).toContain('print(\'Vetor: Posição[1]:\' + str(vetor1[1]))');
            expect(resultado).toContain('print(\'Vetor: Posição[2]:\' + str(vetor1[2]))');
            expect(resultado).toContain('print(\'Vetor: Posição[3]:\' + str(vetor1[3]))');
            expect(resultado).toContain('i = 0');
            expect(resultado).toContain('while i < 3:');
            expect(resultado).toContain('    if vetor1[i] > vetor1[i + 1]:');
            expect(resultado).toContain('        print(\'Vetor \' + str(i))');
            expect(resultado).toContain('        aux = vetor1[i]');
            expect(resultado).toContain('        vetor1[i] = vetor1[i + 1]');
            expect(resultado).toContain('        vetor1[i + 1] = aux');
            expect(resultado).toContain('        print(vetor1[i])');
            expect(resultado).toContain('        print(vetor1[i + 1])');
            expect(resultado).toContain('    i = i + 1');
            expect(resultado).toContain('vetor2 = [vetor1[0], vetor1[1]]');
            expect(resultado).toContain('vetor3 = [vetor1[2], vetor1[3]]');
            expect(resultado).toContain('vetor4 = []');
            expect(resultado).toContain('a = 0');
            expect(resultado).toContain('while a < 4:');
            expect(resultado).toContain('    print(\'vetor1(\' + str(a) + \')\')');
            expect(resultado).toContain('    print(vetor1[a])');
            expect(resultado).toContain('    a = a + 1');
            expect(resultado).toContain('a = 0');
            expect(resultado).toContain('while a < 2:');
            expect(resultado).toContain('    print(\'vetor2(\' + str(a) + \')\')');
            expect(resultado).toContain('    print(vetor2[a])');
            expect(resultado).toContain('    a = a + 1');
            expect(resultado).toContain('a = 0');
            expect(resultado).toContain('while a < 2:');
            expect(resultado).toContain('    print(\'vetor3(\' + str(a) + \')\')');
            expect(resultado).toContain('    print(vetor3[a])');
            expect(resultado).toContain('    a = a + 1');
            expect(resultado).toContain('if vetor2[0] < vetor3[0] and vetor2[1] < vetor3[1]:');
            expect(resultado).toContain('    vetor4[0] = vetor2[0]');
            expect(resultado).toContain('    if vetor3[0] < vetor2[1]:');
            expect(resultado).toContain('        vetor4[1] = vetor3[0]');
            expect(resultado).toContain('        vetor4[2] = vetor2[1]');
            expect(resultado).toContain('        vetor4[3] = vetor3[1]');
            expect(resultado).toContain('    else:');
            expect(resultado).toContain('        vetor4[1] = vetor2[1]');
            expect(resultado).toContain('        vetor4[2] = vetor3[0]');
            expect(resultado).toContain('        vetor4[3] = vetor3[1]');
            expect(resultado).toContain('a = 0');
            expect(resultado).toContain('while a < 4:');
            expect(resultado).toContain('    print(\'vetor4(\' + str(vetor4[a]) + \')\')');
            expect(resultado).toContain('    a = a + 1');
        });

        it('Fibonacci', () => {
            const retornoLexador = lexador.mapear(
                [
                    '// Recursão para o cálculo da sequência de Fibonacci',
                    'funcao fibonacci(n) {',
                    '    se (n == 0) {',
                    '        retorna(0);',
                    '    }',
                    '    se (n == 1) {',
                    '        retorna(1);',
                    '    }',
                    '    var n1 = n-1;',
                    '    var n2 = n-2;',
                    '    var f1 = fibonacci(n1);',
                    '    var f2 = fibonacci(n2);',
                    '    retorna(f1 + f2);',
                    '}',
                    'var a = fibonacci(0);',
                    'escreva(a);',
                    'a = fibonacci(1);',
                    'escreva(a);',
                    'a = fibonacci(2);',
                    'escreva(a);',
                    'a = fibonacci(3);',
                    'escreva(a);',
                    'a = fibonacci(4);',
                    'escreva(a);',
                    'a = fibonacci(5);',
                    'escreva(a);',
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('# Recursão para o cálculo da sequência de Fibonacci');
            expect(resultado).toContain('def fibonacci(n):');
            expect(resultado).toContain('    if n == 0:');
            expect(resultado).toContain('        return 0');
            expect(resultado).toContain('    if n == 1:');
            expect(resultado).toContain('        return 1');
            expect(resultado).toContain('    n1 = n - 1');
            expect(resultado).toContain('    n2 = n - 2');
            expect(resultado).toContain('    f1 = fibonacci(n1)');
            expect(resultado).toContain('    f2 = fibonacci(n2)');
            expect(resultado).toContain('    return f1 + f2');
            expect(resultado).toContain('a = fibonacci(0)');
            expect(resultado).toContain('print(a)');
            expect(resultado).toContain('a = fibonacci(1)');
            expect(resultado).toContain('print(a)');
            expect(resultado).toContain('a = fibonacci(2)');
            expect(resultado).toContain('print(a)');
            expect(resultado).toContain('a = fibonacci(3)');
            expect(resultado).toContain('print(a)');
            expect(resultado).toContain('a = fibonacci(4)');
            expect(resultado).toContain('print(a)');
            expect(resultado).toContain('a = fibonacci(5)');
            expect(resultado).toContain('print(a)');
        });

        it('Perceptron', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var pesoInicial1 = 0.3;',
                    'var pesoInicial2 = 0.4;',
                    'var entrada1 = 1;',
                    'var entrada2 = 1;',
                    'var erro = 1;',
                    'var resultadoEsperado;',
                    'enquanto (erro != 0) {',
                    '    se (entrada1 == 1) {',
                    '        se (entrada2 == 1) {',
                    '            resultadoEsperado = 1;',
                    '        }',
                    '    } senão {',
                    '        resultadoEsperado = 0;',
                    '    }',
                    '    var somatoria = pesoInicial1 * entrada1;',
                    '    somatoria = pesoInicial2 * entrada2 + somatoria;',
                    '    var resultado;',
                    '    se (somatoria < 1) {',
                    '        resultado = 0;',
                    '    } senão {',
                    '        se (somatoria >= 1) {',
                    '            resultado = 1;',
                    '        }',
                    '    }',
                    '    escreva("resultado: " + texto(resultado));',
                    '    erro = resultadoEsperado - resultado;',
                    '    escreva("p1: " + texto(pesoInicial1));',
                    '    escreva("p2: " + texto(pesoInicial2));',
                    '    pesoInicial1 = 0.1 * entrada1 * erro + pesoInicial1;',
                    '    pesoInicial2 = 0.1 * entrada2 * erro + pesoInicial2;',
                    '    escreva("erro: " + texto(erro));',
                    '}'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('pesoInicial1 = 0.3');
            expect(resultado).toContain('pesoInicial2 = 0.4');
            expect(resultado).toContain('entrada1 = 1');
            expect(resultado).toContain('entrada2 = 1');
            expect(resultado).toContain('erro = 1');
            expect(resultado).toContain('resultadoEsperado = None');
            expect(resultado).toContain('while erro != 0:');
            expect(resultado).toContain('    if entrada1 == 1:');
            expect(resultado).toContain('        if entrada2 == 1:');
            expect(resultado).toContain('            resultadoEsperado = 1');
            expect(resultado).toContain('    else:');
            expect(resultado).toContain('        resultadoEsperado = 0');
            expect(resultado).toContain('    somatoria = pesoInicial1 * entrada1');
            expect(resultado).toContain('    somatoria = pesoInicial2 * entrada2 + somatoria');
            expect(resultado).toContain('    resultado = None');
            expect(resultado).toContain('    if somatoria < 1:');
            expect(resultado).toContain('        resultado = 0');
            expect(resultado).toContain('    else:');
            expect(resultado).toContain('        if somatoria >= 1:');
            expect(resultado).toContain('            resultado = 1');
            expect(resultado).toContain('    print(\'resultado: \' + str(resultado))');
            expect(resultado).toContain('    erro = resultadoEsperado - resultado');
            expect(resultado).toContain('    print(\'p1: \' + str(pesoInicial1))');
            expect(resultado).toContain('    print(\'p2: \' + str(pesoInicial2))');
            expect(resultado).toContain('    pesoInicial1 = 0.1 * entrada1 * erro + pesoInicial1');
            expect(resultado).toContain('    pesoInicial2 = 0.1 * entrada2 * erro + pesoInicial2');
            expect(resultado).toContain('    print(\'erro: \' + str(erro))');
        });

        it('Fila Estática', () => {
            const retornoLexador = lexador.mapear(
                [
                    'funcao enfileirar (valorEntrada) {',
                    '    se (indexFinal == maximoDeElementos) {',
                    '        escreva("Fila Cheia");',
                    '    } senao {',
                    '        filaEstatica[indexFinal] = valorEntrada;',
                    '        escreva("Valor inserido com sucesso: " + texto(filaEstatica[indexFinal]));',
                    '        retorna indexFinal = indexFinal + 1;',
                    '    }',
                    '}',
                    'função desenfileirar() {',
                    '    se (indexInicial == indexFinal) {',
                    '        escreva("Fila Vazia");',
                    '    } senao {',
                    '        para (i = 0; i <= indexFinal; i = i + 1){',
                    '            se (i + 1 == indexFinal) {',
                    '                indexFinal = indexFinal - 1;',
                    '                escreva("Valor retirado com sucesso.");',
                    '            } senao {',
                    '                filaEstatica[i] = filaEstatica[i+1];',
                    '            }',
                    '        }',
                    '    }',
                    '}',
                    'função mostrar_fila() {',
                    '    se (indexInicial == indexFinal) {',
                    '        escreva("Fila Vazia");',
                    '    } senao {',
                    '        para (var i = 0; i < indexFinal; i = i + 1) {',
                    '            escreva("index " + texto(i)); ',
                    '            escreva(texto(filaEstatica[i]));',
                    '        }',
                    '    }',
                    '}',
                    'var maximoDeElementos = 4;',
                    'var indexInicial = 0;',
                    'var indexFinal = 0;',
                    '// Variavel de controle em iterações',
                    'var i = 0;',
                    'var filaEstatica = [];',
                    '// Demonstração de uso das funções:',
                    'mostrar_fila();',
                    'var valorEntrada = 2;',
                    'enfileirar(valorEntrada);',
                    'var valorEntrada = 8;',
                    'enfileirar(valorEntrada);',
                    'var valorEntrada = 23;',
                    'enfileirar(valorEntrada);',
                    'var valorEntrada = 7;',
                    'enfileirar(valorEntrada);',
                    'mostrar_fila();',
                    'desenfileirar();',
                    'mostrar_fila();',
                    'var valorEntrada = 24;',
                    'enfileirar(valorEntrada);',
                    'mostrar_fila();'
                ],
                -1
            );

            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toContain('def enfileirar(valorEntrada):');
            expect(resultado).toContain('    if indexFinal == maximoDeElementos:');
            expect(resultado).toContain('        print(\'Fila Cheia\')');
            expect(resultado).toContain('    else:');
            expect(resultado).toContain('        filaEstatica[indexFinal] = valorEntrada');
            expect(resultado).toContain('        print(\'Valor inserido com sucesso: \' + str(filaEstatica[indexFinal]))');
            expect(resultado).toContain('        return indexFinal = indexFinal + 1');
            expect(resultado).toContain('def desenfileirar():');
            expect(resultado).toContain('    if indexInicial == indexFinal:');
            expect(resultado).toContain('        print(\'Fila Vazia\')');
            expect(resultado).toContain('    else:');
            expect(resultado).toContain('        i = 0');
            expect(resultado).toContain('        while i <= indexFinal:');
            expect(resultado).toContain('            if i + 1 == indexFinal:');
            expect(resultado).toContain('                indexFinal = indexFinal - 1');
            expect(resultado).toContain('                print(\'Valor retirado com sucesso.\')');
            expect(resultado).toContain('            else:');
            expect(resultado).toContain('                filaEstatica[i] = filaEstatica[i + 1]');
            expect(resultado).toContain('            i = i + 1');
            expect(resultado).toContain('def mostrar_fila():');
            expect(resultado).toContain('    if indexInicial == indexFinal:');
            expect(resultado).toContain('        print(\'Fila Vazia\')');
            expect(resultado).toContain('    else:');
            expect(resultado).toContain('        i = 0');
            expect(resultado).toContain('        while i < indexFinal:');
            expect(resultado).toContain('            print(\'index \' + str(i))');
            expect(resultado).toContain('            print(str(filaEstatica[i]))');
            expect(resultado).toContain('            i = i + 1');
            expect(resultado).toContain('maximoDeElementos = 4');
            expect(resultado).toContain('indexInicial = 0');
            expect(resultado).toContain('indexFinal = 0');
            expect(resultado).toContain('# Variavel de controle em iterações');
            expect(resultado).toContain('i = 0');
            expect(resultado).toContain('filaEstatica = []');
            expect(resultado).toContain('# Demonstração de uso das funções:');
            expect(resultado).toContain('mostrar_fila()');
            expect(resultado).toContain('valorEntrada = 2');
            expect(resultado).toContain('enfileirar(valorEntrada)');
            expect(resultado).toContain('valorEntrada = 8');
            expect(resultado).toContain('enfileirar(valorEntrada)');
            expect(resultado).toContain('valorEntrada = 23');
            expect(resultado).toContain('enfileirar(valorEntrada)');
            expect(resultado).toContain('valorEntrada = 7');
            expect(resultado).toContain('enfileirar(valorEntrada)');
            expect(resultado).toContain('mostrar_fila()');
            expect(resultado).toContain('desenfileirar()');
            expect(resultado).toContain('mostrar_fila()');
            expect(resultado).toContain('valorEntrada = 24');
            expect(resultado).toContain('enfileirar(valorEntrada)');
            expect(resultado).toContain('mostrar_fila()');
        });
    });
});
