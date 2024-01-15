import { LexadorMapler } from '../../fontes/lexador/dialetos';
import { AvaliadorSintaticoMapler } from '../../fontes/avaliador-sintatico/dialetos';
import { AnalisadorSemanticoMapler } from '../../fontes/analisador-semantico/dialetos';
import { DiagnosticoSeveridade } from '../../fontes/interfaces/erros';

describe('Analisador semântico (Mapler)', () => {
    let lexadorMapler: LexadorMapler;
    let avaliadorSintaticoMapler: AvaliadorSintaticoMapler;
    let analisadorSemanticoMapler: AnalisadorSemanticoMapler;

    describe('analisar()', () => {
        beforeEach(() => {
            lexadorMapler = new LexadorMapler();
            avaliadorSintaticoMapler = new AvaliadorSintaticoMapler();
            analisadorSemanticoMapler = new AnalisadorSemanticoMapler();
        });

        describe('Cenários de falha', () => {
            it('Atribuição inválida de número para texto', () => {
                const retornoLexador = lexadorMapler.mapear([
                    'variaveis',
                    'idade: real;',
                    'inicio',
                    'idade <- "abc";',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintaticoMapler.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemanticoMapler.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });

            it('Variável indefinida, não declarada', () => {
                const retornoLexador = lexadorMapler.mapear([
                    'variaveis',
                    'nome: cadeia;',
                    'inicio',
                    'NOME <- "abc";',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintaticoMapler.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemanticoMapler.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.diagnosticos).toHaveLength(1);
            });
        })
    })
})