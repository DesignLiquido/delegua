import { AvaliadorSintaticoBirl } from '../../fontes/avaliador-sintatico/dialetos';
import { LexadorBirl } from '../../fontes/lexador/dialetos';
import { InterpretadorBirl } from '../../fontes/interpretador/dialetos';

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorBirl;
        let avaliadorSintatico: AvaliadorSintaticoBirl;
        let interpretador: InterpretadorBirl;

        describe('Cenário de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorBirl();
                avaliadorSintatico = new AvaliadorSintaticoBirl();
                interpretador = new InterpretadorBirl(process.cwd());
            });

            it('Sucesso - Hello, World! Porra!', async () => {
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

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Variavel - Numero', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'HORA DO SHOW \n',
                        '  MONSTRO M1 = 1; \n',
                        '  CE QUER VER ESSA PORRA? (M1); \n',
                        '  BORA CUMPADE 0; \n',
                        'BIRL \n',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            })

            it('Sucesso - Variavel - String', async () => {
                const retornoLexador = lexador.mapear([
                    'HORA DO SHOW \n',
                    "   FRANGO FR = 'testes';\n",
                    '   CE QUER VER ESSA PORRA? (FR); \n',
                    '   BORA CUMPADE 0; \n',
                    'BIRL \n',
                ]);
                //  FRANGO esta vindo como um indentificador
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
