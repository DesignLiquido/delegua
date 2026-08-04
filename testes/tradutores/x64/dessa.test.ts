import { Alocacao } from '../../../fontes/tradutores/x64/alocador-registradores';
import { destruirSSA } from '../../../fontes/tradutores/x64/dessa';
import { IRFuncao, IRValor, novoBloco, novaFuncao, valorConstante, valorRegistrador } from '../../../fontes/tradutores/x64/ir';

/**
 * Laço que troca `a` e `b` a cada iteração (equivalente a `a, b = b, a`). O bloco `corpo`
 * é o predecessor da aresta de volta a `cond` e não redefine nada — ele só "devolve" a.2 e
 * b.2 trocados como opções do phi. Isso é o clássico "problema da troca": phi(a) recebe a
 * localização física de phi(b) e vice-versa, então resolver os phis ingenuamente e em
 * sequência (em vez de como atribuição paralela) corromperia os valores.
 */
function construirLacoComTroca(): IRFuncao {
    const funcao = novaFuncao('teste', false);
    funcao.blocos.clear();
    funcao.ordemBlocos = [];

    const entrada = novoBloco('entrada');
    entrada.instrucoes.push(
        { op: 'const', dst: 'a.1', valor: 111 },
        { op: 'const', dst: 'b.1', valor: 222 }
    );
    entrada.terminador = { op: 'salto', alvo: 'cond' };

    const cond = novoBloco('cond');
    cond.phis.push(
        {
            dst: 'a.2',
            variavel: 'a',
            opcoes: [
                { predecessor: 'entrada', valor: valorRegistrador('a.1') },
                { predecessor: 'corpo', valor: valorRegistrador('b.2') },
            ],
        },
        {
            dst: 'b.2',
            variavel: 'b',
            opcoes: [
                { predecessor: 'entrada', valor: valorRegistrador('b.1') },
                { predecessor: 'corpo', valor: valorRegistrador('a.2') },
            ],
        }
    );
    cond.terminador = { op: 'saltoCondicional', condicao: valorConstante(1), verdadeiro: 'corpo', falso: 'fim' };

    const corpo = novoBloco('corpo');
    corpo.terminador = { op: 'salto', alvo: 'cond' };

    const fim = novoBloco('fim');
    fim.terminador = { op: 'retorno', valor: valorRegistrador('a.2') };

    for (const bloco of [entrada, cond, corpo, fim]) {
        funcao.blocos.set(bloco.id, bloco);
        funcao.ordemBlocos.push(bloco.id);
    }
    funcao.blocoEntrada = 'entrada';
    return funcao;
}

/** Executa uma lista de instruções 'copia' contra um banco de registradores fake, seguindo `alocacao`. */
function simular(instrucoes: Array<{ op: string; dst?: string; src?: IRValor }>, alocacao: Map<string, Alocacao>, banco: Record<string, number>) {
    for (const instrucao of instrucoes) {
        if (instrucao.op !== 'copia') continue;
        const destinoLoc = alocacao.get(instrucao.dst!)!;
        if (destinoLoc.tipo !== 'registrador') throw new Error('teste só cobre destinos em registrador');
        const valor = instrucao.src!;
        let lido: number;
        if (valor.classe === 'constante') {
            lido = Number(valor.valor);
        } else if (valor.classe === 'registrador') {
            const origemLoc = alocacao.get(valor.nome)!;
            if (origemLoc.tipo !== 'registrador') throw new Error('teste só cobre origem em registrador');
            lido = banco[origemLoc.fisico] ?? 0;
        } else {
            throw new Error('valor inesperado no teste');
        }
        banco[destinoLoc.fisico] = lido;
    }
}

describe('destruição de SSA (x64)', () => {
    it('resolve o problema da troca (a,b = b,a) sem corromper valores', () => {
        const funcao = construirLacoComTroca();
        const alocacao = new Map<string, Alocacao>([
            ['a.1', { tipo: 'registrador', fisico: 'RX' }],
            ['b.1', { tipo: 'registrador', fisico: 'RY' }],
            ['a.2', { tipo: 'registrador', fisico: 'RX' }],
            ['b.2', { tipo: 'registrador', fisico: 'RY' }],
        ]);

        destruirSSA(funcao, alocacao);

        const corpo = funcao.blocos.get('corpo')!;
        expect(corpo.instrucoes.length).toBeGreaterThan(0);

        // Estado antes da rodada de cópias do laço: RX guarda o a.2 atual, RY o b.2 atual.
        const banco: Record<string, number> = { RX: 111, RY: 222, rax: 0 };
        simular(corpo.instrucoes as any, alocacao, banco);

        expect(banco.RX).toBe(222); // novo a.2 = b.2 antigo
        expect(banco.RY).toBe(111); // novo b.2 = a.2 antigo
    });

    it('phis do bloco alvo são eliminados após a destruição de SSA', () => {
        const funcao = construirLacoComTroca();
        const alocacao = new Map<string, Alocacao>([
            ['a.1', { tipo: 'registrador', fisico: 'RX' }],
            ['b.1', { tipo: 'registrador', fisico: 'RY' }],
            ['a.2', { tipo: 'registrador', fisico: 'RX' }],
            ['b.2', { tipo: 'registrador', fisico: 'RY' }],
        ]);

        destruirSSA(funcao, alocacao);

        expect(funcao.blocos.get('cond')!.phis.length).toBe(0);
    });
});
