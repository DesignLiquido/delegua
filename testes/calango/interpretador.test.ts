import { AvaliadorSintaticoCalango } from "../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango";
import { LexadorCalango } from "../../fontes/lexador/dialetos";
import { InterpretadorBase } from "../../fontes/interpretador/interpretador-base"

describe('Interpretador (Calango)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;
        let interpretador: InterpretadorBase;

        describe('Cenários de sucesso', () => {
            beforeEach(() => {
                lexador = new LexadorCalango();
                avaliadorSintatico = new AvaliadorSintaticoCalango();
                interpretador = new InterpretadorBase(process.cwd());
            });

            it('escreva()', async () => {
                const retornoLexador = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'escreva("Ola Mundo");',
                    'fimPrincipal'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual("Ola mundo")
                }

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Sucesso - Condicionais (se, senao)', async () => {
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = ['40'];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    },
                };

                const retornoLexador = lexador.mapear([
                    'algoritmo tituloDoAlgoritmo;', 
                    'principal', 
                    'inteiro idade;', 
                    'escreva("Informe sua idade: ");',
                    'leia(idade);',
                    'se (idade >= 18) entao',
                        'escreval("maior de idade");',
                    'senao',
                        'se (idade <= 0) entao',
                            'escreval("valor invalido");',
                        'senao',
                            'escreval("menor de idade");',
                        'fimSe',
                    'fimSe',
                    'fimPrincipal'
                ], -1);

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});