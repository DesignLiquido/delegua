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

            it.only('Sucesso - Função com definição de tipos', () => {
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
