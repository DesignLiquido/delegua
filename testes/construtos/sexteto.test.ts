import { Sexteto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Sexteto', () => {
    it('deve gerar texto e saida', () => {
        const sexteto = new Sexteto(criarLiteral(1), criarLiteral(2), criarLiteral(3), criarLiteral(4), criarLiteral(5), criarLiteral(6));
        expect(sexteto.paraTexto()).toContain('sexteto');
        expect(sexteto.paraTextoSaida()).toContain('(1, 2, 3, 4, 5, 6)');
    });
});
