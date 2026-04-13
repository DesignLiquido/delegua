import { LexadorPortugolIpt } from '../../../../fontes/lexador/dialetos/lexador-portugol-ipt';
import tiposDeSimbolos from '../../../../fontes/tipos-de-simbolos/portugol-ipt';

describe('Lexador (Portugol IPT)', () => {
    describe('mapear()', () => {
        let lexador: LexadorPortugolIpt;

        beforeEach(() => {
            lexador = new LexadorPortugolIpt();
        });

        describe('Estrutura básica', () => {
            it('Código vazio', () => {
                const resultado = lexador.mapear([''], -1);
                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos).toHaveLength(1);
            });

            it('inicio e fim', () => {
                const resultado = lexador.mapear(['inicio', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.INICIO);
                expect(tipos).toContain(tiposDeSimbolos.FIM);
            });

            it('palavras-chave em maiúsculas', () => {
                const resultado = lexador.mapear(['INICIO', 'FIM'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.INICIO);
                expect(tipos).toContain(tiposDeSimbolos.FIM);
            });

            it('Olá Mundo', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'escrever "Olá mundo"',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                expect(resultado.simbolos).toHaveLength(7);
            });
        });

        describe('Operadores aritméticos', () => {
            it('adição: +', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 1 + 2', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.ADICAO);
            });

            it('subtração: -', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 5 - 3', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.SUBTRACAO);
            });

            it('multiplicação: *', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 2 * 4', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.MULTIPLICACAO);
            });

            it('divisão: /', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 8 / 2', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.DIVISAO);
            });

            it('módulo: %', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 7 % 3', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.MODULO);
            });

            it('exponenciação: ^', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 2 ^ 8', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.EXPONENCIACAO);
            });
        });

        describe('Operadores relacionais', () => {
            it('igual: =', () => {
                const resultado = lexador.mapear(['inicio', 'se x = 1 entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.IGUAL);
            });

            it('diferente: =/=', () => {
                const resultado = lexador.mapear(['inicio', 'se x =/= 1 entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.DIFERENTE);
            });

            it('maior: >', () => {
                const resultado = lexador.mapear(['inicio', 'se x > 1 entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.MAIOR);
            });

            it('maior ou igual: >=', () => {
                const resultado = lexador.mapear(['inicio', 'se x >= 1 entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.MAIOR_IGUAL);
            });

            it('menor: <', () => {
                const resultado = lexador.mapear(['inicio', 'se x < 1 entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.MENOR);
            });

            it('menor ou igual: <=', () => {
                const resultado = lexador.mapear(['inicio', 'se x <= 1 entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.MENOR_IGUAL);
            });

            it('atribuição: <-', () => {
                const resultado = lexador.mapear(['inicio', 'x <- 1', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.SETA_ATRIBUICAO);
            });
        });

        describe('Operadores lógicos', () => {
            it('e', () => {
                const resultado = lexador.mapear(['inicio', 'se a e b entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.E);
            });

            it('ou', () => {
                const resultado = lexador.mapear(['inicio', 'se a ou b entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.OU);
            });

            it('xou', () => {
                const resultado = lexador.mapear(['inicio', 'se a xou b entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.XOU);
            });

            it('nao', () => {
                const resultado = lexador.mapear(['inicio', 'se nao a entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.NAO);
            });

            it('não (com acento)', () => {
                const resultado = lexador.mapear(['inicio', 'se não a entao', 'fimse', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.NAO);
            });
        });

        describe('Palavras reservadas de controle', () => {
            it('condicional: se, entao, senao, fimse', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'se x = 1 entao',
                    'escrever "sim"',
                    'senao',
                    'escrever "nao"',
                    'fimse',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.SE);
                expect(tipos).toContain(tiposDeSimbolos.ENTAO);
                expect(tipos).toContain(tiposDeSimbolos.SENAO);
                expect(tipos).toContain(tiposDeSimbolos.FIMSE);
            });

            it('então e senão (com acento)', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'se x = 1 então',
                    'escrever "sim"',
                    'senão',
                    'escrever "nao"',
                    'fimse',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.ENTAO);
                expect(tipos).toContain(tiposDeSimbolos.SENAO);
            });

            it('enquanto, faz, fimenquanto', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'enquanto x > 0 faz',
                    'fimenquanto',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.ENQUANTO);
                expect(tipos).toContain(tiposDeSimbolos.FAZ);
                expect(tipos).toContain(tiposDeSimbolos.FIMENQUANTO);
            });

            it('para, de, ate, passo, proximo', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'para i de 1 ate 10 passo 1',
                    'proximo',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.PARA);
                expect(tipos).toContain(tiposDeSimbolos.DE);
                expect(tipos).toContain(tiposDeSimbolos.ATE);
                expect(tipos).toContain(tiposDeSimbolos.PASSO);
                expect(tipos).toContain(tiposDeSimbolos.PROXIMO);
            });

            it('até e próximo (com acento)', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'para i de 1 até 10 passo 1',
                    'próximo',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.ATE);
                expect(tipos).toContain(tiposDeSimbolos.PROXIMO);
            });

            it('repete', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'repete',
                    'ate x > 0',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.REPETE);
            });

            it('escolhe, caso, defeito, fimescolhe', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'escolhe x',
                    'caso 1: escrever "um"',
                    'defeito: escrever "outro"',
                    'fimescolhe',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.ESCOLHE);
                expect(tipos).toContain(tiposDeSimbolos.CASO);
                expect(tipos).toContain(tiposDeSimbolos.DEFEITO);
                expect(tipos).toContain(tiposDeSimbolos.FIMESCOLHE);
            });

            it('fim enquanto (com espaço)', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'enquanto x > 0 faz',
                    'fim enquanto',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.FIM);
                expect(tipos).toContain(tiposDeSimbolos.ENQUANTO);
            });

            it('fim escolhe (com espaço)', () => {
                const resultado = lexador.mapear([
                    'inicio',
                    'escolhe x',
                    'caso 1: escrever "um"',
                    'fim escolhe',
                    'fim',
                ], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.FIM);
                expect(tipos).toContain(tiposDeSimbolos.ESCOLHE);
            });
        });

        describe('Tipos de variáveis', () => {
            it('inteiro', () => {
                const resultado = lexador.mapear(['inicio', 'inteiro x', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.INTEIRO);
            });

            it('real', () => {
                const resultado = lexador.mapear(['inicio', 'real x', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.REAL);
            });

            it('texto', () => {
                const resultado = lexador.mapear(['inicio', 'texto t', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.TEXTO);
            });

            it('logico', () => {
                const resultado = lexador.mapear(['inicio', 'logico b', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.LOGICO);
            });

            it('lógico (com acento)', () => {
                const resultado = lexador.mapear(['inicio', 'lógico b', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.LOGICO);
            });

            it('caracter', () => {
                const resultado = lexador.mapear(['inicio', 'caracter c', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.CARACTER);
            });

            it('constante', () => {
                const resultado = lexador.mapear(['inicio', 'constante inteiro x', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.CONSTANTE);
            });

            it('variavel', () => {
                const resultado = lexador.mapear(['inicio', 'variavel inteiro x', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.VARIAVEL);
            });
        });

        describe('Pontuação', () => {
            it('colchetes: [ e ]', () => {
                const resultado = lexador.mapear(['inicio', 'inteiro v[5]', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.COLCHETE_ESQUERDO);
                expect(tipos).toContain(tiposDeSimbolos.COLCHETE_DIREITO);
            });

            it('dois pontos: :', () => {
                const resultado = lexador.mapear(['inicio', 'caso 1:', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.DOIS_PONTOS);
            });

            it('vírgula: ,', () => {
                const resultado = lexador.mapear(['inicio', 'escrever x, y', 'fim'], -1);
                expect(resultado.erros).toHaveLength(0);
                const tipos = resultado.simbolos.map((s) => s.tipo);
                expect(tipos).toContain(tiposDeSimbolos.VIRGULA);
            });
        });
    });
});
