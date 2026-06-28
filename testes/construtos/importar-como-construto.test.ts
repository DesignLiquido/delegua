import { ImportarComoConstruto } from '../../fontes/construtos';
import { criarLiteral } from './ajudantes';

describe('ImportarComoConstruto', () => {
    it('deve aceitar visitante e serializar caminho', async () => {
        const visitante = { visitarExpressaoImportar: jest.fn().mockReturnValue('ok') } as any;
        const importar = new ImportarComoConstruto(criarLiteral('biblioteca', 'texto'));

        expect(await importar.aceitar(visitante)).toBe('ok');
        expect(importar.paraTexto()).toContain('importar-como-construto');
        expect(() => importar.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
