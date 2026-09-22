import { Quarteto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Quarteto', () => {
    it('deve gerar texto', () => {
        const quarteto = new Quarteto(criarLiteral(1), criarLiteral(2), criarLiteral(3), criarLiteral(4));
        expect(quarteto.paraTexto()).toContain('quarteto');
        expect(quarteto.paraTextoSaida()).toContain('(1, 2, 3, 4)');
    });
});
