import _ from 'lodash';

import { Chamada, Construto, Leia } from '../../construtos';
import { Bloco, Declaracao, Enquanto, Escreva, Expressao, Para, Retorna } from '../../declaracoes';
import { InterpretadorComDepuracaoInterface } from '../../interfaces';
import { Quebra, SustarQuebra, ContinuarQuebra, RetornoQuebra } from '../../quebras';
import { PontoParada } from '../../depuracao';
import { EscopoExecucao, TipoEscopoExecucao } from '../../interfaces/escopo-execucao';
import { inferirTipoVariavel } from '../../inferenciador';
import { EspacoMemoria } from '../espaco-memoria';

async function avaliarArgumentosEscreva(
    interpretador: InterpretadorComDepuracaoInterface,
    argumentos: Construto[]
): Promise<string> {
    let formatoTexto: string = '';

    for (const argumento of argumentos) {
        const resultadoAvaliacao = await interpretador.avaliar(argumento);
        let valor = resultadoAvaliacao?.hasOwnProperty('valor')
            ? resultadoAvaliacao.valor
            : resultadoAvaliacao;
        formatoTexto += `${interpretador.paraTexto(valor)} `;
    }

    return formatoTexto.trimEnd();
}

/**
 * Resolve problema de literais que tenham vírgulas, e confundem a resolução de chamadas.
 * @param valor O valor do argumento, que pode ser um literal com virgulas.
 * @returns Uma string com vírgulas escapadas.
 */
function escaparVirgulas(valor: any) {
    return String(valor).replace(/,/i, ',');
}

/**
 * Gera um identificador para resolução de chamadas.
 * Usado para não chamar funções repetidamente quando usando instruções
 * de passo, como "próximo" ou "adentrar-escopo".
 * @param expressao A expressão de chamada.
 * @returns Uma `Promise` que resolve como `string`.
 */
async function gerarIdResolucaoChamada(
    interpretador: InterpretadorComDepuracaoInterface,
    expressao: Chamada
): Promise<string> {
    const argumentosResolvidos = [];
    if (expressao.argumentos && expressao.argumentos.length > 0) {
        for (let argumento of expressao.argumentos) {
            if (argumento instanceof Leia) {
                argumentosResolvidos.push(`leia_${argumento.id}`);
            } else {
                argumentosResolvidos.push(await interpretador.avaliar(argumento));
            }
        }
    }

    return argumentosResolvidos.reduce(
        (acumulador, argumento) =>
            (acumulador += `,${escaparVirgulas(
                argumento.hasOwnProperty('valor') ? argumento.valor : argumento
            )}`),
        expressao.id
    );
}

/**
 * Para fins de depuração, verifica se há ponto de parada no mesmo pragma da declaração.
 * @param declaracao A declaração a ser executada.
 * @returns `true` quando execução deve parar. `false` caso contrário.
 */
function verificarPontoParada(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracao: Declaracao
): boolean {
    const buscaPontoParada: PontoParada[] = interpretador.pontosParada.filter(
        (p: PontoParada) => p.hashArquivo === declaracao.hashArquivo && p.linha === declaracao.linha
    );

    if (buscaPontoParada.length > 0) {
        console.log(`Ponto de parada encontrado. Linha: ${declaracao.linha}.`);
        return true;
    }

    return false;
}

/**
 * Quando um construto ou declaração possui id, significa que o interpretador
 * deve resolver a avaliação e guardar seu valor até o final do escopo.
 * Isso serve para quando a linguagem está em modo de depuração, e o contexto
 * da execução deixa de existir com um ponto de parada, por exemplo.
 * @param expressao A expressão a ser avaliada.
 * @returns O resultado da avaliação.
 */
export async function avaliar(
    interpretador: InterpretadorComDepuracaoInterface,
    expressao: Construto | Declaracao
): Promise<any> {
    if (expressao.hasOwnProperty('id')) {
        const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
        const idChamadaComArgumentos = await gerarIdResolucaoChamada(
            interpretador,
            expressao as Chamada
        );
        if (escopoAtual.espacoMemoria.resolucoesChamadas.hasOwnProperty(idChamadaComArgumentos)) {
            return escopoAtual.espacoMemoria.resolucoesChamadas[idChamadaComArgumentos];
        }
    }

    return await expressao.aceitar(interpretador);
}

export async function visitarExpressaoDeChamada(
    interpretador: InterpretadorComDepuracaoInterface,
    visitarExpressaoDeChamadaAncestral: (expressao: Chamada) => Promise<any>,
    expressao: Chamada
): Promise<any> {
    const _idChamadaComArgumentos = await gerarIdResolucaoChamada(interpretador, expressao);
    // Usado na abertura do bloco de escopo da chamada.
    interpretador.idChamadaAtual = _idChamadaComArgumentos;

    interpretador.executandoChamada = true;
    interpretador.proximoEscopo = 'funcao';
    const retorno = await visitarExpressaoDeChamadaAncestral(expressao);
    interpretador.executandoChamada = false;
    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
    escopoAtual.espacoMemoria.resolucoesChamadas[_idChamadaComArgumentos] = retorno;
    return retorno;
}

export async function visitarDeclaracaoEnquanto(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracao: Enquanto
): Promise<any> {
    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
    switch (interpretador.comando) {
        case 'proximo':
            if (interpretador.eVerdadeiro(await interpretador.avaliar(declaracao.condicao))) {
                escopoAtual.emLacoRepeticao = true;
                return interpretador.executarBloco((declaracao.corpo as Bloco).declaracoes);
            }

            escopoAtual.emLacoRepeticao = false;
            return null;
        default:
            let retornoExecucao: any;
            while (
                !(retornoExecucao instanceof Quebra) &&
                !interpretador.pontoDeParadaAtivo &&
                interpretador.eVerdadeiro(await interpretador.avaliar(declaracao.condicao))
            ) {
                escopoAtual.emLacoRepeticao = true;
                try {
                    retornoExecucao = await interpretador.executar(declaracao.corpo);
                    if (retornoExecucao instanceof SustarQuebra) {
                        return null;
                    }

                    if (retornoExecucao instanceof ContinuarQuebra) {
                        retornoExecucao = null;
                    }
                } catch (erro: any) {
                    return Promise.reject(erro);
                }
            }

            escopoAtual.emLacoRepeticao = false;
            return retornoExecucao;
    }
}

/**
 * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
 * alguma função para escrever numa página Web.
 * Se ponto de parada foi ativado durante a avaliação de argumentos, não escreve.
 * @param declaracao A declaração.
 * @returns Sempre nulo, por convenção de visita.
 */
export async function visitarDeclaracaoEscreva(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracao: Escreva
): Promise<any> {
    try {
        const formatoTexto: string = await avaliarArgumentosEscreva(
            interpretador,
            declaracao.argumentos
        );
        if (interpretador.pontoDeParadaAtivo) {
            return null;
        }

        interpretador.funcaoDeRetorno(formatoTexto);
        return null;
    } catch (erro: any) {
        interpretador.erros.push({
            erroInterno: erro,
            linha: declaracao.linha,
            hashArquivo: declaracao.hashArquivo,
        });
    }
}

export async function visitarDeclaracaoPara(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracao: Para
): Promise<any> {
    // Aqui precisamos clonar a declaração porque modificamos
    // algumas propriedades que indicam o estado da execução dela.
    // Por exemplo, se chamamos uma função que tem dentro dela um bloco Para,
    // cada execução do bloco precisa de uma inicialização diferente.
    const cloneDeclaracao = _.cloneDeep(declaracao) as Para;
    const corpoExecucao = cloneDeclaracao.corpo as Bloco;

    const declaracaoInicializador = Array.isArray(cloneDeclaracao.inicializador)
        ? declaracao.inicializador[0]
        : declaracao.inicializador;

    if (declaracaoInicializador !== null) {
        await interpretador.avaliar(declaracaoInicializador);
        // O incremento vai ao final do bloco de escopo.
        if (cloneDeclaracao.incrementar !== null) {
            corpoExecucao.declaracoes.push(new Expressao(cloneDeclaracao.incrementar));
        }
    }

    cloneDeclaracao.inicializada = true;
    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
    switch (interpretador.comando) {
        case 'proximo':
            if (
                cloneDeclaracao.condicao !== null &&
                interpretador.eVerdadeiro(await interpretador.avaliar(cloneDeclaracao.condicao))
            ) {
                escopoAtual.emLacoRepeticao = true;

                const resultadoBloco = interpretador.executarBloco(corpoExecucao.declaracoes);
                return resultadoBloco;
            }

            escopoAtual.emLacoRepeticao = false;
            return null;
        default:
            let retornoExecucao: any;
            while (!(retornoExecucao instanceof Quebra) && !interpretador.pontoDeParadaAtivo) {
                if (
                    cloneDeclaracao.condicao !== null &&
                    !interpretador.eVerdadeiro(
                        await interpretador.avaliar(cloneDeclaracao.condicao)
                    )
                ) {
                    break;
                }

                try {
                    retornoExecucao = await interpretador.executar(corpoExecucao);
                    if (retornoExecucao instanceof SustarQuebra) {
                        return null;
                    }

                    if (retornoExecucao instanceof ContinuarQuebra) {
                        retornoExecucao = null;
                    }
                } catch (erro: any) {
                    return Promise.reject(erro);
                }
            }
            // escopoAtual.emLacoRepeticao = false;
            return retornoExecucao;
    }
}

/**
 * Ao executar um retorno, manter o valor retornado no Interpretador para
 * uso por linhas que foram executadas com o comando `próximo` do depurador.
 * @param declaracao Uma declaracao Retorna
 * @returns O resultado da execução da visita.
 */
export async function visitarExpressaoRetornar(
    interpretador: InterpretadorComDepuracaoInterface,
    visitarExpressaoRetornarAncestral: (declaracao: Retorna) => Promise<any>,
    declaracao: Retorna
): Promise<RetornoQuebra> {
    const retorno = await visitarExpressaoRetornarAncestral(declaracao);

    // O escopo atual é marcado como finalizado, para notificar a
    // instrução de que deve ser descartado.
    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
    escopoAtual.finalizado = true;

    // Acha o primeiro escopo de função.
    const escopoFuncao = interpretador.pilhaEscoposExecucao.obterEscopoPorTipo('funcao');
    if (escopoFuncao === undefined) {
        return Promise.reject('retorna() chamado fora de execução de função.');
    }

    if (escopoFuncao.idChamada !== undefined) {
        escopoAtual.espacoMemoria.resolucoesChamadas[escopoFuncao.idChamada] =
            retorno && retorno.hasOwnProperty('valor') ? retorno.valor : retorno;
    }

    return retorno;
}

/**
 * Se bloco de execução já foi instanciado antes (por exemplo, quando há um ponto de parada e a
 * execução do código é retomada pelo depurador), retoma a execução do bloco do ponto em que havia parado.
 * Se bloco de execução ainda não foi instanciado, empilha declarações na pilha de escopos de execução,
 * cria um novo espacoMemoria e executa as declarações empilhadas.
 * Se depurador comandou uma instrução 'adentrar-escopo', execução do bloco não ocorre, mas
 * ponteiros de escopo e execução são atualizados.
 * @param declaracoes Um vetor de declaracoes a ser executado.
 * @param espacoMemoria O espacoMemoria de execução quando houver, como parâmetros, argumentos, etc.
 */
export async function executarBloco(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracoes: Declaracao[],
    espacoMemoria?: EspacoMemoria
): Promise<any> {
    // Se o escopo atual não é o último.
    if (interpretador.escopoAtual < interpretador.pilhaEscoposExecucao.elementos() - 1) {
        interpretador.escopoAtual++;
        const proximoEscopo = interpretador.pilhaEscoposExecucao.naPosicao(
            interpretador.escopoAtual
        );
        let retornoExecucao: any;

        // Sempre executa a próxima instrução, mesmo que haja ponto de parada.
        retornoExecucao = await interpretador.executar(
            proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
        );
        proximoEscopo.declaracaoAtual++;

        for (
            ;
            !(retornoExecucao instanceof Quebra) &&
            proximoEscopo.declaracaoAtual < proximoEscopo.declaracoes.length;
            proximoEscopo.declaracaoAtual++
        ) {
            interpretador.pontoDeParadaAtivo = verificarPontoParada(
                interpretador,
                proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
            );

            if (interpretador.pontoDeParadaAtivo) {
                interpretador.avisoPontoParadaAtivado();
                break;
            }

            retornoExecucao = await interpretador.executar(
                proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
            );

            // Um ponto de parada ativo pode ter vindo de um escopo mais interno.
            // Por isso verificamos outra parada aqui para evitar que
            // `interpretador.declaracaoAtual` seja incrementado.
            if (interpretador.pontoDeParadaAtivo) {
                interpretador.avisoPontoParadaAtivado();
                break;
            }
        }

        interpretador.pilhaEscoposExecucao.removerUltimo();
        interpretador.escopoAtual--;
        return retornoExecucao;
    } else {
        abrirNovoBlocoEscopo(
            interpretador,
            declaracoes,
            espacoMemoria,
            interpretador.proximoEscopo || 'outro'
        );
        const ultimoEscopo = interpretador.pilhaEscoposExecucao.topoDaPilha();
        if (interpretador.idChamadaAtual) {
            ultimoEscopo.idChamada = interpretador.idChamadaAtual;
            interpretador.idChamadaAtual = undefined;
        }
        interpretador.proximoEscopo = undefined;

        if (interpretador.comando !== 'adentrarEscopo') {
            return await executarUltimoEscopo(interpretador);
        }
    }
}

function descartarEscopoPorRetornoFuncao(interpretador: InterpretadorComDepuracaoInterface) {
    let ultimoEscopo = interpretador.pilhaEscoposExecucao.topoDaPilha();
    while (ultimoEscopo.tipo !== 'funcao') {
        interpretador.pilhaEscoposExecucao.removerUltimo();
        const escopoAnterior = interpretador.pilhaEscoposExecucao.topoDaPilha();
        escopoAnterior.espacoMemoria.resolucoesChamadas = Object.assign(
            escopoAnterior.espacoMemoria.resolucoesChamadas,
            ultimoEscopo.espacoMemoria.resolucoesChamadas
        );
        interpretador.escopoAtual--;
        ultimoEscopo = interpretador.pilhaEscoposExecucao.topoDaPilha();
    }

    interpretador.pilhaEscoposExecucao.removerUltimo();
    const escopoAnterior = interpretador.pilhaEscoposExecucao.topoDaPilha();
    escopoAnterior.espacoMemoria.resolucoesChamadas = Object.assign(
        escopoAnterior.espacoMemoria.resolucoesChamadas,
        ultimoEscopo.espacoMemoria.resolucoesChamadas
    );
    interpretador.escopoAtual--;
}

function descartarTodosEscoposFinalizados(interpretador: InterpretadorComDepuracaoInterface) {
    let i = interpretador.pilhaEscoposExecucao.pilha.length - 1;
    while (i > 0) {
        let ultimoEscopo = interpretador.pilhaEscoposExecucao.topoDaPilha();
        if (
            ultimoEscopo.declaracaoAtual >= ultimoEscopo.declaracoes.length ||
            ultimoEscopo.finalizado
        ) {
            interpretador.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = interpretador.pilhaEscoposExecucao.topoDaPilha();
            escopoAnterior.espacoMemoria.resolucoesChamadas = Object.assign(
                escopoAnterior.espacoMemoria.resolucoesChamadas,
                ultimoEscopo.espacoMemoria.resolucoesChamadas
            );
            interpretador.escopoAtual--;
        } else {
            break;
        }
        i--;
    }
}

async function executarUmPassoNoEscopo(interpretador: InterpretadorComDepuracaoInterface) {
    const ultimoEscopo = interpretador.pilhaEscoposExecucao.topoDaPilha();
    let retornoExecucao: any;
    if (interpretador.passos > 0) {
        interpretador.passos--;
        retornoExecucao = await interpretador.executar(
            ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
        );

        if (!interpretador.pontoDeParadaAtivo && !ultimoEscopo.emLacoRepeticao) {
            ultimoEscopo.declaracaoAtual++;
        }

        if (
            ultimoEscopo.declaracaoAtual >= ultimoEscopo.declaracoes.length ||
            ultimoEscopo.finalizado
        ) {
            if (retornoExecucao instanceof RetornoQuebra) {
                descartarEscopoPorRetornoFuncao(interpretador);
            } else {
                descartarTodosEscoposFinalizados(interpretador);
            }
        }

        if (interpretador.pilhaEscoposExecucao.elementos() === 1) {
            interpretador.finalizacaoDaExecucao();
        }
    }

    return retornoExecucao;
}

/**
 * Continua a interpretação parcial do último ponto em que parou.
 * Pode ser tanto o começo da execução inteira, ou pós comando do depurador
 * quando há um ponto de parada.
 * @param manterEspacoMemoria Se verdadeiro, junta elementos do último escopo com o escopo
 *                       imediatamente abaixo.
 * @param naoVerificarPrimeiraExecucao Booleano que pede ao Interpretador para não
 *                                     verificar o ponto de parada na primeira execução.
 *                                     Normalmente usado pelo Servidor de Depuração para continuar uma linha.
 * @returns Um objeto de retorno, com erros encontrados se houverem.
 */
export async function executarUltimoEscopoComandoContinuar(
    interpretador: InterpretadorComDepuracaoInterface,
    manterEspacoMemoria = false,
    naoVerificarPrimeiraExecucao = false
): Promise<any> {
    const ultimoEscopo = interpretador.pilhaEscoposExecucao.topoDaPilha();
    let retornoExecucao: any;

    try {
        for (
            ;
            !(retornoExecucao instanceof Quebra) &&
            ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
            ultimoEscopo.declaracaoAtual++
        ) {
            if (naoVerificarPrimeiraExecucao) {
                naoVerificarPrimeiraExecucao = false;
            } else {
                interpretador.pontoDeParadaAtivo = verificarPontoParada(
                    interpretador,
                    ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
                );

                if (interpretador.pontoDeParadaAtivo) {
                    interpretador.avisoPontoParadaAtivado();
                    break;
                }
            }

            retornoExecucao = await interpretador.executar(
                ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]
            );

            // Um ponto de parada ativo pode ter vindo de um escopo mais interno.
            // Por isso verificamos outra parada aqui para evitar que
            // `interpretador.declaracaoAtual` seja incrementado.
            if (interpretador.pontoDeParadaAtivo) {
                interpretador.avisoPontoParadaAtivado();
                break;
            }
        }

        return retornoExecucao;
    } catch (erro: any) {
        interpretador.erros.push(erro);
    } finally {
        if (!interpretador.pontoDeParadaAtivo && interpretador.comando !== 'adentrarEscopo') {
            interpretador.pilhaEscoposExecucao.removerUltimo();
            const escopoAnterior = interpretador.pilhaEscoposExecucao.topoDaPilha();
            escopoAnterior.espacoMemoria.resolucoesChamadas = Object.assign(
                escopoAnterior.espacoMemoria.resolucoesChamadas,
                ultimoEscopo.espacoMemoria.resolucoesChamadas
            );

            if (manterEspacoMemoria) {
                escopoAnterior.espacoMemoria.valores = Object.assign(
                    escopoAnterior.espacoMemoria.valores,
                    ultimoEscopo.espacoMemoria.valores
                );
            }
            interpretador.escopoAtual--;
        }

        if (interpretador.pilhaEscoposExecucao.elementos() === 1) {
            interpretador.finalizacaoDaExecucao();
        }
    }
}

/**
 * Continua a interpretação, conforme comando do depurador.
 * Quando um ponto de parada é ativado, a pilha de execução do TypeScript é perdida.
 * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
 * primeiro escopo, subindo até o último elemento executado do último escopo.
 * Se entre escopos houver ponto de parada ativo, a execução é suspensa até o próximo comando
 * do desenvolvedor.
 * @see executarUltimoEscopo
 */
export async function instrucaoContinuarInterpretacao(
    interpretador: InterpretadorComDepuracaoInterface,
    escopo = 1
): Promise<any> {
    let retornoExecucao: any;
    if (escopo < interpretador.escopoAtual) {
        retornoExecucao = await instrucaoContinuarInterpretacao(interpretador, escopo + 1);
    }

    if (interpretador.pontoDeParadaAtivo) {
        return;
    }

    await executarUltimoEscopoComandoContinuar(interpretador, false, true);
}

/**
 * Interpreta apenas uma instrução a partir do ponto de parada ativo, conforme comando do depurador.
 * Esse método cria uma nova pilha de execução do lado do JS, começando do último elemento executado do
 * primeiro escopo, subindo até o último elemento executado do último escopo.
 * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
 */
export async function instrucaoPasso(
    interpretador: InterpretadorComDepuracaoInterface,
    escopo = 1
) {
    interpretador.passos = 1;
    const escopoVisitado = interpretador.pilhaEscoposExecucao.naPosicao(escopo);

    if (escopo < interpretador.escopoAtual) {
        await instrucaoPasso(interpretador, escopo + 1);
    } else {
        if (
            escopoVisitado.declaracaoAtual >= escopoVisitado.declaracoes.length ||
            escopoVisitado.finalizado
        ) {
            interpretador.pilhaEscoposExecucao.removerUltimo();
        }

        if (interpretador.pilhaEscoposExecucao.elementos() === 1) {
            return interpretador.finalizacaoDaExecucao();
        }

        await executarUmPassoNoEscopo(interpretador);
    }
}

/**
 * Interpreta restante do bloco de execução em que o ponto de parada está, conforme comando do depurador.
 * Se houver outros pontos de parada no mesmo escopo à frente da instrução atual, todos são ignorados.
 * @param escopo Indica o escopo a ser visitado. Usado para construir uma pilha de chamadas do lado JS.
 */
async function instrucaoProximoESair(interpretador: InterpretadorComDepuracaoInterface) {
    executarUltimoEscopoComandoContinuar(interpretador, false, true);
}

export function abrirNovoBlocoEscopo(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracoes: Declaracao[],
    espacoMemoria?: EspacoMemoria,
    tipoEscopo: TipoEscopoExecucao = 'outro'
) {
    const escopoExecucao: EscopoExecucao = {
        declaracoes: declaracoes,
        declaracaoAtual: 0,
        espacoMemoria: espacoMemoria || new EspacoMemoria(),
        finalizado: false,
        tipo: tipoEscopo,
        emLacoRepeticao: false,
    };
    interpretador.pilhaEscoposExecucao.empilhar(escopoExecucao);
    interpretador.escopoAtual++;
}

/**
 * No interpretador com depuração, este método é dividido em dois outros métodos privados:
 * - `executarUmPassoNoEscopo`, que executa apenas uma instrução e nada mais;
 * - `executarUltimoEscopoComandoContinuar`, que é a execução trivial de um escopo inteiro,
 *      ou com todas as instruções, ou até encontrar um ponto de parada.
 * @param manterespacoMemoria Se verdadeiro, junta elementos do último escopo com o escopo
 *                       imediatamente abaixo.
 * @param naoVerificarPrimeiraExecucao Booleano que pede ao Interpretador para não
 *                                     verificar o ponto de parada na primeira execução.
 *                                     Normalmente usado pelo Servidor de Depuração para continuar uma linha.
 * @returns O retorno da execução.
 */
export async function executarUltimoEscopo(
    interpretador: InterpretadorComDepuracaoInterface,
    manterespacoMemoria = false,
    naoVerificarPrimeiraExecucao = false
): Promise<any> {
    switch (interpretador.comando) {
        case 'adentrarEscopo':
        case 'proximo':
            if (!interpretador.executandoChamada) {
                return executarUmPassoNoEscopo(interpretador);
            } else {
                return executarUltimoEscopoComandoContinuar(
                    interpretador,
                    manterespacoMemoria,
                    naoVerificarPrimeiraExecucao
                );
            }
        default:
            return executarUltimoEscopoComandoContinuar(
                interpretador,
                manterespacoMemoria,
                naoVerificarPrimeiraExecucao
            );
    }
}

/**
 * Obtém o valor de uma variável por nome.
 * Em versões anteriores, o mecanismo de avaliação fazia toda a avaliação tradicional,
 * passando por Lexador, Avaliador Sintático e Interpretador.
 * Isso tem sua cota de problemas, sobretudo porque a avaliação insere e descarta escopos,
 * entrando em condição de corrida com a interpretação com depuração.
 * Método usado principalmente pela [extensão do Visual Studio Code](https://github.com/DesignLiquido/vscode)
 * e pelo mecanismo de depuração remota, implementado em [`delegua-node`](https://github.com/DesignLiquido/delegua-node).
 * @param nome O nome da variável.
 */
export function obterVariavel(
    interpretador: InterpretadorComDepuracaoInterface,
    nome: string
): any {
    const valorOuVariavel = interpretador.pilhaEscoposExecucao.obterValorVariavel({
        lexema: nome,
    } as any) as any;

    if (valorOuVariavel.hasOwnProperty('valor')) {
        return valorOuVariavel;
    }

    return {
        valor: valorOuVariavel,
        tipo: inferirTipoVariavel(valorOuVariavel),
    };
}
