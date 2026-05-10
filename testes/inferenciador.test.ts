import { inferirTipoVariavel } from '../fontes/inferenciador';
import { Literal } from '../fontes/construtos/literal';

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

        it('vetor de Literal com tipo uniforme retorna tipo[]', () => {
            const vetor = [
                new Literal(-1, 1, 'olá', 'texto'),
                new Literal(-1, 1, 'mundo', 'texto'),
            ];
            expect(inferirTipoVariavel(vetor)).toBe('texto[]');
        });

        it('vetor de Literal com tipos mistos retorna vetor', () => {
            const vetor = [
                new Literal(-1, 1, 1, 'número'),
                new Literal(-1, 1, 'olá', 'texto'),
            ];
            expect(inferirTipoVariavel(vetor)).toBe('vetor');
        });
    });
});
