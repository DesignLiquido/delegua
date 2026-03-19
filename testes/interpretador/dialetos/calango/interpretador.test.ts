import { AvaliadorSintaticoCalango } from '../../../../fontes/avaliador-sintatico/dialetos/avaliador-sintatico-calango';
import { LexadorCalango } from '../../../../fontes/lexador/dialetos';
import { InterpretadorCalango } from '../../../../fontes/interpretador/dialetos/calango';

describe('Interpretador (Calango)', () => {
    describe('interpretar()', () => {
        let lexador: LexadorCalango;
        let avaliadorSintatico: AvaliadorSintaticoCalango;
        let interpretador: InterpretadorCalango;

        let _saidas: string[] = [];
        const funcaoSaida = (texto: string) => {
            _saidas.push(texto);
        }

        beforeEach(() => {
            _saidas = [];
            lexador = new LexadorCalango();
            avaliadorSintatico = new AvaliadorSintaticoCalango();
            interpretador = new InterpretadorCalango(process.cwd(), false, funcaoSaida, funcaoSaida);
        });

        describe('Cenários de sucesso', () => {
            it('Tipos de dados (real, logico, caracter, texto)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'real preco;',
                        'logico ativo;',
                        'caracter letra;',
                        'texto nome;',
                        'preco = 3.14;',
                        'ativo = verdadeiro;',
                        'letra = \'a\';',
                        'nome = "João";',
                        'escreval(preco);',
                        'escreval(ativo);',
                        'escreval(letra);',
                        'escreval(nome);',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(4);
                expect(_saidas[0]).toBe('3.14');
                expect(_saidas[1]).toBe('verdadeiro');
                expect(_saidas[2]).toBe('a');
                expect(_saidas[3]).toBe('João');
            });

            it('enquanto / fimEnquanto', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro i;',
                        'i = 0;',
                        'enquanto (i < 3) faca',
                        'escreval(i);',
                        'i = i + 1;',
                        'fimEnquanto',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('0');
                expect(_saidas[1]).toBe('1');
                expect(_saidas[2]).toBe('2');
            });

            it('funcao com retorna e chamada', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'funcao dobrar(inteiro n): inteiro',
                        'inteiro resultado;',
                        'resultado = n + n;',
                        'retorna resultado;',
                        'fimFuncao',
                        'principal',
                        'inteiro x;',
                        'x = dobrar(5);',
                        'escreval(x);',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('10');
            });

            it('procedimento sem retorno', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'procedimento saudar(texto nome)',
                        'escreval(nome);',
                        'fimProcedimento',
                        'principal',
                        'saudar("Mundo");',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('Mundo');
            });

            it('interrompa dentro de enquanto', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro i;',
                        'i = 0;',
                        'enquanto (i < 10) faca',
                        'se (i = 3) entao',
                        'interrompa',
                        'fimSe',
                        'i = i + 1;',
                        'fimEnquanto',
                        'escreval(i);',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('3');
            });

            it('escolha / caso / outroCaso / fimEscolha', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro x;',
                        'x = 2;',
                        'escolha (x)',
                        'caso 1:',
                        'escreval("um");',
                        'caso 2:',
                        'escreval("dois");',
                        'outroCaso:',
                        'escreval("outro");',
                        'fimEscolha',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('dois');
            });

            it('faca / enquanto (do-while executa ao menos uma vez)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro i;',
                        'i = 0;',
                        'faca',
                        'escreval(i);',
                        'i = i + 1;',
                        'enquanto (i < 3)',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('0');
                expect(_saidas[1]).toBe('1');
                expect(_saidas[2]).toBe('2');
            });

            it('para / ate / passo / fimPara (passo explícito)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro i;',
                        'para i de 1 ate 5 passo 1 faca',
                        'escreval(i);',
                        'fimPara',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(5);
                expect(_saidas[0]).toBe('1');
                expect(_saidas[1]).toBe('2');
                expect(_saidas[2]).toBe('3');
                expect(_saidas[3]).toBe('4');
                expect(_saidas[4]).toBe('5');
            });

            it('para / ate / fimPara (passo implícito)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro i;',
                        'para i de 1 ate 3 faca',
                        'escreval(i);',
                        'fimPara',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('1');
                expect(_saidas[1]).toBe('2');
                expect(_saidas[2]).toBe('3');
            });

            it('se com = como comparacao verdadeira', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro x;',
                        'x = 1;',
                        'se (x = 1) entao',
                        'escreval(\"igual\");',
                        'senao',
                        'escreval(\"diferente\");',
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
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('igual');
            });

            it('se com = como comparacao falsa', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro x;',
                        'x = 2;',
                        'se (x = 1) entao',
                        'escreval(\"igual\");',
                        'senao',
                        'escreval(\"diferente\");',
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
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('diferente');
            });

            it('operador <> (diferente)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro x;',
                        'x = 1;',
                        'se (x <> 0) entao',
                        'escreval(\"diferente de zero\");',
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
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('diferente de zero');
            });

            it('nao (negacao logica)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'logico ativo;',
                        'ativo = nao verdadeiro;',
                        'escreval(ativo);',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('falso');
            });

            it('mod e div', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro a;',
                        'inteiro b;',
                        'a = 10 mod 3;',
                        'b = 10 div 3;',
                        'escreval(a);',
                        'escreval(b);',
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
                expect(_saidas[0]).toBe('1');
                expect(_saidas[1]).toBe('3');
            });

            it('exponenciacao (^)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro a;',
                        'a = 2 ^ 8;',
                        'escreval(a);',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('256');
            });

            it('comentários de linha (//)', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo; // titulo',
                        'principal',
                        '// declara variável',
                        'inteiro x;',
                        'x = 42; // atribui 42',
                        'escreval(x); // imprime',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(1);
                expect(_saidas[0]).toBe('42');
            });

            it('vetor inteiro: declaração, atribuição e leitura por índice', async () => {
                const retornoLexador = lexador.mapear(
                    [
                        'algoritmo tituloDoAlgoritmo;',
                        'principal',
                        'inteiro v[3];',
                        'v[0] = 10;',
                        'v[1] = 20;',
                        'v[2] = 30;',
                        'escreval(v[0]);',
                        'escreval(v[1]);',
                        'escreval(v[2]);',
                        'fimPrincipal',
                    ],
                    -1
                );
                const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
                const retornoInterpretador = await interpretador.interpretar(
                    retornoAvaliadorSintatico.declaracoes
                );

                expect(retornoInterpretador.erros).toHaveLength(0);
                expect(_saidas).toHaveLength(3);
                expect(_saidas[0]).toBe('10');
                expect(_saidas[1]).toBe('20');
                expect(_saidas[2]).toBe('30');
            });

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

            it('Sucesso - Condicionais (se, senao)', async () => {
                // Aqui vamos simular a resposta para uma variável de `leia()`.
                const respostas = ['40'];
                interpretador.interfaceEntradaSaida = {
                    question: (_mensagem: string, callback: Function) => {
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
                    question: (_mensagem: string, callback: Function) => {
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
