import { IRFuncao } from './ir';

/**
 * Recalcula `sucessores`/`predecessores` de cada bloco a partir do terminador.
 * Chamado depois de qualquer alteração na CFG (lowering, divisão de arestas críticas em dessa.ts).
 */
export function prepararCFG(funcao: IRFuncao): void {
    for (const bloco of funcao.blocos.values()) {
        bloco.predecessores = [];
        switch (bloco.terminador.op) {
            case 'salto':
                bloco.sucessores = [bloco.terminador.alvo];
                break;
            case 'saltoCondicional':
                bloco.sucessores = [bloco.terminador.verdadeiro, bloco.terminador.falso];
                break;
            case 'retorno':
                bloco.sucessores = [];
                break;
        }
    }

    for (const bloco of funcao.blocos.values()) {
        for (const sucessorId of bloco.sucessores) {
            const sucessor = funcao.blocos.get(sucessorId);
            if (sucessor && !sucessor.predecessores.includes(bloco.id)) {
                sucessor.predecessores.push(bloco.id);
            }
        }
    }
}

/** Ordem pós-fixa reversa a partir do bloco de entrada, alcançando somente blocos vivos. */
export function ordemPosFixaReversa(funcao: IRFuncao): string[] {
    const visitados = new Set<string>();
    const posFixa: string[] = [];

    function visitar(id: string): void {
        if (visitados.has(id)) return;
        visitados.add(id);
        const bloco = funcao.blocos.get(id);
        if (!bloco) return;
        for (const sucessorId of bloco.sucessores) {
            visitar(sucessorId);
        }
        posFixa.push(id);
    }

    visitar(funcao.blocoEntrada);
    return posFixa.reverse();
}

export interface ResultadoDominancia {
    /** idom[bloco] = dominador imediato. idom[entrada] = entrada. */
    idom: Map<string, string>;
    domFrontier: Map<string, Set<string>>;
    /** blocos alcançáveis a partir da entrada, em ordem pós-fixa reversa. */
    ordem: string[];
}

/**
 * Algoritmo iterativo de Cooper/Harvey/Kennedy ("A Simple, Fast Dominance Algorithm").
 * Preferido a Lengauer-Tarjan aqui por ser bem mais simples de implementar corretamente,
 * e funções Delégua traduzidas para x64 têm poucos blocos — o custo O(n^2) no pior caso
 * não é relevante.
 */
export function computeDominancia(funcao: IRFuncao): ResultadoDominancia {
    prepararCFG(funcao);
    const ordem = ordemPosFixaReversa(funcao);
    const indiceNaOrdem = new Map<string, number>();
    ordem.forEach((id, indice) => indiceNaOrdem.set(id, indice));

    const idom = new Map<string, string>();
    idom.set(funcao.blocoEntrada, funcao.blocoEntrada);

    function interseccao(a: string, b: string): string {
        while (a !== b) {
            while (indiceNaOrdem.get(a)! > indiceNaOrdem.get(b)!) {
                a = idom.get(a)!;
            }
            while (indiceNaOrdem.get(b)! > indiceNaOrdem.get(a)!) {
                b = idom.get(b)!;
            }
        }
        return a;
    }

    let mudou = true;
    while (mudou) {
        mudou = false;
        for (const id of ordem) {
            if (id === funcao.blocoEntrada) continue;
            const bloco = funcao.blocos.get(id)!;
            const predsProcessados = bloco.predecessores.filter((p) => idom.has(p));
            if (predsProcessados.length === 0) continue;

            let novoIdom = predsProcessados[0];
            for (const pred of predsProcessados.slice(1)) {
                novoIdom = interseccao(novoIdom, pred);
            }

            if (idom.get(id) !== novoIdom) {
                idom.set(id, novoIdom);
                mudou = true;
            }
        }
    }

    const domFrontier = new Map<string, Set<string>>();
    for (const id of ordem) domFrontier.set(id, new Set());

    for (const id of ordem) {
        const bloco = funcao.blocos.get(id)!;
        if (bloco.predecessores.length < 2) continue;
        for (const pred of bloco.predecessores) {
            if (!idom.has(pred)) continue;
            let runner = pred;
            while (runner !== idom.get(id)) {
                domFrontier.get(runner)!.add(id);
                runner = idom.get(runner)!;
            }
        }
    }

    return { idom, domFrontier, ordem };
}

/** Filhos imediatos de cada bloco na árvore de dominância (para percorrer em pré-ordem na renomeação SSA). */
export function arvoreDominancia(resultado: ResultadoDominancia, blocoEntrada: string): Map<string, string[]> {
    const filhos = new Map<string, string[]>();
    for (const id of resultado.ordem) filhos.set(id, []);

    for (const [id, dominador] of resultado.idom) {
        if (id === blocoEntrada) continue;
        filhos.get(dominador)?.push(id);
    }

    return filhos;
}
