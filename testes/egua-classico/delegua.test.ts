import { Delegua } from '../../fontes/delegua';

describe('Delégua - (Égua Clássico)', () => {
    describe('Falha', () => {
        it('Depurador', () => {
            expect(() => new Delegua('egua', false, true)).toThrow(
                new Error('Dialeto egua não suporta depuração.')
            );
        });
    });
});
