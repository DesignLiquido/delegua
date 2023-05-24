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

        it('Atribuir', () => {
            const retornoLexador = lexador.mapear(
                [
                    'var a = 1',
                    'var b = \'1\'',
                    'var c = verdadeiro',
                    'var d = falso',
                    'var e = nulo',
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
            expect(resultado).toMatch(/e = None/i);
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

        it('função com retorno nulo -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna nulo }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return None/i);
        });

        it('função com retorno lógico de texto e número -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == 1 }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return '1' == 1/i);
        });

        it('função com retorno lógico de número -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna 1 == 1 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 1 == 1/i);
        });

        it('função com retorno lógico de texto -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna '1' == '1' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return '1' == '1'/i);
        });

        it('função com retorno número -> function', () => {
            const codigo = ['funcao minhaFuncao() { retorna 10 }'];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 10/i);
        });

        it('função com retorno texto -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });

        it('função com retorno -> function', () => {
            const codigo = ["funcao minhaFuncao() { retorna 'Ola Mundo!!!' }"];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            const resultado = tradutor.traduzir(retornoAvaliadorSintatico.declaracoes);
            expect(resultado).toBeTruthy();
            expect(resultado).toMatch(/def minhaFuncao\(\):/i);
            expect(resultado).toMatch(/return 'Ola Mundo!!!'/i);
        });
    });
});