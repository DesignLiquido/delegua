import { Chamada } from '../../fontes/construtos';
import { criarLiteral } from './ajudantes';

describe('Chamada', () => {
    it('deve aceitar visitante e serializar argumentos', async () => {
        const visitante = { visitarExpressaoDeChamada: jest.fn().mockReturnValue('ok') } as any;
        const chamada = new Chamada(1, criarLiteral('somar', 'texto'), [criarLiteral(1), criarLiteral(2)]);

        expect(await chamada.aceitar(visitante)).toBe('ok');
        expect(chamada.paraTexto()).toContain('chamada');
        expect(() => chamada.paraTextoSaida()).toThrow('Método não implementado.');
    });
});
