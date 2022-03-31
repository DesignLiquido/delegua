import { Delegua } from '../src/delegua';
// import { Lexador } from '../src/lexador';

describe('lexador', () => {
    it('mapear()', () => {
        const delegua = new Delegua('delegua');
        const resultado = delegua.lexador.mapear("esceva('Olá mundo')");
        expect(resultado).toBeTruthy();
    });
});