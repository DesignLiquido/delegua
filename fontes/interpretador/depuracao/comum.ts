import cloneDeep from 'lodash.clonedeep';

import { Binario, Chamada, Leia, Literal } from '../../construtos';
import {
    Bloco,
    Declaracao,
    Enquanto,
    Escreva,
    Expressao,
    Fazer,
    Para,
    Retorna,
    Tente,
} from '../../declaracoes';
import {
    ConstrutoInterface,
    InterpretadorComDepuracaoInterface,
    ResultadoParcialInterpretadorInterface,
} from '../../interfaces';
import { Quebra, SustarQuebra, ContinuarQuebra, RetornoQuebra } from '../../quebras';
import { PontoParada } from '../../depuracao';
import { EscopoExecucaoInterface, TipoEscopoExecucao } from '../../interfaces/escopo-execucao';
import { inferirTipoVariavel } from '../../inferenciador';
import { EspacoMemoria } from '../espaco-memoria';
import tiposDeSimbolos from '../../tipos-de-simbolos/delegua';
import tipoDeDadosDelegua from '../../tipos-de-dados/delegua';

const ITERACOES_PARA_CEDER_CONTROLE = 1000;

async function cederControle(iteracoes: number): Promise<void> {
    if (iteracoes % ITERACOES_PARA_CEDER_CONTROLE === 0) {
        await new Promise<void>((resolve) => {
            if (typeof setImmediate !== 'undefined') {
                setImmediate(resolve);
            } else {
                setTimeout(resolve, 0);
            }
        });
    }
}

async function avaliarArgumentosEscreva(
    interpretador: InterpretadorComDepuracaoInterface,
    argumentos: ConstrutoInterface[]
): Promise<string> {
    let formatoTexto: string = '';

    for (const argumento of argumentos) {
        const resultadoAvaliacao = await interpretador.avaliar(argumento);
        let valor = interpretador.resolverValor(resultadoAvaliacao);
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
            (acumulador += `,${argumento == null ? 'null' : escaparVirgulas(
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
    expressao: ConstrutoInterface | Declaracao
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

export async function visitarExpressaoReferenciaFuncao(
    interpretador: InterpretadorComDepuracaoInterface,
    visitarExpressaoReferenciaFuncaoAncestral: (expressao: any) => Promise<any>,
    expressao: any
): Promise<any> {
    return await visitarExpressaoReferenciaFuncaoAncestral(expressao);
}

export async function visitarExpressaoArgumentoReferenciaFuncao(
    interpretador: InterpretadorComDepuracaoInterface,
    visitarExpressaoArgumentoReferenciaFuncaoAncestral: (expressao: any) => Promise<any>,
    expressao: any
): Promise<any> {
    return await visitarExpressaoArgumentoReferenciaFuncaoAncestral(expressao);
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
            let iteracoes = 0;
            while (
                !(retornoExecucao instanceof Quebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
                !interpretador.pontoDeParadaAtivo &&
                interpretador.comando !== 'pausar' &&
                interpretador.eVerdadeiro(await interpretador.avaliar(declaracao.condicao))
            ) {
                escopoAtual.emLacoRepeticao = true;
                try {
                    await cederControle(++iteracoes);
                    retornoExecucao = await interpretador.executar(declaracao.corpo);
                    if (retornoExecucao instanceof SustarQuebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra)) {
                        return null;
                    }

                    if (
                        retornoExecucao instanceof ContinuarQuebra ||
                        (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra)
                    ) {
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
    const cloneDeclaracao = cloneDeep(declaracao) as Para;
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
            let iteracoes = 0;
            while (
                !(retornoExecucao instanceof Quebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
                !interpretador.pontoDeParadaAtivo &&
                interpretador.comando !== 'pausar'
            ) {
                if (
                    cloneDeclaracao.condicao !== null &&
                    !interpretador.eVerdadeiro(
                        await interpretador.avaliar(cloneDeclaracao.condicao)
                    )
                ) {
                    break;
                }

                try {
                    await cederControle(++iteracoes);
                    retornoExecucao = await interpretador.executar(corpoExecucao);
                    if (retornoExecucao instanceof SustarQuebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra)) {
                        return null;
                    }

                    if (
                        retornoExecucao instanceof ContinuarQuebra ||
                        (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra)
                    ) {
                        retornoExecucao = null;
                        if (cloneDeclaracao.incrementar !== null) {
                            await interpretador.avaliar(cloneDeclaracao.incrementar);
                        }
                    }
                } catch (erro: any) {
                    return Promise.reject(erro);
                }
            }
            // escopoAtual.emLacoRepeticao = false;
            return retornoExecucao;
    }
}

export async function visitarDeclaracaoFazer(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracao: Fazer
): Promise<any> {
    let retornoExecucao: any;
    let iteracoes = 0;
    do {
        try {
            await cederControle(++iteracoes);
            retornoExecucao = await interpretador.executar(declaracao.caminhoFazer);
            if (retornoExecucao instanceof SustarQuebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof SustarQuebra)) {
                return null;
            }

            if (retornoExecucao instanceof ContinuarQuebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof ContinuarQuebra)) {
                retornoExecucao = null;
            }
        } catch (erro: any) {
            return Promise.reject(erro);
        }
    } while (
        !(retornoExecucao instanceof Quebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
        !interpretador.pontoDeParadaAtivo &&
        interpretador.comando !== 'pausar' &&
        interpretador.eVerdadeiro(await interpretador.avaliar(declaracao.condicaoEnquanto))
    );

    return retornoExecucao;
}

/**
 * Implementação de try-catch-finally para modo de depuração.
 * Garante que o bloco finally só é executado após o bloco try ser completado.
 * Em modo de passo, detecta quando um novo escopo foi criado e está incompleto,
 * evitando que o finally seja empilhado prematuramente.
 * @param interpretador O interpretador com depuração.
 * @param declaracao A declaração tente-pegue-finalmente.
 * @returns O valor retornado pela execução.
 */
export async function visitarDeclaracaoTente(
    interpretador: InterpretadorComDepuracaoInterface,
    declaracao: Tente
): Promise<any> {
    let valorRetorno: any;
    (interpretador as any).emDeclaracaoTente = true;

    // Captura o número de escopos antes de executar o bloco try
    const escoposAntes = interpretador.pilhaEscoposExecucao.elementos();

    try {
        try {
            valorRetorno = await interpretador.executarBloco(declaracao.caminhoTente);
        } catch (erro: any) {
            if (declaracao.caminhoPegue !== null) {
                if (Array.isArray(declaracao.caminhoPegue)) {
                    valorRetorno = await interpretador.executarBloco(declaracao.caminhoPegue);
                } else {
                    const literalErro = new Literal(
                        declaracao.hashArquivo,
                        Number(declaracao.linha),
                        erro.mensagem
                    );
                    const chamadaPegue = new Chamada(
                        declaracao.caminhoPegue.hashArquivo,
                        declaracao.caminhoPegue,
                        [literalErro]
                    );
                    valorRetorno = await chamadaPegue.aceitar(interpretador);
                }
            }
        }
    } finally {
        // Verifica se um novo escopo foi criado e ainda está ativo
        // Se sim, NÃO executa o finally ainda (o escopo try não foi completado)
        const escoposDepois = interpretador.pilhaEscoposExecucao.elementos();
        const novoEscopoCriado = escoposDepois > escoposAntes;

        // Só executa finally se:
        // 1. Existe um bloco finally
        // 2. Não há um novo escopo criado OU não estamos em modo de passo/adentrar
        if (
            declaracao.caminhoFinalmente !== null &&
            (!novoEscopoCriado ||
                (interpretador.comando !== 'proximo' && interpretador.comando !== 'adentrarEscopo'))
        ) {
            valorRetorno = await interpretador.executarBloco(declaracao.caminhoFinalmente);
        }
        (interpretador as any).emDeclaracaoTente = false;
    }

    return valorRetorno;
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
    // Captura o escopo atual ANTES de avaliar a expressão,
    // pois a avaliação pode abrir novos escopos
    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
    const escoposAntes = interpretador.pilhaEscoposExecucao.elementos();

    const retorno = await visitarExpressaoRetornarAncestral(declaracao);

    // Verifica se novos escopos foram criados durante a avaliação
    const escoposDepois = interpretador.pilhaEscoposExecucao.elementos();
    const novoEscopoFoiCriado = escoposDepois > escoposAntes;

    // Se o retorno é null ou RetornoQuebra com valor null (porque pausamos durante avaliação de expressão,
    // como ao entrar em uma função em modo adentrarEscopo), não marcar como finalizado ainda
    const valorRetorno = retorno && retorno.hasOwnProperty('valor') ? retorno.valor : retorno;

    // Em modo adentrarEscopo, se um novo escopo foi criado (entramos em uma função aninhada),
    // NÃO marcar o escopo atual como finalizado ainda
    if (interpretador.comando === 'adentrarEscopo' && novoEscopoFoiCriado) {
        return retorno;
    }

    // O escopo atual é marcado como finalizado, para notificar a
    // instrução de que deve ser descartado.
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

// Contador global para gerar IDs únicos de expressões binárias
let contadorBinarioDebug = 0;

/**
 * Gera um identificador único para uma expressão binária.
 * Usado para armazenar estado de avaliação parcial durante step-into.
 * Cada expressão binária recebe um ID único na primeira vez que é encontrada,
 * evitando colisões entre expressões na mesma linha.
 * @param expressao A expressão binária.
 * @returns Um identificador único para esta instância de expressão.
 */
function gerarIdExpressaoBinaria(expressao: any): string {
    // Se a expressão já tem um ID de depuração, reutiliza
    if (!expressao._debugId) {
        // Gera um ID único usando um contador incremental
        expressao._debugId = `binario_${++contadorBinarioDebug}`;
    }
    return expressao._debugId;
}

/**
 * Sobrescreve a visita de expressão binária para permitir step-into em cada lado da expressão.
 * Quando em modo de depuração com step-into, avalia o lado esquerdo primeiro e pausa.
 * Na próxima execução, avalia o lado direito e completa a operação.
 * @param interpretador O interpretador com depuração.
 * @param visitarExpressaoBinariaAncestral Método ancestral para executar a lógica da operação.
 * @param expressao A expressão binária.
 * @returns O resultado da operação binária.
 */
export async function visitarExpressaoBinaria(
    interpretador: InterpretadorComDepuracaoInterface,
    expressao: Binario
): Promise<any> {
    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
    const idExpressao = gerarIdExpressaoBinaria(expressao);
    const chaveEsquerda = `${idExpressao}_esquerda`;

    // Verifica se já avaliamos o lado esquerdo
    if (escopoAtual.espacoMemoria.resolucoesChamadas.hasOwnProperty(chaveEsquerda)) {
        // Lado esquerdo já foi avaliado, agora avaliar o lado direito
        const esquerda = escopoAtual.espacoMemoria.resolucoesChamadas[chaveEsquerda];

        // Avalia o lado direito
        const direita = await interpretador.avaliar(expressao.direita);

        // Limpa o cache do lado esquerdo pois já usamos
        delete escopoAtual.espacoMemoria.resolucoesChamadas[chaveEsquerda];

        // Resolve os valores
        const valorEsquerdo: any = interpretador.resolverValor(esquerda);
        const valorDireito: any = interpretador.resolverValor(direita);
        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
            ? esquerda.tipo
            : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo')
            ? direita.tipo
            : inferirTipoVariavel(direita);

        // Executa a operação binária usando a lógica ancestral
        // Criamos um objeto temporário com os valores já avaliados para evitar re-avaliação
        const expressaoTemp = {
            ...expressao,
            esquerda: { valor: valorEsquerdo, tipo: tipoEsquerdo },
            direita: { valor: valorDireito, tipo: tipoDireito },
        };

        // Não podemos chamar o ancestral diretamente porque ele vai tentar avaliar novamente
        // Em vez disso, precisamos executar a operação diretamente
        return await executarOperacaoBinaria(
            interpretador,
            expressao,
            esquerda,
            direita,
            valorEsquerdo,
            valorDireito,
            tipoEsquerdo,
            tipoDireito
        );
    } else {
        // Rastreia o número de escopos antes de avaliar o lado esquerdo
        const escoposAntes = interpretador.pilhaEscoposExecucao.elementos();

        // Primeira avaliação - avaliar apenas o lado esquerdo
        const esquerda = await interpretador.avaliar(expressao.esquerda);

        // Armazena o resultado do lado esquerdo
        escopoAtual.espacoMemoria.resolucoesChamadas[chaveEsquerda] = esquerda;

        // Verifica se um novo escopo foi criado durante a avaliação do lado esquerdo
        const escoposDepois = interpretador.pilhaEscoposExecucao.elementos();
        const novoEscopoCriado = escoposDepois > escoposAntes;

        // Se estamos em modo adentrarEscopo e um novo escopo foi aberto,
        // a execução deve pausar aqui para permitir que o usuário adentre na função do lado esquerdo
        // A próxima chamada a visitarExpressaoBinaria irá continuar do lado direito
        if (interpretador.comando === 'adentrarEscopo' && novoEscopoCriado) {
            // Retorna um valor temporário, a avaliação será completada na próxima execução
            return null;
        }

        // Verifica se devemos continuar ou pausar
        // Se pontoDeParadaAtivo foi ativado durante a avaliação do lado esquerdo, devemos retornar
        if (interpretador.pontoDeParadaAtivo) {
            // Retorna um valor temporário, a avaliação será completada na próxima execução
            return null;
        }

        // Se não há pausa e não entramos em novo escopo, continuar com a avaliação do lado direito
        const direita = await interpretador.avaliar(expressao.direita);

        // Limpa o cache já que completamos a avaliação
        delete escopoAtual.espacoMemoria.resolucoesChamadas[chaveEsquerda];

        const valorEsquerdo: any = interpretador.resolverValor(esquerda);
        const valorDireito: any = interpretador.resolverValor(direita);
        const tipoEsquerdo: string = esquerda?.hasOwnProperty('tipo')
            ? esquerda.tipo
            : inferirTipoVariavel(esquerda);
        const tipoDireito: string = direita?.hasOwnProperty('tipo')
            ? direita.tipo
            : inferirTipoVariavel(direita);

        return await executarOperacaoBinaria(
            interpretador,
            expressao,
            esquerda,
            direita,
            valorEsquerdo,
            valorDireito,
            tipoEsquerdo,
            tipoDireito
        );
    }
}

/**
 * Executa a operação binária após ambos os lados terem sido avaliados.
 * Contém a lógica de todas as operações binárias suportadas.
 */
async function executarOperacaoBinaria(
    interpretador: any,
    expressao: Binario,
    esquerda: ConstrutoInterface,
    direita: ConstrutoInterface,
    valorEsquerdo: any,
    valorDireito: any,
    tipoEsquerdo: string,
    tipoDireito: string
): Promise<any> {
    switch (expressao.operador.tipo) {
        case tiposDeSimbolos.EXPONENCIACAO:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Math.pow(valorEsquerdo, valorDireito);

        case tiposDeSimbolos.MAIOR:
            if (
                interpretador.tiposNumericos.includes(tipoEsquerdo) &&
                interpretador.tiposNumericos.includes(tipoDireito)
            ) {
                return Number(valorEsquerdo) > Number(valorDireito);
            }
            return String(valorEsquerdo) > String(valorDireito);

        case tiposDeSimbolos.MAIOR_IGUAL:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) >= Number(valorDireito);

        case tiposDeSimbolos.MENOR:
            if (
                interpretador.tiposNumericos.includes(tipoEsquerdo) &&
                interpretador.tiposNumericos.includes(tipoDireito)
            ) {
                return Number(valorEsquerdo) < Number(valorDireito);
            }
            return String(valorEsquerdo) < String(valorDireito);

        case tiposDeSimbolos.MENOR_IGUAL:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) <= Number(valorDireito);

        case tiposDeSimbolos.SUBTRACAO:
        case tiposDeSimbolos.MENOS_IGUAL:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) - Number(valorDireito);

        case tiposDeSimbolos.ADICAO:
        case tiposDeSimbolos.MAIS_IGUAL:
            if (Array.isArray(valorEsquerdo) && Array.isArray(valorDireito)) {
                return valorEsquerdo.concat(valorDireito);
            }
            if (
                interpretador.tiposNumericos.includes(tipoEsquerdo) &&
                interpretador.tiposNumericos.includes(tipoDireito)
            ) {
                return Number(valorEsquerdo) + Number(valorDireito);
            }
            if (tipoEsquerdo === 'qualquer' || tipoDireito === 'qualquer') {
                return valorEsquerdo + valorDireito;
            }
            return interpretador.paraTexto(valorEsquerdo) + interpretador.paraTexto(valorDireito);

        case tiposDeSimbolos.DIVISAO:
        case tiposDeSimbolos.DIVISAO_IGUAL:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) / Number(valorDireito);

        case tiposDeSimbolos.DIVISAO_INTEIRA:
        case tiposDeSimbolos.DIVISAO_INTEIRA_IGUAL:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Math.floor(Number(valorEsquerdo) / Number(valorDireito));

        case tiposDeSimbolos.MULTIPLICACAO:
        case tiposDeSimbolos.MULTIPLICACAO_IGUAL:
            if (
                tipoDeDadosDelegua &&
                (tipoEsquerdo === tipoDeDadosDelegua.TEXTO ||
                    tipoDireito === tipoDeDadosDelegua.TEXTO)
            ) {
                if (
                    tipoEsquerdo === tipoDeDadosDelegua.TEXTO &&
                    tipoDireito === tipoDeDadosDelegua.TEXTO
                ) {
                    return Number(valorEsquerdo) * Number(valorDireito);
                }
                if (tipoEsquerdo === tipoDeDadosDelegua.TEXTO) {
                    return valorEsquerdo.repeat(Number(valorDireito));
                }
                return valorDireito.repeat(Number(valorEsquerdo));
            }
            return Number(valorEsquerdo) * Number(valorDireito);

        case tiposDeSimbolos.MODULO:
        case tiposDeSimbolos.MODULO_IGUAL:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) % Number(valorDireito);

        case tiposDeSimbolos.BIT_AND:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) & Number(valorDireito);

        case tiposDeSimbolos.CIRCUMFLEXO:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) ^ Number(valorDireito);

        case tiposDeSimbolos.BIT_OR:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) | Number(valorDireito);

        case tiposDeSimbolos.MENOR_MENOR:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) << Number(valorDireito);

        case tiposDeSimbolos.MAIOR_MAIOR:
            interpretador.verificarOperandosNumeros(expressao.operador, esquerda, direita);
            return Number(valorEsquerdo) >> Number(valorDireito);

        case tiposDeSimbolos.DIFERENTE:
            return !interpretador.eIgual(valorEsquerdo, valorDireito);

        case tiposDeSimbolos.IGUAL_IGUAL:
            return interpretador.eIgual(valorEsquerdo, valorDireito);
    }
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
        let retornoExecucao: ResultadoParcialInterpretadorInterface;

        // Sempre executa a próxima instrução, mesmo que haja ponto de parada.
        retornoExecucao = await interpretador.executar(
            proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual]
        );
        proximoEscopo.declaracaoAtual++;

        for (
            ;
            !(retornoExecucao instanceof Quebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
            proximoEscopo.declaracaoAtual < proximoEscopo.declaracoes.length;
            proximoEscopo.declaracaoAtual++
        ) {
            const declaracaoAtual = proximoEscopo.declaracoes[proximoEscopo.declaracaoAtual];
            interpretador.linhaDeclaracaoAtual = declaracaoAtual.linha;
            interpretador.hashArquivoDeclaracaoAtual = declaracaoAtual.hashArquivo;
            interpretador.pontoDeParadaAtivo = verificarPontoParada(interpretador, declaracaoAtual);

            if (interpretador.pontoDeParadaAtivo) {
                interpretador.avisoPontoParadaAtivado();
                break;
            }

            retornoExecucao = await interpretador.executar(declaracaoAtual);

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
    // Rastreia quantos escopos existem antes da execução para detectar entrada em novo escopo
    const escoposAntes = interpretador.pilhaEscoposExecucao.elementos();

    let retornoExecucao: any;
    if (interpretador.passos > 0) {
        interpretador.passos--;

        // Executa a declaração atual
        const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
        retornoExecucao = await interpretador.executar(declaracaoAtual);

        // Verifica se entramos em um novo escopo durante a execução
        const escoposDepois = interpretador.pilhaEscoposExecucao.elementos();
        const entroEmNovoEscopo = escoposDepois > escoposAntes;

        // Não incrementa se:
        // - Há um ponto de parada ativo (de escopo interno)
        // - Estamos em um laço de repetição (o laço gerencia a iteração)
        // - Entramos em um novo escopo (precisamos executar o novo escopo antes de avançar)
        if (
            !interpretador.pontoDeParadaAtivo &&
            !ultimoEscopo.emLacoRepeticao &&
            !entroEmNovoEscopo
        ) {
            ultimoEscopo.declaracaoAtual++;
        }

        // Após executar e avançar, verifica se há ponto de parada na PRÓXIMA declaração
        if (
            !interpretador.pontoDeParadaAtivo &&
            ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length
        ) {
            const proximaDeclaracao = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            interpretador.linhaDeclaracaoAtual = proximaDeclaracao.linha;
            interpretador.hashArquivoDeclaracaoAtual = proximaDeclaracao.hashArquivo;
            interpretador.pontoDeParadaAtivo = verificarPontoParada(
                interpretador,
                proximaDeclaracao
            );

            if (interpretador.pontoDeParadaAtivo) {
                interpretador.avisoPontoParadaAtivado();
            }
        }

        if (
            ultimoEscopo.declaracaoAtual >= ultimoEscopo.declaracoes.length ||
            ultimoEscopo.finalizado
        ) {
            if (retornoExecucao instanceof RetornoQuebra) {
                descartarEscopoPorRetornoFuncao(interpretador);
            } else {
                descartarTodosEscoposFinalizados(interpretador);

                // Se escopos foram descartados, precisamos incrementar o contador do escopo pai
                // para avançar além da declaração que criou o escopo aninhado
                const escoposAposLimpeza = interpretador.pilhaEscoposExecucao.elementos();
                if (escoposAposLimpeza < escoposAntes && escoposAposLimpeza > 0) {
                    // Escopos foram removidos, avançar o contador do escopo pai
                    const escopoAtual = interpretador.pilhaEscoposExecucao.topoDaPilha();
                    // Só incrementa se ainda há declarações para executar neste escopo
                    // e não estamos em um laço de repetição
                    if (
                        !escopoAtual.emLacoRepeticao &&
                        escopoAtual.declaracaoAtual < escopoAtual.declaracoes.length
                    ) {
                        escopoAtual.declaracaoAtual++;
                    }
                }
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
    let retornoExecucao: ResultadoParcialInterpretadorInterface;

    try {
        for (
            ;
            !(retornoExecucao instanceof Quebra || (retornoExecucao && retornoExecucao.valorRetornado instanceof Quebra)) &&
            ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
            ultimoEscopo.declaracaoAtual++
        ) {
            const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            interpretador.linhaDeclaracaoAtual = declaracaoAtual.linha;
            interpretador.hashArquivoDeclaracaoAtual = declaracaoAtual.hashArquivo;

            if (naoVerificarPrimeiraExecucao) {
                naoVerificarPrimeiraExecucao = false;
            } else {
                interpretador.pontoDeParadaAtivo = verificarPontoParada(
                    interpretador,
                    declaracaoAtual
                );

                if (interpretador.pontoDeParadaAtivo) {
                    interpretador.avisoPontoParadaAtivado();
                    break;
                }
            }

            retornoExecucao = await interpretador.executar(declaracaoAtual);

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
        // Se estamos dentro de uma declaração tente, re-lança o erro
        // para que o bloco pegue possa capturá-lo
        if ((interpretador as any).emDeclaracaoTente) {
            throw erro;
        }
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
    if (escopo < interpretador.escopoAtual) {
        await instrucaoContinuarInterpretacao(interpretador, escopo + 1);
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
    // Limpa o ponto de parada para permitir a execução
    interpretador.pontoDeParadaAtivo = false;

    // Define comando como 'proximo' se não estiver definido (ex: chamado diretamente por instrucaoPasso)
    // Preserva se já estiver definido (ex: 'adentrarEscopo' definido por adentrarEscopo())
    if (!interpretador.comando) {
        interpretador.comando = 'proximo';
    }
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
    const escopoExecucao: EscopoExecucaoInterface = {
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
            }

            return executarUltimoEscopoComandoContinuar(
                interpretador,
                manterespacoMemoria,
                naoVerificarPrimeiraExecucao
            );

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
