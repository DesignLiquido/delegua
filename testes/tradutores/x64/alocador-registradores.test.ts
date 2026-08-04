import { alocarRegistradores } from '../../../fontes/tradutores/x64/alocador-registradores';
import { IRFuncao, novoBloco, novaFuncao, valorConstante, valorRegistrador } from '../../../fontes/tradutores/x64/ir';

/**
 * a, c e d ficam simultaneamente vivos entre a definição de `d` e a de `e`:
 *   a=1; b=2; c=3; d=a+b; e=c+d; f=a+e; retorna f
 * (c é necessário por `e`, d é necessário por `e`, a é necessário só depois por `f`.)
 */
function construirFuncaoComTresVivos(): IRFuncao {
    const funcao = novaFuncao('teste', false);
    funcao.blocos.clear();
    funcao.ordemBlocos = [];

    const bloco = novoBloco('entrada');
    bloco.instrucoes.push(
        { op: 'const', dst: 'a', valor: 1 },
        { op: 'const', dst: 'b', valor: 2 },
        { op: 'const', dst: 'c', valor: 3 },
        { op: 'bin', dst: 'd', operador: '+', esquerda: valorRegistrador('a'), direita: valorRegistrador('b') },
        { op: 'bin', dst: 'e', operador: '+', esquerda: valorRegistrador('c'), direita: valorRegistrador('d') },
        { op: 'bin', dst: 'f', operador: '+', esquerda: valorRegistrador('a'), direita: valorRegistrador('e') }
    );
    bloco.terminador = { op: 'retorno', valor: valorRegistrador('f') };

    funcao.blocos.set(bloco.id, bloco);
    funcao.ordemBlocos.push(bloco.id);
    funcao.blocoEntrada = 'entrada';
    return funcao;
}

describe('alocador de registradores (x64)', () => {
    it('com paleta suficiente, valores que interferem recebem cores físicas distintas', () => {
        const funcao = construirFuncaoComTresVivos();
        const { alocacao } = alocarRegistradores(funcao, ['r1', 'r2', 'r3']);

        const corA = alocacao.get('a')!;
        const corC = alocacao.get('c')!;
        const corD = alocacao.get('d')!;

        expect(corA.tipo).toBe('registrador');
        expect(corC.tipo).toBe('registrador');
        expect(corD.tipo).toBe('registrador');

        const fisicos = new Set([corA, corC, corD].map((a) => (a as { fisico: string }).fisico));
        expect(fisicos.size).toBe(3);
    });

    it('sem cores suficientes, o excedente é colocado em pilha (spill) em vez de falhar', () => {
        const funcao = construirFuncaoComTresVivos();
        const { alocacao, tamanhoSpillBytes } = alocarRegistradores(funcao, ['r1', 'r2']);

        const alocacoes = [...alocacao.values()];
        const emPilha = alocacoes.filter((a) => a.tipo === 'pilha');
        expect(emPilha.length).toBeGreaterThan(0);
        expect(tamanhoSpillBytes).toBeGreaterThan(0);

        // Todo nó ainda recebe alguma alocação válida (registrador ou pilha) — nada fica sem local.
        for (const nome of ['a', 'b', 'c', 'd', 'e', 'f']) {
            expect(alocacao.has(nome)).toBe(true);
        }
    });

    it('nunca atribui a mesma cor física a dois nós que interferem entre si', () => {
        const funcao = construirFuncaoComTresVivos();
        const { alocacao } = alocarRegistradores(funcao, ['r1', 'r2', 'r3', 'r4']);

        // a e c e d interferem entre si dois-a-dois (vivos simultaneamente); se algum par
        // acabou em registrador, as cores não podem coincidir.
        const pares: Array<[string, string]> = [
            ['a', 'c'],
            ['a', 'd'],
            ['c', 'd'],
        ];
        for (const [x, y] of pares) {
            const locX = alocacao.get(x)!;
            const locY = alocacao.get(y)!;
            if (locX.tipo === 'registrador' && locY.tipo === 'registrador') {
                expect(locX.fisico).not.toBe(locY.fisico);
            }
        }
    });
});
