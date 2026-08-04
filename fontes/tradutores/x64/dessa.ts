import { prepararCFG } from './dominancia';
import { Alocacao } from './alocador-registradores';
import { IRFuncao, IRInstrucao, IRValor, novoBloco } from './ir';

/** Registrador sempre reservado como escrata (fora da paleta geral) — ver alocador-registradores.ts. */
const REGISTRADOR_ESCRATCH_CICLO = 'rax';

function localizacao(nomeVirtual: string, alocacao: Map<string, Alocacao>): string {
    const a = alocacao.get(nomeVirtual);
    if (!a) throw new Error(`destruirSSA: '${nomeVirtual}' não tem alocação.`);
    return a.tipo === 'registrador' ? `r:${a.fisico}` : `s:${a.offsetBytes}`;
}

interface ParDeCopia {
    destino: string;
    origem: IRValor;
}

/**
 * Sequencializa um conjunto de cópias que devem se comportar como uma atribuição paralela
 * (todas leem os valores "antes da rodada"), quebrando ciclos (o clássico problema da troca
 * a,b = b,a) com um temporário fixo no registrador de escrata reservado. Argumento
 * `alocacao` é mutado: cada temporário de quebra de ciclo ganha uma entrada nele.
 */
function sequenciarCopiasParalelas(
    pares: ParDeCopia[],
    alocacao: Map<string, Alocacao>,
    gerarNomeTemp: () => string
): IRInstrucao[] {
    const resultado: IRInstrucao[] = [];
    const pendentes = new Map<string, ParDeCopia>();
    for (const par of pares) pendentes.set(par.destino, { ...par });

    function origemLocalizacao(par: ParDeCopia): string | null {
        return par.origem.classe === 'registrador' ? localizacao(par.origem.nome, alocacao) : null;
    }

    let guarda = pares.length * pares.length + 100;
    while (pendentes.size > 0) {
        if (guarda-- <= 0) {
            throw new Error('destruirSSA: não foi possível sequenciar cópias de phi (loop inesperado).');
        }

        let progrediu = false;
        for (const [destino, par] of [...pendentes]) {
            const locDestino = localizacao(destino, alocacao);
            const alguemPrecisaLer = [...pendentes.values()].some(
                (outro) => outro !== par && origemLocalizacao(outro) === locDestino
            );
            if (!alguemPrecisaLer) {
                resultado.push({ op: 'copia', dst: destino, src: par.origem });
                pendentes.delete(destino);
                progrediu = true;
            }
        }

        if (!progrediu && pendentes.size > 0) {
            const [destinoCiclo] = [...pendentes][0];
            const locDestinoCiclo = localizacao(destinoCiclo, alocacao);
            const nomeTemp = gerarNomeTemp();
            alocacao.set(nomeTemp, { tipo: 'registrador', fisico: REGISTRADOR_ESCRATCH_CICLO });

            resultado.push({
                op: 'copia',
                dst: nomeTemp,
                src: { classe: 'registrador', nome: destinoCiclo },
            });

            for (const [destino2, par2] of pendentes) {
                if (destino2 === destinoCiclo) continue;
                if (origemLocalizacao(par2) === locDestinoCiclo) {
                    par2.origem = { classe: 'registrador', nome: nomeTemp };
                }
            }
        }
    }

    return resultado;
}

/**
 * Elimina phis da função já alocada: divide arestas críticas (predecessor com mais de um
 * sucessor apontando para um bloco com phis) e insere, em cada aresta, a sequência de
 * cópias equivalente à atribuição paralela dos phis daquele bloco.
 */
export function destruirSSA(funcao: IRFuncao, alocacao: Map<string, Alocacao>): void {
    prepararCFG(funcao);

    let contadorDivisao = 0;
    let contadorTemp = 0;
    const gerarNomeTemp = () => `__troca_${contadorTemp++}__`;

    const blocosComPhi = [...funcao.blocos.values()].filter((bloco) => bloco.phis.length > 0);

    for (const blocoAlvo of blocosComPhi) {
        for (const predId of [...blocoAlvo.predecessores]) {
            const predecessor = funcao.blocos.get(predId)!;
            if (predecessor.sucessores.length <= 1) continue;

            const idDivisao = `__div_${contadorDivisao++}__`;
            const blocoDivisao = novoBloco(idDivisao);
            blocoDivisao.terminador = { op: 'salto', alvo: blocoAlvo.id };
            funcao.blocos.set(idDivisao, blocoDivisao);
            funcao.ordemBlocos.push(idDivisao);

            if (predecessor.terminador.op === 'salto' && predecessor.terminador.alvo === blocoAlvo.id) {
                predecessor.terminador.alvo = idDivisao;
            } else if (predecessor.terminador.op === 'saltoCondicional') {
                if (predecessor.terminador.verdadeiro === blocoAlvo.id) {
                    predecessor.terminador.verdadeiro = idDivisao;
                }
                if (predecessor.terminador.falso === blocoAlvo.id) {
                    predecessor.terminador.falso = idDivisao;
                }
            }

            for (const phi of blocoAlvo.phis) {
                for (const opcao of phi.opcoes) {
                    if (opcao.predecessor === predId) opcao.predecessor = idDivisao;
                }
            }
        }
    }

    prepararCFG(funcao);

    for (const blocoAlvo of blocosComPhi) {
        const copiasPorPredecessor = new Map<string, ParDeCopia[]>();
        for (const phi of blocoAlvo.phis) {
            for (const opcao of phi.opcoes) {
                if (!copiasPorPredecessor.has(opcao.predecessor)) {
                    copiasPorPredecessor.set(opcao.predecessor, []);
                }
                copiasPorPredecessor.get(opcao.predecessor)!.push({ destino: phi.dst, origem: opcao.valor });
            }
        }

        for (const [predId, pares] of copiasPorPredecessor) {
            const predecessor = funcao.blocos.get(predId)!;
            const copias = sequenciarCopiasParalelas(pares, alocacao, gerarNomeTemp);
            predecessor.instrucoes.push(...copias);
        }

        blocoAlvo.phis = [];
    }

    prepararCFG(funcao);
}
