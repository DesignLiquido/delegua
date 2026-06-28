import { Quinteto } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Quinteto', () => {
    it('deve gerar texto e saida', () => {
        const quinteto = new Quinteto(criarLiteral(1), criarLiteral(2), criarLiteral(3), criarLiteral(4), criarLiteral(5));
        expect(quinteto.paraTexto()).toContain('quinteto');
        expect(quinteto.paraTextoSaida()).toContain('(1, 2');
    });
});
