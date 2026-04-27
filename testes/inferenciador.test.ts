import { inferirTipoVariavel } from '../fontes/inferenciador';

describe('inferirTipoVariavel', () => {
    describe('inferência de vetores', () => {
        it('vetor vazio retorna vetor', () => {
            expect(inferirTipoVariavel([])).toBe('vetor');
        });

        it('vetor misto retorna vetor', () => {
            expect(inferirTipoVariavel([1, 'a', true])).toBe('vetor');
        });

        it('vetor com elemento nulo não deve lançar exceção - issue 1225', () => {
            expect(() => inferirTipoVariavel([null, 1, 2])).not.toThrow();
        });

        it('vetor com elemento nulo retorna vetor - issue 1225', () => {
            expect(inferirTipoVariavel([null, 1, 2])).toBe('vetor');
        });

        it('vetor com apenas elementos nulos retorna vetor', () => {
            expect(inferirTipoVariavel([null, null, null])).toBe('vetor');
        });

        it('vetor com elemento indefinido não deve lançar exceção', () => {
            expect(() => inferirTipoVariavel([undefined, 1, 2])).not.toThrow();
        });
    });
});
