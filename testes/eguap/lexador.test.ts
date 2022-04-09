import { Delegua } from "../../fontes/delegua";

describe('Lexador (EguaP)', () => {
    describe('mapear()', () => {
        const delegua = new Delegua('eguap');

        describe('Cenários de sucesso', () => {
            it('Sucesso - Código vazio', () => {
                const resultado = delegua.lexador.mapear(['']);

                expect(resultado).toBeTruthy();
                expect(resultado).toHaveLength(0);
            });
        });
    });
});
