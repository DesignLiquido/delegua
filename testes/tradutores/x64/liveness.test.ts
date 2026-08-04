import { analisarVivacidade } from '../../../fontes/tradutores/x64/liveness';
import { IRFuncao, novoBloco, novaFuncao, valorConstante, valorRegistrador } from '../../../fontes/tradutores/x64/ir';

/**
 * CFG com phi já em SSA (não passa por construirSSA, monta direto):
 *   entrada: x.1 = 1; salto cond
 *   cond: x.2 = phi(entrada: x.1, corpo: x.3); t = x.2 < 10; se t: corpo senão: fim
 *   corpo: x.3 = x.2 + 1; salto cond
 *   fim: retorno x.2
 * Existe pra testar especificamente a "vivacidade ciente de SSA": operando de phi conta
 * como uso no bloco PREDECESSOR (na aresta), não como uso dentro do bloco do phi.
 */
function construirFuncaoComPhi(): IRFuncao {
    const funcao = novaFuncao('teste', false);
    funcao.blocos.clear();
    funcao.ordemBlocos = [];

    const entrada = novoBloco('entrada');
    entrada.instrucoes.push({ op: 'copia', dst: 'x.1', src: valorConstante(1) });
    entrada.terminador = { op: 'salto', alvo: 'cond' };

    const cond = novoBloco('cond');
    cond.phis.push({
        dst: 'x.2',
        variavel: 'x',
        opcoes: [
            { predecessor: 'entrada', valor: valorRegistrador('x.1') },
            { predecessor: 'corpo', valor: valorRegistrador('x.3') },
        ],
    });
    cond.instrucoes.push({ op: 'bin', dst: 't', operador: '<', esquerda: valorRegistrador('x.2'), direita: valorConstante(10) });
    cond.terminador = { op: 'saltoCondicional', condicao: valorRegistrador('t'), verdadeiro: 'corpo', falso: 'fim' };

    const corpo = novoBloco('corpo');
    corpo.instrucoes.push({ op: 'bin', dst: 'x.3', operador: '+', esquerda: valorRegistrador('x.2'), direita: valorConstante(1) });
    corpo.terminador = { op: 'salto', alvo: 'cond' };

    const fim = novoBloco('fim');
    fim.terminador = { op: 'retorno', valor: valorRegistrador('x.2') };

    for (const bloco of [entrada, cond, corpo, fim]) {
        funcao.blocos.set(bloco.id, bloco);
        funcao.ordemBlocos.push(bloco.id);
    }
    funcao.blocoEntrada = 'entrada';
    return funcao;
}

describe('vivacidade (x64)', () => {
    it('operando de phi é live-out do predecessor correspondente, não live-in do bloco do phi', () => {
        const funcao = construirFuncaoComPhi();
        const vivacidade = analisarVivacidade(funcao);

        expect(vivacidade.get('entrada')!.liveOut.has('x.1')).toBe(true);
        expect(vivacidade.get('corpo')!.liveOut.has('x.3')).toBe(true);

        // x.2 (definido pelo phi) não é "usado" dentro do próprio bloco 'cond' via phi.
        expect(vivacidade.get('cond')!.liveIn.has('x.2')).toBe(false);
    });

    it('x.2 fica vivo através de cond até ser lido em corpo e em fim', () => {
        const funcao = construirFuncaoComPhi();
        const vivacidade = analisarVivacidade(funcao);

        expect(vivacidade.get('cond')!.liveOut.has('x.2')).toBe(true);
        expect(vivacidade.get('corpo')!.liveIn.has('x.2')).toBe(true);
        expect(vivacidade.get('fim')!.liveIn.has('x.2')).toBe(true);
    });

    it('x.1 não está vivo em nenhum bloco além de entrada (só alimenta o phi)', () => {
        const funcao = construirFuncaoComPhi();
        const vivacidade = analisarVivacidade(funcao);

        expect(vivacidade.get('cond')!.liveIn.has('x.1')).toBe(false);
        expect(vivacidade.get('corpo')!.liveIn.has('x.1')).toBe(false);
    });
});
