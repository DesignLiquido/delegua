import { analisarVivacidade } from './liveness';
import { IRFuncao, IRValor } from './ir';

export type Alocacao =
    | { tipo: 'registrador'; fisico: string }
    | { tipo: 'pilha'; offsetBytes: number };

export interface ResultadoAlocacao {
    alocacao: Map<string, Alocacao>;
    /** Bytes de pilha reservados só para slots de spill (função ainda soma vetores locais por cima). */
    tamanhoSpillBytes: number;
}

function usosEDstDoValor(valor: IRValor, saida: Set<string>): void {
    if (valor.classe === 'registrador') saida.add(valor.nome);
}

/**
 * Constrói o grafo de interferência de `funcao` (já em SSA) varrendo cada bloco de trás
 * para frente a partir de liveOut, no estilo clássico (Appel, "Modern Compiler
 * Implementation"). Phis são tratados como definições paralelas no topo do bloco: cada
 * phi.dst interfere com liveIn(bloco) e com os demais phis do mesmo bloco.
 */
function construirGrafoInterferencia(funcao: IRFuncao): Map<string, Set<string>> {
    const vivacidade = analisarVivacidade(funcao);
    const grafo = new Map<string, Set<string>>();

    function no(nome: string): Set<string> {
        if (!grafo.has(nome)) grafo.set(nome, new Set());
        return grafo.get(nome)!;
    }

    function ligar(a: string, b: string): void {
        if (a === b) return;
        no(a).add(b);
        no(b).add(a);
    }

    for (const [blocoId, bloco] of funcao.blocos) {
        const vivacidadeBloco = vivacidade.get(blocoId)!;
        const live = new Set(vivacidadeBloco.liveOut);

        for (let i = bloco.instrucoes.length - 1; i >= 0; i--) {
            const instrucao = bloco.instrucoes[i];
            let dst: string | null = null;
            if (
                instrucao.op === 'const' ||
                instrucao.op === 'copia' ||
                instrucao.op === 'bin' ||
                instrucao.op === 'neg' ||
                instrucao.op === 'nao' ||
                instrucao.op === 'enderecoRotulo' ||
                instrucao.op === 'carregarGlobal' ||
                instrucao.op === 'indiceLer'
            ) {
                dst = instrucao.dst;
            } else if (instrucao.op === 'chamada') {
                dst = instrucao.dst;
            }

            if (dst) {
                no(dst);
                for (const outro of live) ligar(dst, outro);
                live.delete(dst);
            }

            const usos = new Set<string>();
            switch (instrucao.op) {
                case 'copia':
                    usosEDstDoValor(instrucao.src, usos);
                    break;
                case 'bin':
                    usosEDstDoValor(instrucao.esquerda, usos);
                    usosEDstDoValor(instrucao.direita, usos);
                    break;
                case 'neg':
                case 'nao':
                    usosEDstDoValor(instrucao.src, usos);
                    break;
                case 'indiceLer':
                    usosEDstDoValor(instrucao.indice, usos);
                    break;
                case 'indiceEscrever':
                    usosEDstDoValor(instrucao.indice, usos);
                    usosEDstDoValor(instrucao.valor, usos);
                    break;
                case 'armazenarGlobal':
                    usosEDstDoValor(instrucao.valor, usos);
                    break;
                case 'chamada':
                    for (const argumento of instrucao.argumentos) usosEDstDoValor(argumento, usos);
                    break;
                case 'imprimirNumero':
                    usosEDstDoValor(instrucao.valor, usos);
                    break;
                default:
                    break;
            }
            for (const reg of usos) live.add(reg);
        }

        for (let i = 0; i < bloco.phis.length; i++) {
            const phi = bloco.phis[i];
            no(phi.dst);
            for (const outro of live) ligar(phi.dst, outro);
            for (let j = 0; j < bloco.phis.length; j++) {
                if (i !== j) ligar(phi.dst, bloco.phis[j].dst);
            }
        }
    }

    return grafo;
}

/**
 * Aloca registradores por coloração de grafo (Chaitin: simplifica removendo nós de grau
 * < k, desempata heurística de spill pelo maior grau, depois seleciona cores na ordem
 * inversa da pilha de simplificação).
 *
 * Simplificação deliberada em relação ao Chaitin-Briggs "clássico": um nó que não
 * consegue cor na seleção não gera reescrita do IR com nova ronda de vivacidade — ele é
 * marcado como residente em memória (`pilha`) permanentemente. Como valores em memória
 * nunca ocupam a paleta, eles não geram pressão de registrador nenhuma, e o
 * carregamento/gravação em torno de cada uso/definição é sintetizado depois, direto no
 * codegen, usando os escradores rax/rdx (sempre reservados, fora da paleta). Isso evita
 * o laço iterativo clássico de reescrita+recoloração mantendo a alocação corretamente
 * livre de conflitos.
 */
export function alocarRegistradores(funcao: IRFuncao, paleta: string[]): ResultadoAlocacao {
    const grafo = construirGrafoInterferencia(funcao);
    const grauAtual = new Map<string, number>();
    for (const [no, vizinhos] of grafo) grauAtual.set(no, vizinhos.size);

    const removidos = new Set<string>();
    const pilha: string[] = [];
    const todosOsNos = [...grafo.keys()];

    function grauEfetivo(no: string): number {
        let grau = 0;
        for (const vizinho of grafo.get(no)!) {
            if (!removidos.has(vizinho)) grau++;
        }
        return grau;
    }

    while (removidos.size < todosOsNos.length) {
        let escolhido: string | null = null;

        for (const no of todosOsNos) {
            if (removidos.has(no)) continue;
            if (grauEfetivo(no) < paleta.length) {
                escolhido = no;
                break;
            }
        }

        if (!escolhido) {
            let maiorGrau = -1;
            for (const no of todosOsNos) {
                if (removidos.has(no)) continue;
                const grau = grauEfetivo(no);
                if (grau > maiorGrau) {
                    maiorGrau = grau;
                    escolhido = no;
                }
            }
        }

        if (!escolhido) break;
        pilha.push(escolhido);
        removidos.add(escolhido);
    }

    const corPorNo = new Map<string, string>();
    const spilled = new Set<string>();

    while (pilha.length > 0) {
        const no = pilha.pop()!;
        const coresVizinhas = new Set<string>();
        for (const vizinho of grafo.get(no)!) {
            const cor = corPorNo.get(vizinho);
            if (cor) coresVizinhas.add(cor);
        }
        const disponivel = paleta.find((cor) => !coresVizinhas.has(cor));
        if (disponivel) {
            corPorNo.set(no, disponivel);
        } else {
            spilled.add(no);
        }
    }

    const alocacao = new Map<string, Alocacao>();
    let proximoSlot = 0;
    for (const no of todosOsNos) {
        const cor = corPorNo.get(no);
        if (cor) {
            alocacao.set(no, { tipo: 'registrador', fisico: cor });
        } else {
            proximoSlot++;
            alocacao.set(no, { tipo: 'pilha', offsetBytes: -8 * proximoSlot });
        }
    }

    return { alocacao, tamanhoSpillBytes: 8 * proximoSlot };
}
