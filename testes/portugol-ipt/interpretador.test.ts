import { AvaliadorSintaticoPortugolIpt } from "../../fontes/avaliador-sintatico/dialetos";
// import { InterpretadorBase } from "../../fontes/interpretador";
import { InterpretadorPortugolIpt } from "../../fontes/interpretador/dialetos";
import { LexadorPortugolIpt } from "../../fontes/lexador/dialetos";

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPortugolIpt;
        let avaliadorSintatico: AvaliadorSintaticoPortugolIpt;
        let interpretador: InterpretadorPortugolIpt;

        describe('Cenários de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorPortugolIpt();
                avaliadorSintatico = new AvaliadorSintaticoPortugolIpt();
                interpretador = new InterpretadorPortugolIpt(process.cwd());
            });

            it('Trivial', async () => {
                const retornoLexador = lexador.mapear([
                    'inicio',
                    'escrever "Olá mundo"',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("Olá mundo")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Idade', async () => {
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = [
                    19
                ];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.pop());
                    }
                };

                const retornoLexador = lexador.mapear([
                    'inicio\n',
                    '    inteiro idade\n',
                    '    escrever "Qual é a sua idade?"\n',
                    '    ler idade\n',
                    '    se (idade >= 18) então\n',
                    '        escrever "Você é maior de idade"\n',
                    '    senão\n',
                    '        escrever "Você é menor de idade"\n',
                    '    fimse\n',
                    'fim'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("Você é maior de idade")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});