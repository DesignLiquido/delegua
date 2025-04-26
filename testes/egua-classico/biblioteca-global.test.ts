import definirBibliotecaGlobal from '../../fontes/bibliotecas/dialetos/egua-classico/biblioteca-global';
import { InterpretadorEguaClassico } from '../../fontes/interpretador/dialetos/egua-classico/interpretador-egua-classico';
import { FuncaoPadrao } from '../../fontes/interpretador/estruturas';

const funcoes = {};

const mockGlobals = {
    definirVariavel: (nome: string, objeto: FuncaoPadrao) => {
        funcoes[nome] = objeto.funcao;
    }
}

describe('Biblioteca Global', () => {
    let interpretador: InterpretadorEguaClassico;

    beforeAll(() => {
        interpretador = new InterpretadorEguaClassico(process.cwd());
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
            expect(resultado).toBeGreaterThanOrEqual(2);
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
