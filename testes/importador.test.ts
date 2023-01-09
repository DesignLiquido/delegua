import { Delegua } from '../fontes/delegua';

describe('Importador', () => {
    describe('importar()', () => {
        let delegua: Delegua;

        beforeEach(() => {
            delegua = new Delegua('delegua');
        });

        it('Trivial', () => {
            const resultado = delegua.importador.importar('./exemplos/fibonacci.delegua', true, false);
            expect(resultado).toBeTruthy();
        });
    });
});