import definirBibliotecaGlobal from '../../fontes/bibliotecas/dialetos/egua-classico/biblioteca-global';
import { FuncaoPadrao } from '../../fontes/estruturas';
import { InterpretadorEguaClassico } from '../../fontes/interpretador/dialetos/egua-classico/interpretador-egua-classico';

const funcoes = {};

const mockGlobals = {
    definirVariavel: (nome: string, objeto: FuncaoPadrao) => {
        funcoes[nome] = objeto.funcao;
    }
}

describe('Biblioteca Global', () => {
    let interpretador: InterpretadorEguaClassico;

    beforeAll(() => {
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
            const resultado = funcoes['aleatorioEntre'](2, 10);
            expect(resultado).toBeGreaterThan(2);
            expect(resultado).toBeLessThan(10);
        });
    });

    describe('inteiro()', () => {
        it('Trivial', () => {
            const resultado = funcoes['inteiro']('123');
            expect(resultado).toBe(123);
        });
    });
});
