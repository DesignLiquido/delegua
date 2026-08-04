import { arvoreDominancia, computeDominancia } from './dominancia';
import { IRFuncao, IRInstrucao, IRPhi, IRValor } from './ir';

function obterDst(instrucao: IRInstrucao): string | null {
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

function reescreverUsos(valor: IRValor, pilhas: Map<string, string[]>): IRValor {
    if (valor.classe !== 'registrador') return valor;
    const pilha = pilhas.get(valor.nome);
    if (!pilha || pilha.length === 0) return valor;
    return { classe: 'registrador', nome: pilha[pilha.length - 1] };
}

function reescreverUsosInstrucao(instrucao: IRInstrucao, pilhas: Map<string, string[]>): void {
    switch (instrucao.op) {
        case 'copia':
            instrucao.src = reescreverUsos(instrucao.src, pilhas);
            break;
        case 'bin':
            instrucao.esquerda = reescreverUsos(instrucao.esquerda, pilhas);
            instrucao.direita = reescreverUsos(instrucao.direita, pilhas);
            break;
        case 'neg':
        case 'nao':
            instrucao.src = reescreverUsos(instrucao.src, pilhas);
            break;
        case 'indiceLer':
            instrucao.indice = reescreverUsos(instrucao.indice, pilhas);
            break;
        case 'indiceEscrever':
            instrucao.indice = reescreverUsos(instrucao.indice, pilhas);
            instrucao.valor = reescreverUsos(instrucao.valor, pilhas);
            break;
        case 'armazenarGlobal':
            instrucao.valor = reescreverUsos(instrucao.valor, pilhas);
            break;
        case 'chamada':
            instrucao.argumentos = instrucao.argumentos.map((argumento) =>
                reescreverUsos(argumento, pilhas)
            );
            break;
        case 'imprimirNumero':
            instrucao.valor = reescreverUsos(instrucao.valor, pilhas);
            break;
        default:
            break;
    }
}

/**
 * Constrói SSA para a função: insere phis via fronteira de dominância iterada
 * (Cytron et al.) e renomeia cada definição/uso na árvore de dominância.
 * Assume que `dst`s de instruções e nomes de registrador de parâmetros já usam
 * nomes "pré-SSA" (um nome por variável/temporário lógico, sem versão).
 */
export function construirSSA(funcao: IRFuncao): void {
    const dominancia = computeDominancia(funcao);
    const blocosVivos = new Set(dominancia.ordem);

    // 1) Sítios de definição por variável pré-SSA.
    const defsites = new Map<string, Set<string>>();
    function registrarDef(variavel: string, blocoId: string): void {
        if (!defsites.has(variavel)) defsites.set(variavel, new Set());
        defsites.get(variavel)!.add(blocoId);
    }

    for (const blocoId of dominancia.ordem) {
        const bloco = funcao.blocos.get(blocoId)!;
        for (const instrucao of bloco.instrucoes) {
            const dst = obterDst(instrucao);
            if (dst) registrarDef(dst, blocoId);
        }
    }

    // 2) Inserção de phis via fronteira de dominância iterada.
    const temPhi = new Map<string, Set<string>>(); // variavel -> blocos que já ganharam phi dela
    for (const [variavel, sitiosIniciais] of defsites) {
        temPhi.set(variavel, new Set());
        const worklist = [...sitiosIniciais];
        while (worklist.length > 0) {
            const n = worklist.pop()!;
            const fronteira = dominancia.domFrontier.get(n);
            if (!fronteira) continue;
            for (const d of fronteira) {
                if (!blocosVivos.has(d)) continue;
                if (temPhi.get(variavel)!.has(d)) continue;
                temPhi.get(variavel)!.add(d);
                const bloco = funcao.blocos.get(d)!;
                const phi: IRPhi = { dst: variavel, variavel, opcoes: [] };
                bloco.phis.push(phi);
                if (!sitiosIniciais.has(d)) worklist.push(d);
            }
        }
    }

    // 3) Renomeação por percurso pré-ordem na árvore de dominância.
    const filhosNaArvore = arvoreDominancia(dominancia, funcao.blocoEntrada);
    const pilhas = new Map<string, string[]>();
    const contadores = new Map<string, number>();

    function nomeFresco(variavel: string): string {
        const proximo = (contadores.get(variavel) ?? 0) + 1;
        contadores.set(variavel, proximo);
        const nome = `${variavel}.${proximo}`;
        if (!pilhas.has(variavel)) pilhas.set(variavel, []);
        pilhas.get(variavel)!.push(nome);
        return nome;
    }

    function renomearBloco(blocoId: string): void {
        const bloco = funcao.blocos.get(blocoId)!;
        const definidosAqui: string[] = [];

        for (const phi of bloco.phis) {
            const nome = nomeFresco(phi.variavel);
            phi.dst = nome;
            definidosAqui.push(phi.variavel);
        }

        for (const instrucao of bloco.instrucoes) {
            reescreverUsosInstrucao(instrucao, pilhas);
            const dstPreSSA = obterDst(instrucao);
            if (dstPreSSA) {
                const nome = nomeFresco(dstPreSSA);
                (instrucao as { dst: string }).dst = nome;
                definidosAqui.push(dstPreSSA);
            }
        }

        if (bloco.terminador.op === 'saltoCondicional') {
            bloco.terminador.condicao = reescreverUsos(bloco.terminador.condicao, pilhas);
        } else if (bloco.terminador.op === 'retorno' && bloco.terminador.valor) {
            bloco.terminador.valor = reescreverUsos(bloco.terminador.valor, pilhas);
        }

        for (const sucessorId of bloco.sucessores) {
            const sucessor = funcao.blocos.get(sucessorId);
            if (!sucessor) continue;
            for (const phi of sucessor.phis) {
                const pilha = pilhas.get(phi.variavel);
                if (!pilha || pilha.length === 0) continue;
                phi.opcoes.push({
                    predecessor: blocoId,
                    valor: { classe: 'registrador', nome: pilha[pilha.length - 1] },
                });
            }
        }

        for (const filho of filhosNaArvore.get(blocoId) ?? []) {
            renomearBloco(filho);
        }

        for (const variavel of definidosAqui) {
            pilhas.get(variavel)!.pop();
        }
    }

    renomearBloco(funcao.blocoEntrada);
}
