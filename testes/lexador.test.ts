import { Delegua } from '../src/delegua';
// import { Lexador } from '../src/lexador';

describe('lexador', () => {
    it('mapear()', () => {
        const delegua = new Delegua('delegua');
        const resultado = delegua.lexador.mapear("esceva('Olá mundo')");

        expect(resultado).toBeTruthy();
        expect(resultado).toHaveLength(4);
        expect(resultado).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ tipo: 'IDENTIFICADOR' }),
                expect.objectContaining({ tipo: 'PARENTESE_ESQUERDO' }),
                expect.objectContaining({ tipo: 'TEXTO' }),
                expect.objectContaining({ tipo: 'PARENTESE_DIREITO' }),
            ])
        );
    });
});
