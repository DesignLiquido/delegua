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
        });
    });
});
