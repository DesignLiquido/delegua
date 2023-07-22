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

            it('Sucesso - Atribuindo variável que não existe', () => {
                const retornoLexador = lexador.mapear([
                    "b = 1"
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
    
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros).toHaveLength(1);
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

            it.skip('Retorno vazio', () => {
                const retornoLexador = lexador.mapear([
                    "funcao olaMundo (): vazio {",
                    "   retorna \"Olá Mundo!!!\"",
                    "}",
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);
    
                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros).toHaveLength(1);
            });
        });
    });
});
