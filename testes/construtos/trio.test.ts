import { Trio } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Trio', () => {
    it('deve gerar texto e saida', () => {
        const trio = new Trio(criarLiteral(1), criarLiteral(2), criarLiteral(3));
        expect(trio.paraTexto()).toContain('trio');
        expect(trio.paraTextoSaida()).toContain('(1, 2, 3)');
    });
});
