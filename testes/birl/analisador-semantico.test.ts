import { AnalisadorSemanticoBirl } from '../../fontes/analisador-semantico/dialetos';
import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorBirl } from '../../fontes/lexador/dialetos';

describe('Analisador semântico', () => {
    let lexador: LexadorBirl;
    let avaliadorSintatico: AvaliadorSintaticoBirl;
    let analisadorSemantico: AnalisadorSemanticoBirl;

    describe('analisar()', () => {
        beforeEach(() => {
            lexador = new LexadorBirl();
            avaliadorSintatico = new AvaliadorSintaticoBirl();
            analisadorSemantico = new AnalisadorSemanticoBirl();
        });

        describe('Cenários de sucesso', () => {
            it('Sucesso - Olá Mundo', () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW',
                        '  CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n");',
                        '  BORA CUMPADE 0;',
                        'BIRL',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros).toHaveLength(0);
            });
            it('Sucesso - Verifica tipo LEIA', () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW',
                    '   MONSTRO X;',
                    '   QUE QUE CE QUER MONSTRAO? ("%d", &X);',
                    '   BORA CUMPADE 0;',
                    'BIRL',
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoAnalisadorSemantico = analisadorSemantico.analisar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoAnalisadorSemantico).toBeTruthy();
                expect(retornoAnalisadorSemantico.erros).toHaveLength(0);
            });
        });
    });
});
