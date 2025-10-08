import { AvaliadorSintaticoEguaClassico } from '../../fontes/avaliador-sintatico';
import { ErroEmTempoDeExecucao } from '../../fontes/excecoes';
import { InterpretadorEguaClassico } from '../../fontes/interpretador/dialetos/egua-classico/interpretador-egua-classico';
import { FuncaoPadrao } from '../../fontes/interpretador/estruturas';
import { LexadorEguaClassico } from '../../fontes/lexador';

import definirBibliotecaGlobal from '../../fontes/bibliotecas/dialetos/egua-classico/biblioteca-global';

const funcoes: {[nome: string]: Function} = {};

const mockGlobals = {
    definirVariavel: (nome: string, objeto: FuncaoPadrao) => {
        funcoes[nome] = objeto.funcao;
    }
}

describe('Biblioteca Global', () => {
    let lexador: LexadorEguaClassico;
    let avaliadorSintatico: AvaliadorSintaticoEguaClassico;
    let interpretador: InterpretadorEguaClassico;

    let _saidas: string[] = [];
    const funcaoSaida = (texto: string) => {
        _saidas.push(texto);
    }

    beforeAll(() => {
        _saidas = [];
        lexador = new LexadorEguaClassico();
        avaliadorSintatico = new AvaliadorSintaticoEguaClassico();
        interpretador = new InterpretadorEguaClassico(process.cwd());
        interpretador.funcaoDeRetorno = funcaoSaida;
        definirBibliotecaGlobal(interpretador, mockGlobals);
    });

    describe('aleatorio()', () => {
        it('Trivial', () => {
            const resultado = funcoes['aleatorio']();
            expect(resultado).toBeTruthy();
        });
    });

    describe('aleatorioEntre()', () => {
        it('Trivial', () => {
            const resultado = funcoes['aleatorioEntre'](undefined, 2, 10);
            expect(resultado).toBeGreaterThanOrEqual(2);
            expect(resultado).toBeLessThan(10);
        });

        it('Apenas um parâmetro', () => {
            const resultado = funcoes['aleatorioEntre'](undefined, 10);
            expect(resultado).toBeGreaterThanOrEqual(0);
            expect(resultado).toBeLessThan(10);
        });

        it('Sem argumentos', () => {
            expect(() => funcoes['aleatorioEntre']()).toThrow(ErroEmTempoDeExecucao);
        });

        it('Mais de 2 argumentos', () => {
            expect(() => funcoes['aleatorioEntre'](undefined, 1, 2, 3)).toThrow(ErroEmTempoDeExecucao);
        });

        it('Parâmetros não inteiros', () => {
            expect(() => funcoes['aleatorioEntre'](undefined, '1', '2')).toThrow(ErroEmTempoDeExecucao);
        });

        it('Apenas um parâmetro, não inteiro', () => {
            expect(() => funcoes['aleatorioEntre'](undefined, '10')).toThrow(ErroEmTempoDeExecucao);
        });
    });

    describe('inteiro()', () => {
        it('Trivial', () => {
            const resultado = funcoes['inteiro'](undefined, '123');
            expect(resultado).toBe(123);
        });

        it('Parâmetro indefinido', () => {
            expect(() => funcoes['inteiro'](undefined, undefined)).toThrow(ErroEmTempoDeExecucao);
        });

        it('Parâmetro é número, mas não segue uma formatação decimal', () => {
            expect(() => funcoes['inteiro'](undefined, 'teste')).toThrow(ErroEmTempoDeExecucao);
        });
    });

    describe('mapear()', () => {
        it('Trivial', async () => {
            const codigo = [
                "var resultado = mapear([1, 2, 3], função(item) {",
                "  retorna item * 2;",
                "});",
                "escreva(resultado);"
            ];
            const retornoLexador = lexador.mapear(codigo);
            const retornoAvaliadorSintatico = avaliadorSintatico.analisar(retornoLexador, -1);
            const retorno = await interpretador.interpretar(retornoAvaliadorSintatico.declaracoes);

            expect(retorno).toBeTruthy();
            expect(_saidas).toHaveLength(1);
            expect(_saidas[0]).toStrictEqual([2, 4, 6]);
        });
    });
});
