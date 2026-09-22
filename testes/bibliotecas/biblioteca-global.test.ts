import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { Interpretador } from "../../fontes/interpretador";
import { Lexador } from "../../fontes/lexador";

describe('Biblioteca Global', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let interpretador: Interpretador;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        interpretador = new Interpretador(process.cwd());
    });

    describe('aleatorio()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear(["escreva(aleatorio())"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('aleatorioEntre()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(aleatorioEntre(1, 5))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        it('Deve rejeitar se não for passado número como parâmetro', async () => {
            const retornoLexador = lexador.mapear(["escreva(aleatorioEntre('1', 5))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        it('Falha - não é passado nenhum parâmetro', async () => {
            const retornoLexador = lexador.mapear(["escreva(aleatorioEntre())"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
        });

    });

    describe('algum()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(algum([1, 2, 3], funcao(a) { retorna(a == 1) }))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        it('Nenhum elemento satisfaz condição', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(algum([1, 2, 3], funcao(a) { retorna(a == 10) }))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        it('Erro - Quando o primeiro argumento não é um array', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(algum('a', funcao(a) { retorna(a == 10) }))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
        it('Erro - Quando segundo parâmetro não é função', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(algum([1,2,3], 'texto'))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            expect(retornoAvaliadorSintatico.erros).toHaveLength(1);
        });


    });

    describe('clonar()', () => {
        it('Clonar número primitivo', async () => {
            const codigo = [
                "var original = 42",
                "var copia = clonar(original)",
                "copia = 100",
                "escreva(original)"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("42");
        });

        it('Clonar texto primitivo', async () => {
            const codigo = [
                "var original = 'Olá'",
                "var copia = clonar(original)",
                "copia = 'Mundo'",
                "escreva(original)"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("Olá");
        });

        it('Clonar vetor simples', async () => {
            const codigo = [
                "var original = [1, 2, 3]",
                "var copia = clonar(original)",
                "copia[0] = 99",
                "escreva(original[0])"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("1");
        });

        it('Clonar vetor aninhado', async () => {
            const codigo = [
                "var original = [1, [2, 3], 4]",
                "var copia = clonar(original)",
                "var subVetor = copia[1]",
                "subVetor[0] = 99",
                "escreva(original[1][0])"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("2");
        });

        it('Clonar objeto simples', async () => {
            const codigo = [
                "var original = {'a': 1, 'b': 2}",
                "var copia = clonar(original)",
                "var valorOriginal = original['a']",
                "copia['a'] = 99",
                "escreva(valorOriginal)"
            ];

            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("1");
        });

        it('Clonar objeto aninhado', async () => {
            const codigo = [
                "var original = {'a': 1, 'b': {'c': 2, 'd': 3}}",
                "var copia = clonar(original)",
                "var valorOriginal = original['b']['c']",
                "var subObjeto = copia['b']",
                "subObjeto['c'] = 99",
                "escreva(valorOriginal)"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("2");
        });

        it('Clonar vetor com objetos', async () => {
            const codigo = [
                "var original = [{'x': 1}, {'y': 2}]",
                "var copia = clonar(original)",
                "var valorOriginal = original[0]['x']",
                "var primeiro = copia[0]",
                "primeiro['x'] = 99",
                "escreva(valorOriginal)"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("1");
        });

        it('Clonar tupla', async () => {
            const codigo = [
                "var original = tupla([1, 2])",
                "var copia = clonar(original)",
                "escreva(copia[0])"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("1");
        });

        it('Clonar nulo', async () => {
            const codigo = [
                "var original = nulo",
                "var copia = clonar(original)",
                "escreva(copia == nulo)"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("verdadeiro");
        });

        it('Clonar vetor vazio', async () => {
            const codigo = [
                "var original = []",
                "var copia = clonar(original)",
                "copia[0] = 1",
                "escreva(tamanho(original))"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("0");
        });

        it('Clonar objeto vazio', async () => {
            const codigo = [
                "var original = {}",
                "var copia = clonar(original)",
                "copia['novo'] = 'valor'",
                "escreva(copia['novo'])"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            // Verifica que a cópia foi modificada com sucesso
            expect(_saida).toBe("valor");
        });

        it('Clonar estrutura complexa (vetor com objetos e vetores)', async () => {
            const codigo = [
                "var original = [{'a': [1, 2], 'b': 3}, {'c': 4}]",
                "var copia = clonar(original)",
                "var valorOriginal1 = original[0]['a'][0]",
                "var valorOriginal2 = original[1]['c']",
                "var primeiro = copia[0]",
                "var vetorA = primeiro['a']",
                "vetorA[0] = 99",
                "var segundo = copia[1]",
                "segundo['c'] = 88",
                "escreva(valorOriginal1)",
                "escreva(',')",
                "escreva(valorOriginal2)"
            ];
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };

            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("1,4");
        });
    });
    describe('máximo', () => {
        it('Deve retornar o maior número de um vetor simples', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(maximo([1, 10, 5, -2]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Deve retornar o maior vetor lexicograficamente (vetor de vetores)', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(maximo([[1, 2], [1, 3]]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Deve funcionar com números negativos e decimais', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(maximo([-10.5, -5.2, -20.0]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Erro - Deve rejeitar se o parâmetro não for um vetor', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(maximo(123))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Erro - Deve rejeitar vetor vazio', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(maximo([]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Erro - Deve rejeitar tipos misturados incompatíveis (número vs vetor)', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(maximo([1, [2]]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
    });

    describe('minimo', () => {
        it('Deve retornar o menor número de um vetor simples', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(minimo([10, 2, 20]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Deve retornar o menor vetor lexicograficamente', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(minimo([[1, 0], [0, 5]]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Deve funcionar com um único elemento', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(minimo([42]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Erro - Deve rejeitar se o parâmetro for nulo', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(minimo(nulo))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Erro - Deve rejeitar vetor vazio', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(minimo([]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Erro - Deve rejeitar tipos misturados (número vs vetor)', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(minimo([1, [2]]))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
    });
    describe('encontrar()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(encontrar([1, 2, 3], funcao(a) { retorna(a == 1) }))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('encontrar()', () => {
        it('Sucesso', async () => {
            let _saida = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saida += saida;
            };
            
            const retornoLexador = lexador.mapear([
                "var numeros = [1, 3, 5, 8, 10]", 
                "var pares = encontrar(numeros, funcao(n) { retorna n % 2 == 0 })", 
                "escreva(pares)"
            ], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe("[8, 10]");
        });
    });

    describe('encontrarIndice()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(encontrarIndice([1, 2, 3], funcao(a) { retorna(a == 1) }))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('encontrarUltimo()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(encontrarUltimo([1, 2, 3], funcao(a) { retorna(a == 3) }))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('encontrarUltimoIndice()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(encontrarUltimoIndice([1, 2, 3], funcao(a) { retorna(a == 3) }))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('incluido()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(incluido([1, 2, 3], 3))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('inteiro()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(inteiro(1 + 1))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Nulo', async () => {
            const retornoLexador = lexador.mapear(["escreva(inteiro(nulo))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Não inteiro', async () => {
            const retornoLexador = lexador.mapear(["escreva(inteiro('Oi'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('intervalo()', () => {
        it('Sucesso - Intervalo simples', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(1, 5))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Sucesso - Intervalo com números negativos', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(-3, 3))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Sucesso - Intervalo zero', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(0, 0))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Sucesso - Intervalo com variáveis', async () => {
            const codigo = [
                "var inicio = 1",
                "var fim = 10",
                "escreva(intervalo(inicio, fim))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Primeiro parâmetro não é número', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo('texto', 5))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - Segundo parâmetro não é número', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(1, 'texto'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
        it('Falha - Terceiro parâmetro é zero', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(0, 10, 0))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
        it('Falha - Terceiro parâmetro não é número', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(0, 10, '3'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(1);
        });

        it('Falha - Parâmetro de parada não é número', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo('3'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
        it('Sucesso - Intervalo com o passo negativo', async () => {
            const retornoLexador = lexador.mapear(["escreva(intervalo(0, 7, -2))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('mapear()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(x) { retorna(x ** x) }",
                "escreva(mapear([1, 2, 3], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        it('Falha - vetor nulo', async () => {
            const retornoLexador = lexador.mapear(
                ["mapear(nulo, funcao(a) { retorna(a) })"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
        it('Falha - Função sem retorno', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(mapear([1,2,3], funcao(a) { }))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(1);
        });
        it('Sucesso - Retorno diferente de RetornoQuebra', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(mapear([1,2], funcao(a) { escreva(a) }))"],
                -1
            );

            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
                retornoLexador,
                -1
            );

            const retornoInterpretador = await interpretador.interpretar(
                retornoAvaliadorSintatico.declaracoes
            );

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
        // it('Sucesso - Retorno inconsistente gera console.warn', async () => {
        //     const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        //     const retornoLexador = lexador.mapear(
        //         ["escreva(mapear([1,2,3], funcao(a) { }))"],
        //         -1
        //     );

        //     const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(
        //         retornoLexador,
        //         -1
        //     );

        //     const retornoInterpretador = await interpretador.interpretar(
        //         retornoAvaliadorSintatico.declaracoes
        //     );

        //     expect(retornoInterpretador.erros).toHaveLength(1);


        //     warnSpy.mockRestore();
        // });

    });

    describe('todosEmCondicao()', () => {
        it('todosEmCondicao', async () => {
            const codigo = [
                "var f = funcao(x) { retorna(x < 10) }",
                "escreva(todosEmCondicao([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('filtrarPor()', () => {
        it('filtrarPor, função sempre retorna valor', async () => {
            const codigo = [
                "var valoresLogicos = ['verdadeiro', 'falso', falso, verdadeiro, 'falso', 'verdadeiro']",
                "var f = funcao(valor) { retorna valor == 'verdadeiro' ou valor == verdadeiro }",
                "var valoresVerdadeiros = filtrarPor(valoresLogicos, f)",
                "escreva(valoresVerdadeiros)"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            interpretador.funcaoDeRetorno = (saida: any) => {
                expect(saida).toEqual('[\'verdadeiro\', verdadeiro, \'verdadeiro\']');
            };

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('filtrarPor, função retorna valor para alguns casos', async () => {
            const codigo = [
                "var f = funcao(x) { se(x > 4) { retorna(x) } }",
                "escreva(filtrarPor([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(retornoInterpretador.resultado.length).toBeGreaterThan(0);
        });
    });

    describe('primeiroEmCondicao()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(x) { se(x > 4) { retorna(x) } }",
                "escreva(primeiroEmCondicao([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('paraCada()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(valor) { se(valor >= 7) { escreva(valor) } }",
                "escreva(paraCada([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('ordenar()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "ordenar([5, 12, 10, 1, 4, 25, 33, 9, 7, 6, 2])"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('real()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(real(3.14))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Nulo ou Indefinido (resolve para zero)', async () => {
            const retornoLexador = lexador.mapear(["escreva(real(nulo))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Não inteiro', async () => {
            const retornoLexador = lexador.mapear(["escreva(real('Oi'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('tamanho()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(tamanho([1, 2, 3]))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Argumento não é lista', async () => {
            const retornoLexador = lexador.mapear(["escreva(tamanho(1))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - Nulo', async () => {
            const retornoLexador = lexador.mapear(["escreva(tamanho(nulo))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('texto()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear(["escreva(texto(123))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('tupla()', () => {
        it('Trivial', async () => {
            let _saidas = "";
            interpretador.funcaoDeRetorno = (saida: string) => {
                _saidas += saida;
            }

            const retornoLexador = lexador.mapear(["escreva(tupla([1,2,3]))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saidas).toBe('(1, 2, 3)');
        });
    });

    describe('arredondar()', () => {
        it('Sucesso - arredonda número com casas decimais', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(arredondar(3.14159, 2))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('3.14');
        });

        it('Sucesso - arredonda para inteiro', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(arredondar(3.7, 0))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('4');
        });
    });

    describe('longo()', () => {
        it('Sucesso - converte número inteiro para longo', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(longo(42))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Nulo - retorna 0n', async () => {
            const retornoLexador = lexador.mapear(["escreva(longo(nulo))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Sucesso - converte texto numérico para longo', async () => {
            const retornoLexador = lexador.mapear(["escreva(longo('123'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - texto não numérico', async () => {
            const retornoLexador = lexador.mapear(["escreva(longo('abc'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('numero()', () => {
        it('Sucesso - número real', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(numero(3.14))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('3.14');
        });

        it('Nulo - retorna zero', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(numero(nulo))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('0');
        });

        it('Falha - texto não numérico', async () => {
            const retornoLexador = lexador.mapear(["escreva(numero('abc'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('somar()', () => {
        it('Sucesso - soma vetor de números', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(somar([1, 2, 3, 4, 5]))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('15');
        });

        it('Sucesso - soma números reais', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(somar([1.5, 2.5, 3.0]))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('7');
        });
    });

    describe('reduzir()', () => {
        it('Sucesso - reduz vetor com valor inicial', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const codigo = [
                "var resultado = reduzir([1, 2, 3, 4], funcao(acumulador, atual) { retorna acumulador + atual }, 0)",
                "escreva(resultado)"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - primeiro parâmetro não é vetor', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(reduzir(5, funcao(a, b) { retorna a + b }, 0))"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('todos()', () => {
        it('Sucesso - todos os elementos são verdadeiros', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(todos([verdadeiro, verdadeiro, 1]))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('verdadeiro');
        });

        it('Sucesso - nem todos são verdadeiros', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(todos([verdadeiro, falso, 1]))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('falso');
        });

        it('Falha - parâmetro não é iterável', async () => {
            const retornoLexador = lexador.mapear(["escreva(todos(5))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('vetor()', () => {
        it('Sucesso - converte tupla para vetor', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const codigo = [
                "var t = tupla([1, 2, 3])",
                "var v = vetor(t)",
                "escreva(tamanho(v))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('3');
        });

        it('Falha - argumento é texto (não é tupla)', async () => {
            const retornoLexador = lexador.mapear(["escreva(vetor('nao eh tupla'))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('encontrar() - sem resultado', () => {
        it('Executa sem erros com função de busca', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(encontrar([1, 2, 3], funcao(x) { retorna x == 99 }))"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('encontrarUltimo() - sem resultado', () => {
        it('Executa sem erros com função de busca', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(encontrarUltimo([1, 2, 3], funcao(x) { retorna x == 99 }))"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('encontrarUltimoIndice() - sem resultado', () => {
        it('Executa sem erros com função de busca', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(encontrarUltimoIndice([1, 2, 3], funcao(x) { retorna x == 99 }))"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('incluido() - não encontrado', () => {
        it('Retorna falso quando elemento não está no vetor', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(["escreva(incluido([1, 2, 3], 99))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('falso');
        });
    });

    describe('algum() - iteração completa', () => {
        it('Executa sem erros ao iterar todos os elementos', async () => {
            const retornoLexador = lexador.mapear(
                ["escreva(algum([1, 2, 3], funcao(x) { retorna x > 10 }))"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('filtrarPor() - erros', () => {
        it('Falha - primeiro parâmetro nulo', async () => {
            const retornoLexador = lexador.mapear(
                ["filtrarPor(nulo, funcao(x) { retorna x })"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - primeiro parâmetro não é vetor', async () => {
            const retornoLexador = lexador.mapear(
                ["filtrarPor(5, funcao(x) { retorna x })"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('primeiroEmCondicao() - erros e sem resultado', () => {
        it('Retorna indefinido quando nenhum elemento satisfaz', async () => {
            const codigo = [
                "var f = funcao(x) { se(x > 100) { retorna(x) } }",
                "var resultado = primeiroEmCondicao([1, 2, 3], f)",
                "escreva(resultado == nulo)"
            ];
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - parâmetro nulo', async () => {
            const retornoLexador = lexador.mapear(
                ["primeiroEmCondicao(nulo, funcao(x) { retorna x })"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - primeiro parâmetro não é vetor', async () => {
            const retornoLexador = lexador.mapear(
                ["primeiroEmCondicao(5, funcao(x) { retorna x })"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('ordenar() - erros', () => {
        it('Falha - parâmetro não é vetor', async () => {
            const retornoLexador = lexador.mapear(["ordenar(5)"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('todosEmCondicao() - erros', () => {
        it('Falha - primeiro parâmetro não é iterável', async () => {
            const retornoLexador = lexador.mapear(
                ["todosEmCondicao(5, funcao(x) { retorna x > 0 })"],
                -1
            );
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Sucesso - todos satisfazem a condição', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const codigo = [
                "var f = funcao(x) { retorna(x > 0) }",
                "escreva(todosEmCondicao([1, 2, 3], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('verdadeiro');
        });

        it('Sucesso - nem todos satisfazem a condição', async () => {
            let _saida = '';
            interpretador.funcaoDeRetorno = (saida: string) => { _saida += saida; };
            const codigo = [
                "var f = funcao(x) { retorna(x > 0) }",
                "escreva(todosEmCondicao([1, -2, 3], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);
            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);
            expect(retornoInterpretador.erros).toHaveLength(0);
            expect(_saida).toBe('falso');
        });
    });
});
