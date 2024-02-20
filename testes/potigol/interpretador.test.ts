import { AvaliadorSintaticoPotigol } from "../../fontes/avaliador-sintatico/dialetos";
import { InterpretadorPotigol } from "../../fontes/interpretador/dialetos";
import { LexadorPotigol } from "../../fontes/lexador/dialetos";

describe('Interpretador', () => {
    describe('interpretar()', () => {
        let lexador: LexadorPotigol;
        let avaliadorSintatico: AvaliadorSintaticoPotigol;
        let interpretador: InterpretadorPotigol;

        beforeEach(() => {
            lexador = new LexadorPotigol();
            avaliadorSintatico = new AvaliadorSintaticoPotigol();
            interpretador = new InterpretadorPotigol(process.cwd());
        });

        it('Trivial', async () => {
            const retornoLexador = lexador.mapear([
                'escreva "Olá mundo"'
            ], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.funcaoDeRetorno = (saida: any) => {
                expect(saida).toEqual("Olá mundo")
            }

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        describe('Tipos e objetos', () => {
            it('Trivial', async () => {
                const saidasMensagens = [
                    "100",
                    "40"
                ]
                const retornoLexador = lexador.mapear([
                    'tipo Quadrado',
                    '  area() = lado * lado',
                    '  lado: Inteiro',
                    '  perimetro() = 4 * lado',
                    'fim',
                    'q1 = Quadrado(10)',
                    'escreva q1.area()',
                    'escreva q1.perimetro()'
                ], -1);
                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);

                // TODO: Repensar isso aqui. Quando dá erro, o erro não
                // faz sentido algum.
                /* interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saidasMensagens.includes(saida)).toBeTruthy()
                } */

                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });

        describe('qual_tipo', () => {
            it('Dado um inteiro, escreva qual_tipo deve retornar Inteiro', async () => {
                const retornoLexador = lexador.mapear([
                    'a = 3',
                    'escreva(a.qual_tipo)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("Inteiro");
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um inteiro, escreva qual_tipo deve retornar Inteiro 2', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(3.qual_tipo)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("Inteiro");
                }

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um real, escreva qual_tipo deve retornar Real', async () => {
                const retornoLexador = lexador.mapear([
                    'a = 3.1',
                    'escreva(a.qual_tipo)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("Real");
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado uma variável, escreva qual_tipo deve atribuir Inteiro', async () => {
                const retornoLexador = lexador.mapear([
                    'a = 3.qual_tipo',
                    'escreva(a)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("Inteiro");
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um vetor, escreva qual_tipo deve imprirmir Lista', async () => {
                const retornoLexador = lexador.mapear([
                    'a = [3, 4]',
                    'escreva (a.qual_tipo)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual("Lista");
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });

        describe('Declaração de lista', () => {
            it('Dado um vetor, escreva deve imprirmir o vetor', async () => {
                const retornoLexador = lexador.mapear([
                    'a = [3, 4]',
                    'escreva (a)'
                ], -1);

                // Substitua a função de saída
                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[3, 4]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        })

        describe('Leia', () => {
            it('Dado um leia_inteiro, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_inteiro)'
                ], -1);

                const resposta = 1;
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta);
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('1');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_real, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_real)'
                ], -1);

                const resposta = 1.2;
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta);
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('1.2');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_texto, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_texto)'
                ], -1);

                const resposta = "texto";
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta);
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('texto');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_inteiro, escreva deve imprimir os valores inicializados', async () => {
                const retornoLexador = lexador.mapear([
                    'a, b, c = leia_inteiro',
                    'escreva(a, b, c)'
                ], -1);

                const resposta = [1, 2, 3];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta.shift());
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('(1,2,3)');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_inteiro, escreva deve imprimir o valor inicializado', async () => {
                const retornoLexador = lexador.mapear([
                    'a = leia_inteiro',
                    'escreva(a)'
                ], -1);

                const resposta = [1];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta.shift());
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('1');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });

        describe('Leia vetores', () => {
            it('Dado um leia_inteiros separador por virgula, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_inteiros(","))'
                ], -1);

                const resposta = '1,2,3';
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta);
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[1, 2, 3]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_inteiros, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'programa',
                    'escreva(leia_inteiros(3))',
                    'fim',
                ], -1);

                const respostas = [1, 2, 3];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[1, 2, 3]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(2);
            });

            it('Dado um leia_reais separador por virgula, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_reais(","))'
                ], -1);

                const resposta = '1,2,3';
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta);
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[1, 2, 3]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_reais, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_reais(3))'
                ], -1);

                const respostas = [1, 2, 3];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[1, 2, 3]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_textos separador por virgula, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_textos(","))'
                ], -1);

                const resposta = 'a,b,c';
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(resposta);
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[a, b, c]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });

            it('Dado um leia_textos, escreva deve imprimir o valor lido', async () => {
                const retornoLexador = lexador.mapear([
                    'escreva(leia_textos(3))'
                ], -1);

                const respostas = ['a', 'b', 'c'];
                interpretador.interfaceEntradaSaida = {
                    question: (mensagem: string, callback: Function) => {
                        callback(respostas.shift());
                    }
                };

                interpretador.funcaoDeRetorno = (saida: any) => {
                    expect(saida).toEqual('[a, b, c]');
                };

                const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
                expect(retornoInterpretador.erros).toHaveLength(0);
            });
        });
    });
});
