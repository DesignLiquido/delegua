import { Delegua } from "../fontes/delegua";

describe('Biblioteca Global', () => {
    let delegua: Delegua;

    beforeEach(() => {
        delegua = new Delegua('delegua');
    });

    describe('aleatorio()', () => { 
        it('Trivial', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(aleatorio())"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('aleatorioEntre()', () => {        
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(aleatorioEntre(1, 5))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('inteiro()', () => {
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(inteiro(1))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Não inteiro', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(inteiro('Oi'))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - Nulo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(inteiro(nulo))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('mapear()', () => {        
        it('Sucesso', () => {
            const codigo = [
                "var f = funcao(x) { retorna(x ** x) }",
                "escreva(mapear([1, 2, 3], f))"
            ];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('ordenar()', () => {        
        it('Sucesso', () => {
            const codigo = [
                "ordenar([5, 12, 10, 1, 4, 25, 33, 9, 7, 6, 2])"
            ];
            const retornoLexador = delegua.lexador.mapear(codigo, -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });

    describe('real()', () => {
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(real(3.14))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Não inteiro', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(real('Oi'))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - Nulo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(real(nulo))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('tamanho()', () => {        
        it('Sucesso', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(tamanho([1, 2, 3]))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });

        it('Falha - Argumento não é lista', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(tamanho(1))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });

        it('Falha - Nulo', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(tamanho(nulo))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros.length).toBeGreaterThan(0);
        });
    });

    describe('texto()', () => {        
        it('Trivial', () => {
            const retornoLexador = delegua.lexador.mapear(["escreva(texto(123))"], -1);
            const retornoAvaliadorSintatico = delegua.avaliadorSintatico.analisar(retornoLexador);
            
            const retornoInterpretador = delegua.interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retornoInterpretador.erros).toHaveLength(0);
        });
    });
});