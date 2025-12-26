import { AvaliadorSintaticoCalango } from '../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango';
import { LexadorCalango } from '../../fontes/lexador/dialetos';
import { InterpretadorBase } from '../../fontes/interpretador/interpretador-base';

describe.skip('Interpretador (Calango)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;
        let interpretador: InterpretadorBase;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorCalango();
            avaliadorSintatico = new AvaliadorSintaticoCalango();
            interpretador = new InterpretadorBase(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            it('escreva()', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'escreva("Ola Mundo");',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

                interpretador.funcaoDeRetorno = (saida: string) => {
                    expect(saida).toEqual('Ola mundo');
                };

                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it.skip('Sucesso - Condicionais (se, senao)', async () => {
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = ['40'];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    },
                };

                const retornoLexador = lexador.mapear(
                    [
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
                        'fimPrincipal',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

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

                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro idade;',
                        'escreva("Informe sua idade: ");',
                        'leia(idade);',
                        'se (idade >= 18) entao',
                        'escreval("maior de idade");',
                        'senao',
                        'escreval("menor de idade");',
                        'fimSe',
                        'fimPrincipal',
                    ],
                    -1
                );

                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(2);
                expect(_saidas[0]).toBe("Informe sua idade:");
                expect(_saidas[1]).toBe("menor de idade");
            });
        });
    });
});
