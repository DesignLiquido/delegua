import { Delegua } from '../../fontes/delegua';

describe('Lexador Birl', () => {
    let delegua: Delegua;

    beforeEach(() => {
        delegua = new Delegua('birl');
    });
    it('Arquivo vazio.', () => {
        const resultado = delegua.lexador.mapear([''], -1);

        expect(resultado).toBeTruthy();
        expect(resultado.simbolos).toHaveLength(0);
    });
    it('Programa vazio.', () => {
        const resultado = delegua.lexador.mapear(['HORA DO SHOW \n', 'BIRL \n'], -1);

        expect(resultado).toBeTruthy();
        expect(resultado.simbolos).toHaveLength(2);
    });
    it('Programa Olá mundo simples.', () => {
        const resultado = delegua.lexador.mapear(
            [
                'HORA DO SHOW \n',
                '   CE QUER VER ESSA PORRA? ("Hello, World! Porra!\n"); \n',
                '   BORA CUMPADE? 0; \n',
                'BIRL \n',
            ],
            -1
        );

        expect(resultado).toBeTruthy();
        expect(resultado.simbolos).toHaveLength(9);
        expect(resultado.erros).toHaveLength(0);
    });
});
