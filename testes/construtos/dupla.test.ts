import { Dupla } from '../../fontes/construtos/tuplas';
import { criarLiteral } from './ajudantes';

describe('Dupla', () => {
    it('deve gerar texto e saida', () => {
        const dupla = new Dupla(criarLiteral(1), criarLiteral(2));
        expect(dupla.paraTexto()).toContain('dupla');
        expect(dupla.paraTextoSaida()).toContain('(1, 2)');
    });
});
