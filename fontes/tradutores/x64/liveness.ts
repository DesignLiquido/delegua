import { IRFuncao, IRInstrucao, IRValor } from './ir';
import { ordemPosFixaReversa, prepararCFG } from './dominancia';

export interface ConjuntosVivacidade {
    liveIn: Set<string>;
    liveOut: Set<string>;
}

function registradoresLidos(valor: IRValor, saida: Set<string>): void {
    if (valor.classe === 'registrador') saida.add(valor.nome);
}

function usosDaInstrucao(instrucao: IRInstrucao, saida: Set<string>): void {
    switch (instrucao.op) {
        case 'copia':
            registradoresLidos(instrucao.src, saida);
            break;
        case 'bin':
            registradoresLidos(instrucao.esquerda, saida);
            registradoresLidos(instrucao.direita, saida);
            break;
        case 'neg':
        case 'nao':
            registradoresLidos(instrucao.src, saida);
            break;
        case 'indiceLer':
            registradoresLidos(instrucao.indice, saida);
            break;
        case 'indiceEscrever':
            registradoresLidos(instrucao.indice, saida);
            registradoresLidos(instrucao.valor, saida);
            break;
        case 'armazenarGlobal':
            registradoresLidos(instrucao.valor, saida);
            break;
        case 'chamada':
            for (const argumento of instrucao.argumentos) registradoresLidos(argumento, saida);
            break;
        case 'imprimirNumero':
            registradoresLidos(instrucao.valor, saida);
            break;
        default:
            break;
    }
}

function dstDaInstrucao(instrucao: IRInstrucao): string | null {
    switch (instrucao.op) {
        case 'const':
        case 'copia':
        case 'bin':
        case 'neg':
        case 'nao':
        case 'enderecoRotulo':
        case 'carregarGlobal':
        case 'indiceLer':
            return instrucao.dst;
        case 'chamada':
            return instrucao.dst;
        default:
            return null;
    }
}

/**
 * Vivacidade "SSA-aware": operandos de phi são considerados usados no *predecessor*
 * correspondente (na aresta), não no bloco onde o phi está — o phi em si não gera uso
 * local nenhum. Ver Brandner et al., "Computing Liveness Sets for SSA-Form Programs".
 */
export function analisarVivacidade(funcao: IRFuncao): Map<string, ConjuntosVivacidade> {
    prepararCFG(funcao);
    const ordem = ordemPosFixaReversa(funcao);

    const use = new Map<string, Set<string>>();
    const def = new Map<string, Set<string>>();

    for (const blocoId of ordem) {
        const bloco = funcao.blocos.get(blocoId)!;
        const usaLocal = new Set<string>();
        const defineLocal = new Set<string>();

        for (const phi of bloco.phis) {
            defineLocal.add(phi.dst);
        }

        for (const instrucao of bloco.instrucoes) {
            const usos = new Set<string>();
            usosDaInstrucao(instrucao, usos);
            for (const reg of usos) {
                if (!defineLocal.has(reg)) usaLocal.add(reg);
            }
            const dst = dstDaInstrucao(instrucao);
            if (dst) defineLocal.add(dst);
        }

        if (bloco.terminador.op === 'saltoCondicional') {
            const usos = new Set<string>();
            registradoresLidos(bloco.terminador.condicao, usos);
            for (const reg of usos) if (!defineLocal.has(reg)) usaLocal.add(reg);
        } else if (bloco.terminador.op === 'retorno' && bloco.terminador.valor) {
            const usos = new Set<string>();
            registradoresLidos(bloco.terminador.valor, usos);
            for (const reg of usos) if (!defineLocal.has(reg)) usaLocal.add(reg);
        }

        use.set(blocoId, usaLocal);
        def.set(blocoId, defineLocal);
    }

    const liveIn = new Map<string, Set<string>>();
    const liveOut = new Map<string, Set<string>>();
    for (const blocoId of ordem) {
        liveIn.set(blocoId, new Set());
        liveOut.set(blocoId, new Set());
    }

    let mudou = true;
    while (mudou) {
        mudou = false;
        // Ordem topológica reversa (do fim para o começo) converge mais rápido num fluxo backward.
        for (let i = ordem.length - 1; i >= 0; i--) {
            const blocoId = ordem[i];
            const bloco = funcao.blocos.get(blocoId)!;

            const novoLiveOut = new Set<string>();
            for (const sucessorId of bloco.sucessores) {
                const sucessor = funcao.blocos.get(sucessorId)!;
                const dstsPhiSucessor = new Set(sucessor.phis.map((phi) => phi.dst));

                for (const reg of liveIn.get(sucessorId)!) {
                    if (!dstsPhiSucessor.has(reg)) novoLiveOut.add(reg);
                }

                for (const phi of sucessor.phis) {
                    const opcao = phi.opcoes.find((o) => o.predecessor === blocoId);
                    if (opcao && opcao.valor.classe === 'registrador') {
                        novoLiveOut.add(opcao.valor.nome);
                    }
                }
            }

            const novoLiveIn = new Set(use.get(blocoId)!);
            for (const reg of novoLiveOut) {
                if (!def.get(blocoId)!.has(reg)) novoLiveIn.add(reg);
            }

            if (!conjuntosIguais(novoLiveIn, liveIn.get(blocoId)!) || !conjuntosIguais(novoLiveOut, liveOut.get(blocoId)!)) {
                liveIn.set(blocoId, novoLiveIn);
                liveOut.set(blocoId, novoLiveOut);
                mudou = true;
            }
        }
    }

    const resultado = new Map<string, ConjuntosVivacidade>();
    for (const blocoId of ordem) {
        resultado.set(blocoId, { liveIn: liveIn.get(blocoId)!, liveOut: liveOut.get(blocoId)! });
    }
    return resultado;
}

function conjuntosIguais(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) return false;
    for (const item of a) if (!b.has(item)) return false;
    return true;
}
