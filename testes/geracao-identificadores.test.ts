import { cyrb53 } from "../fontes/geracao-identificadores";

describe('Funções relativas a geração de identificadores', () => {
    describe('cyrb53', () => {
        it('Trivial', () => {
            const testeCyrb53 = cyrb53('teste-arquivo.delegua');
            expect(testeCyrb53).toBe(242598079778597);
        });
    });
});
