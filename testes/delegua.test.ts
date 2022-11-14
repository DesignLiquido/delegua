import { Delegua } from '../fontes/delegua';

describe('Delégua', () => {
    let delegua: Delegua;

    beforeEach(() => {
        delegua = new Delegua('delegua');
    });

    describe('Sucesso', () => {
        it('Obter versão Delégua', () => {
            const versaoDelegua = delegua.versao();

            expect(versaoDelegua).toBeTruthy();
        });
    });
});
