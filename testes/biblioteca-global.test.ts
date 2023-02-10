import { AvaliadorSintatico } from "../fontes/avaliador-sintatico";
import { InterpretadorBase } from "../fontes/interpretador";
import { Lexador } from "../fontes/lexador";

describe('Biblioteca Global', () => {
    let lexador: Lexador;
    let avaliadorSintatico: AvaliadorSintatico;
    let interpretador: InterpretadorBase;

    beforeEach(() => {
        lexador = new Lexador();
        avaliadorSintatico = new AvaliadorSintatico();
        interpretador = new InterpretadorBase(process.cwd());
    });

    describe('aleatorio()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear(["escreva(aleatorio())"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('aleatorioEntre()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(aleatorioEntre(1, 5))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('inteiro()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(inteiro(1 + 1))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Sucesso - Nulo', async () => {
            const retornoLexador = lexador.mapear(["escreva(inteiro(nulo))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Não inteiro', async () => {
            const retornoLexador = lexador.mapear(["escreva(inteiro('Oi'))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

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
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Funçao de mapeamento inválida', async () => {
            const codigo = [
                "var f = 'Sou uma função'",
                "escreva(mapear([1, 2, 3], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('todosEmCondicao()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(x) { retorna(x < 10) }",
                "escreva(todosEmCondicao([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Funçao de mapeamento inválida', async () => {
            const codigo = [
                "var f = 'Sou uma função'",
                "escreva(todosEmCondicao([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('filtrarPor()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(x) { se(x > 4) { retorna(x) } }",
                "escreva(filtrarPor([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Funçao de mapeamento inválida', async () => {
            const codigo = [
                "var f = 'Sou uma função'",
                "escreva(filtrarPor([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('primeiroEmCondicao()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(x) { se(x > 4) { retorna(x) } }",
                "escreva(primeiroEmCondicao([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Funçao de mapeamento inválida', async () => {
            const codigo = [
                "var f = 'Sou uma função'",
                "escreva(primeiroEmCondicao([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('paraCada()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "var f = funcao(valor) { se(valor >= 7) { escreva(valor) } }",
                "escreva(paraCada([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Funçao de mapeamento inválida', async () => {
            const codigo = [
                "var f = 'Sou uma função'",
                "escreva(paraCada([1, 2, 3, 4, 5, 6], f))"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('ordenar()', () => {
        it('Sucesso', async () => {
            const codigo = [
                "ordenar([5, 12, 10, 1, 4, 25, 33, 9, 7, 6, 2])"
            ];
            const retornoLexador = lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('real()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(real(3.14))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Sucesso - Nulo ou Indefinido (resolve para zero)', async () => {
            const retornoLexador = lexador.mapear(["escreva(real(nulo))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Não inteiro', async () => {
            const retornoLexador = lexador.mapear(["escreva(real('Oi'))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('tamanho()', () => {
        it('Sucesso', async () => {
            const retornoLexador = lexador.mapear(["escreva(tamanho([1, 2, 3]))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Argumento não é lista', async () => {
            const retornoLexador = lexador.mapear(["escreva(tamanho(1))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - Nulo', async () => {
            const retornoLexador = lexador.mapear(["escreva(tamanho(nulo))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('texto()', () => {
        it('Trivial', async () => {
            const retornoLexador = lexador.mapear(["escreva(texto(123))"], -1);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador);

            const retornoInterpretador = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});
