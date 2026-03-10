import { AvaliadorSintatico } from "../../fontes/avaliador-sintatico";
import { minimo, maximo, intervalo } from "../../fontes/bibliotecas/biblioteca-global";
import { Interpretador} from "../../fontes/interpretador";
import { Lexador } from "../../fontes/lexador";
import { criarInterpretadorMock } from "../_mocks/interpretador.mock";

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
        
    });

    describe('algum()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(algum([1, 2, 3], funcao(a) { retorna(a == 1) }))"], -1);
            const retornoAvaliadorSintatico = await avaliadorSintatico.analisar(retornoLexador, -1);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
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
        describe('maximo', () => {
            it('Deve retornar o maior número de um vetor simples', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await maximo(interpretador, [1, 10, 5, -2]);
                expect(resultado).toBe(10);
            });
    
            it('Deve retornar o maior vetor lexicograficamente (vetor de vetores)', async () => {
                const interpretador = criarInterpretadorMock();
                // [1, 3] é maior que [1, 2]
                const resultado = await maximo(interpretador, [[1, 2], [1, 3]]);
                expect(resultado).toEqual([1, 3]);
            });
    
            it('Deve funcionar com números negativos e decimais', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await maximo(interpretador, [-10.5, -5.2, -20.0]);
                expect(resultado).toBe(-5.2);
            });
    
            it('Deve rejeitar se o parâmetro não for um vetor', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(maximo(interpretador, 123 as any)).rejects.toMatchObject({
                    mensagem: 'Parâmetro inválido. O parâmetro da função maximo() deve ser um vetor.',
                });
            });
    
            it('Deve rejeitar vetor vazio', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(maximo(interpretador, [])).rejects.toMatchObject({
                    mensagem: 'Parâmetro inválido. O vetor não pode estar vazio.',
                });
            });
    
            it('Deve rejeitar tipos misturados incompatíveis (número vs vetor)', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(maximo(interpretador, [1, [2]])).rejects.toMatchObject({
                    mensagem: 'Não é possível comparar elementos de tipos diferentes dentro do vetor (ex: números com vetores).',
                });
            });
        });
    
        describe('minimo', () => {
            it('Deve retornar o menor número de um vetor simples', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await minimo(interpretador, [10, 2, 20]);
                expect(resultado).toBe(2);
            });
    
            it('Deve retornar o menor vetor lexicograficamente', async () => {
                const interpretador = criarInterpretadorMock();
                // [0, 5] é menor que [1, 0]
                const resultado = await minimo(interpretador, [[1, 0], [0, 5]]);
                expect(resultado).toEqual([0, 5]);
            });
    
            it('Deve funcionar com um único elemento', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await minimo(interpretador, [42]);
                expect(resultado).toBe(42);
            });
    
            it('Deve rejeitar se o parâmetro for nulo', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(minimo(interpretador, null as any)).rejects.toMatchObject({
                    mensagem: 'Parâmetro inválido. O parâmetro da função minimo() não pode ser nulo.',
                });
            });
    
            it('Deve rejeitar vetor vazio', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(minimo(interpretador, [])).rejects.toMatchObject({
                    mensagem: 'Parâmetro inválido. O vetor não pode estar vazio.',
                });
            });
    
            it('Deve rejeitar tipos misturados (texto vs número)', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(minimo(interpretador, [1, [2]])).rejects.toMatchObject({
                    mensagem: 'Não é possível comparar elementos de tipos diferentes dentro do vetor (ex: números com vetores).',
                });
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
      describe('intervalo', () => {
            it('cria intervalo correto (inicio inclusivo, fim exclusivo)', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await intervalo(interpretador as any, 1 as any, 5 as any);
                expect(resultado).toEqual([1,2,3,4]);
            });
            it('Rejeita quando parâmetros não são números', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(intervalo(interpretador as any, '1' as any, 5 as any)).rejects.toMatchObject({
                    mensagem: 'Os parâmetros de início e fim devem ser do tipo número ou inteiro.'
                });
            });
            it('Cria intervalo correto (com passo)', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await intervalo(interpretador as any, 1 as any, 10 as any, 3 as any);
                expect(resultado).toEqual([1,4,7]);
            });
            it('Rejeita quando passo não é número', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(intervalo(interpretador as any, 1 as any, 10 as any, '3' as any)).rejects.toMatchObject({
                    mensagem: 'O parâmetro de passo deve ser do tipo número ou inteiro.'
                });
            });
            it('Rejeita quando passo é zero', async () => {
                const interpretador = criarInterpretadorMock();
                await expect(intervalo(interpretador as any, 1 as any, 10 as any, 0 as any)).rejects.toMatchObject({
                    mensagem: 'O passo não pode ser zero.'
                });
            });
            it('Cria intervalo quando passo é negativo', async () => {
                const interpretador = criarInterpretadorMock();
                const resultado = await intervalo(interpretador as any, 10 as any, 1 as any, -3 as any);
                expect(resultado).toEqual([10,7,4]);
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
});
