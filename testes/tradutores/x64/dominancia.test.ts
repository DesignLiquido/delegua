import { computeDominancia } from '../../../fontes/tradutores/x64/dominancia';
import { IRFuncao, novoBloco, novaFuncao, valorConstante } from '../../../fontes/tradutores/x64/ir';

/** entrada -[cond]-> (a, b) -> fim -> retorno (diamante clássico). */
function construirDiamante(): IRFuncao {
    const funcao = novaFuncao('teste', false);
    funcao.blocos.clear();
    funcao.ordemBlocos = [];

    const entrada = novoBloco('entrada');
    entrada.terminador = { op: 'saltoCondicional', condicao: valorConstante(1), verdadeiro: 'a', falso: 'b' };
    const a = novoBloco('a');
    a.terminador = { op: 'salto', alvo: 'fim' };
    const b = novoBloco('b');
    b.terminador = { op: 'salto', alvo: 'fim' };
    const fim = novoBloco('fim');
    fim.terminador = { op: 'retorno' };

    for (const bloco of [entrada, a, b, fim]) {
        funcao.blocos.set(bloco.id, bloco);
        funcao.ordemBlocos.push(bloco.id);
    }
    funcao.blocoEntrada = 'entrada';
    return funcao;
}

/** entrada -> cond -[loop]-> corpo -> cond ; cond -[sai]-> fim. */
function construirLaco(): IRFuncao {
    const funcao = novaFuncao('teste', false);
    funcao.blocos.clear();
    funcao.ordemBlocos = [];

    const entrada = novoBloco('entrada');
    entrada.terminador = { op: 'salto', alvo: 'cond' };
    const cond = novoBloco('cond');
    cond.terminador = { op: 'saltoCondicional', condicao: valorConstante(1), verdadeiro: 'corpo', falso: 'fim' };
    const corpo = novoBloco('corpo');
    corpo.terminador = { op: 'salto', alvo: 'cond' };
    const fim = novoBloco('fim');
    fim.terminador = { op: 'retorno' };

    for (const bloco of [entrada, cond, corpo, fim]) {
        funcao.blocos.set(bloco.id, bloco);
        funcao.ordemBlocos.push(bloco.id);
    }
    funcao.blocoEntrada = 'entrada';
    return funcao;
}

describe('dominancia (x64)', () => {
    it('diamante: idom e fronteira de dominância corretos', () => {
        const funcao = construirDiamante();
        const { idom, domFrontier } = computeDominancia(funcao);

        expect(idom.get('a')).toBe('entrada');
        expect(idom.get('b')).toBe('entrada');
        expect(idom.get('fim')).toBe('entrada');

        expect([...domFrontier.get('a')!]).toEqual(['fim']);
        expect([...domFrontier.get('b')!]).toEqual(['fim']);
        expect(domFrontier.get('entrada')!.size).toBe(0);
        expect(domFrontier.get('fim')!.size).toBe(0);
    });

    it('laço: cabeçalho domina corpo e fim, corpo não domina nada além de si', () => {
        const funcao = construirLaco();
        const { idom, domFrontier } = computeDominancia(funcao);

        expect(idom.get('cond')).toBe('entrada');
        expect(idom.get('corpo')).toBe('cond');
        expect(idom.get('fim')).toBe('cond');

        expect([...domFrontier.get('corpo')!]).toEqual(['cond']);
        // 'cond' é cabeçalho do laço: o predecessor 'corpo' está de volta sob seu domínio,
        // mas 'cond' não domina estritamente a si mesmo — por isso 'cond' está na própria
        // fronteira de dominância (caso clássico de cabeçalho de laço).
        expect([...domFrontier.get('cond')!]).toEqual(['cond']);
    });
});
