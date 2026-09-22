import { AjudaComoConstruto } from '../../fontes/construtos';
import { criarLiteral } from './ajudantes';

describe('AjudaComoConstruto', () => {
    it('deve aceitar visitante e respeitar funcao=Não', async () => {
        const visitante = { visitarExpressaoAjuda: jest.fn().mockReturnValue('ok') } as any;
        const ajuda = new AjudaComoConstruto(1, 1, criarLiteral(10), false);

        expect(await ajuda.aceitar(visitante)).toBe('ok');
        expect(ajuda.paraTexto()).toContain('funcao=Não');
        expect(() => ajuda.paraTextoSaida()).toThrow('Method not implemented.');
    });
});
