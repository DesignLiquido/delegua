import { Constante } from '../../fontes/construtos';
import { criarSimbolo } from './ajudantes';

describe('Constante', () => {
    it('deve aceitar visitante e formatar texto', async () => {
        const visitante = { visitarExpressaoDeVariavel: jest.fn().mockReturnValue('ok') } as any;
        const constante = new Constante(1, criarSimbolo('valorConstante'));

        expect(await constante.aceitar(visitante)).toBe('ok');
        expect(constante.paraTexto()).toContain('constante');
        expect(() => constante.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
