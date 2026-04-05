import {
    AcessoElementoMatriz,
    AcessoIndiceVariavel,
    AcessoIntervaloVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    AtribuicaoPorIndicesMatriz,
    Atribuir,
    Binario,
    Chamada,
    ComentarioComoConstruto,
    Constante,
    DefinirValor,
    Dicionario,
    ExpressaoRegular,
    FimPara,
    FormatacaoEscrita,
    FuncaoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    Separador,
    Super,
    TipoDe,
    Tupla,
    TuplaN,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Bloco,
    CabecalhoPrograma,
    Classe,
    Comentario,
    Const,
    ConstMultiplo,
    Continua,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    InicioAlgoritmo,
    Para,
    ParaCada,
    Retorna,
    Se,
    Sustar,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '../declaracoes';
import { CaminhoEscolha, TradutorInterface, VisitanteComumInterface } from '../interfaces';
import {
    ArestaFluxograma,
    SubgrafoClasse,
    SubgrafoFuncao,
    SubgrafoMetodo,
    VerticeFluxograma,
} from './mermaid';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import { ContinuarQuebra, RetornoQuebra, SustarQuebra } from '../quebras';

/**
 * [MermaidJs](https://mermaid.js.org/) é uma especificação que nos permite
 * criar fluxogramas através de uma notação por texto.
 *
 * Este tradutor converte estruturas da avaliação sintática em um fluxograma
 * compatível com o MermaidJs.
 *
 * Diferentemente de outros tradutores, este não trabalha diretamente com `string`s.
 * Construtos sim devolvem `string`s, mas declarações devolvem um vetor de
 * `VerticeFluxograma`.
 * @see VerticeFluxograma
 */
export class TradutorMermaidJs implements TradutorInterface<Declaracao>, VisitanteComumInterface {
    anteriores: ArestaFluxograma[];
    vertices: VerticeFluxograma[];
    ultimaDicaVertice: string | undefined;
    declaracoesFuncoes: { [nome: string]: SubgrafoFuncao };
    declaracoesClasses: { [nome: string]: SubgrafoClasse };
    indentacaoAtual: number;

    visitarDeclaracaoCabecalhoPrograma(declaracao: CabecalhoPrograma): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoClasse(declaracao: Classe): Promise<VerticeFluxograma[]> {
        const nomeClasse = declaracao.simbolo.lexema;
        const superClasse = declaracao.superClasse
            ? declaracao.superClasse.simbolo?.lexema || declaracao.superClasse.nome?.lexema
            : undefined;
        const linha = declaracao.linha;

        // Cria arestas de entrada e saída para a classe
        const rotulo = declaracao.estrangeira ? 'Classe Estrangeira' : 'Classe';
        const textoInicio = `Classe${nomeClasse}Inicio[Início: ${rotulo} ${nomeClasse}]`;
        const arestaInicial = new ArestaFluxograma(declaracao, textoInicio);

        const textoFim = `Classe${nomeClasse}Fim[Fim: ${rotulo} ${nomeClasse}]`;
        const arestaFinal = new ArestaFluxograma(declaracao, textoFim);

        // Cria o subgrafo da classe
        const subgrafo = new SubgrafoClasse(
            nomeClasse,
            linha,
            arestaInicial,
            arestaFinal,
            superClasse
        );

        // Salva o estado anterior
        const anterioresAntes = [...this.anteriores];

        // Processa métodos
        if (declaracao.metodos && declaracao.metodos.length > 0) {
            for (const metodoDeclaracao of declaracao.metodos) {
                const nomeMetodo = metodoDeclaracao.simbolo.lexema;
                const linhaMetodo = metodoDeclaracao.linha;
                const ehConstrutor = nomeMetodo === 'construtor' || nomeMetodo === 'iniciar';

                // Cria arestas de entrada e saída para o método
                const textoInicioMetodo = `Metodo${nomeMetodo}${nomeClasse}Inicio[Início: ${nomeMetodo}()]`;
                const arestaInicialMetodo = new ArestaFluxograma(
                    metodoDeclaracao,
                    textoInicioMetodo
                );

                const textoFimMetodo = `Metodo${nomeMetodo}${nomeClasse}Fim[Fim: ${nomeMetodo}()]`;
                const arestaFinalMetodo = new ArestaFluxograma(metodoDeclaracao, textoFimMetodo);

                // Cria o subgrafo do método
                const subgrafoMetodo = new SubgrafoMetodo(
                    nomeMetodo,
                    nomeClasse,
                    linhaMetodo,
                    arestaInicialMetodo,
                    arestaFinalMetodo,
                    ehConstrutor
                );

                // Traduz o corpo do método
                this.anteriores = [arestaInicialMetodo];

                if (metodoDeclaracao.funcao.corpo && metodoDeclaracao.funcao.corpo.length > 0) {
                    for (const declaracaoCorpo of metodoDeclaracao.funcao.corpo) {
                        const verticesCorpo = await declaracaoCorpo.aceitar(this);
                        subgrafoMetodo.vertices = subgrafoMetodo.vertices.concat(verticesCorpo);
                    }
                }

                // Conecta o último vértice do corpo ao fim do método
                if (this.anteriores.length > 0) {
                    for (const anterior of this.anteriores) {
                        subgrafoMetodo.vertices.push(
                            new VerticeFluxograma(anterior, arestaFinalMetodo)
                        );
                    }
                }

                // Adiciona o método ao subgrafo da classe
                if (ehConstrutor) {
                    subgrafo.construtor = subgrafoMetodo;
                } else {
                    subgrafo.metodos.push(subgrafoMetodo);
                }
            }
        }

        // Restaura o estado anterior
        this.anteriores = anterioresAntes;

        // Armazena o subgrafo da classe
        this.declaracoesClasses[nomeClasse] = subgrafo;

        return Promise.resolve([]);
    }

    async visitarDeclaracaoComentario(declaracao: Comentario): Promise<string> {
        return Promise.resolve('');
    }

    async visitarDeclaracaoConst(declaracao: Const): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}(variável: ${declaracao.simbolo.lexema}`;
        texto += await this.logicaComumTraducaoVarEConst(declaracao, texto);

        const aresta = new ArestaFluxograma(declaracao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    visitarDeclaracaoConstMultiplo(declaracao: ConstMultiplo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<VerticeFluxograma[]> {
        // Verifica se é uma chamada de função
        if (declaracao.expressao.constructor === Chamada) {
            const chamada = declaracao.expressao as Chamada;
            const verticesChamada = await this.traduzirChamadaFuncao(declaracao, chamada);

            if (verticesChamada.length > 0) {
                return Promise.resolve(verticesChamada);
            }
        }

        // Se não for uma chamada de função ou não for uma função conhecida,
        // trata como expressão normal
        let texto = `Linha${declaracao.linha}(`;
        const textoConstruto = await declaracao.expressao.aceitar(this);
        texto += textoConstruto + ')';

        const aresta = new ArestaFluxograma(declaracao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoDefinicaoFuncao(
        declaracao: FuncaoDeclaracao
    ): Promise<VerticeFluxograma[]> {
        const nomeFuncao = declaracao.simbolo.lexema;
        const linha = declaracao.linha;

        // Cria arestas de entrada e saída para a função
        const textoInicio = `Func${nomeFuncao}Inicio[Início: ${nomeFuncao}()]`;
        const arestaInicial = new ArestaFluxograma(declaracao, textoInicio);

        const textoFim = `Func${nomeFuncao}Fim[Fim: ${nomeFuncao}()]`;
        const arestaFinal = new ArestaFluxograma(declaracao, textoFim);

        // Cria o subgrafo da função
        const subgrafo = new SubgrafoFuncao(nomeFuncao, linha, arestaInicial, arestaFinal);

        // Salva o estado atual de anteriores
        const anterioresAntes = [...this.anteriores];
        this.anteriores = [arestaInicial];

        // Processa o corpo da função
        if (declaracao.funcao.corpo && declaracao.funcao.corpo.length > 0) {
            for (const declaracaoCorpo of declaracao.funcao.corpo) {
                const verticesCorpo = await declaracaoCorpo.aceitar(this);
                subgrafo.vertices = subgrafo.vertices.concat(verticesCorpo);
            }
        }

        // Conecta o fim do corpo à aresta final
        if (this.anteriores.length > 0) {
            for (const anterior of this.anteriores) {
                subgrafo.vertices.push(new VerticeFluxograma(anterior, arestaFinal));
            }
        }

        // Restaura o estado anterior
        this.anteriores = anterioresAntes;

        // Armazena o subgrafo
        this.declaracoesFuncoes[nomeFuncao] = subgrafo;

        // Não adiciona ao fluxo principal
        return Promise.resolve([]);
    }

    async visitarDeclaracaoEnquanto(declaracao: Enquanto): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}(enquanto `;
        const condicao = await declaracao.condicao.aceitar(this);

        texto += condicao + ')';
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = await declaracao.corpo.aceitar(this);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const verticeLaco = new VerticeFluxograma(ultimaArestaCorpo, aresta);
        vertices.push(verticeLaco);

        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoEscolha(declaracao: Escolha): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}(escolha um caminho pelo valor de `;
        const textoIdentificadorOuLiteral = await declaracao.identificadorOuLiteral.aceitar(this);
        texto += textoIdentificadorOuLiteral + ')';
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        const arestasCaminho: {
            caminho: ArestaFluxograma;
            declaracoesCaminho: VerticeFluxograma[];
        }[] = [];

        for (const caminho of declaracao.caminhos) {
            arestasCaminho.push(
                await this.logicaComumCaminhoEscolha(
                    declaracao,
                    caminho,
                    caminho.condicoes[0].linha,
                    textoIdentificadorOuLiteral,
                    false
                )
            );
        }

        if (declaracao.caminhoPadrao) {
            arestasCaminho.push(
                await this.logicaComumCaminhoEscolha(
                    declaracao,
                    declaracao.caminhoPadrao,
                    declaracao.caminhoPadrao.declaracoes[0].linha - 1,
                    textoIdentificadorOuLiteral,
                    true
                )
            );
        }

        for (const conjunto of Object.values(arestasCaminho)) {
            const verticeEscolhaECaminho = new VerticeFluxograma(aresta, conjunto.caminho);
            vertices.push(verticeEscolhaECaminho);
            vertices = vertices.concat(conjunto.declaracoesCaminho);
            this.anteriores.push(
                conjunto.declaracoesCaminho[conjunto.declaracoesCaminho.length - 1].destino
            );
        }

        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}(escreva: `;
        for (const argumento of declaracao.argumentos) {
            const valor = await argumento.aceitar(this);
            texto += valor + ', ';
        }

        texto = texto.slice(0, -2);
        texto += ')';
        const aresta = new ArestaFluxograma(declaracao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    visitarDeclaracaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoFazer(declaracao: Fazer): Promise<VerticeFluxograma[]> {
        const texto = `Linha${declaracao.linha}(fazer)`;
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = await declaracao.caminhoFazer.aceitar(this);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const condicao: string = await declaracao.condicaoEnquanto.aceitar(this);
        let textoEnquanto = `Linha${declaracao.condicaoEnquanto.linha}(enquanto ${condicao})`;

        const arestaEnquanto = new ArestaFluxograma(declaracao, textoEnquanto);
        const verticeEnquanto = new VerticeFluxograma(ultimaArestaCorpo, arestaEnquanto);
        vertices.push(verticeEnquanto);

        const verticeCondicaoComFazer = new VerticeFluxograma(arestaEnquanto, aresta);
        vertices.push(verticeCondicaoComFazer);

        this.anteriores.pop();
        this.anteriores.push(arestaEnquanto);
        return Promise.resolve(vertices);
    }

    visitarDeclaracaoInicioAlgoritmo(declaracao: InicioAlgoritmo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<VerticeFluxograma[]> {
        const textoVariavelIteracao = await declaracao.variavelIteracao.aceitar(this);
        let texto = `Linha${declaracao.linha}(para cada ${textoVariavelIteracao} em `;
        const textoVariavelIterada = await declaracao.vetorOuDicionario.aceitar(this);
        texto += textoVariavelIterada + ')';
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = await declaracao.corpo.aceitar(this);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        vertices.push(new VerticeFluxograma(ultimaArestaCorpo, aresta));

        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoPara(declaracao: Para): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}(para `;
        if (declaracao.inicializador) {
            for (const declaracaoInicializadora of declaracao.inicializador as Declaracao[]) {
                // Normalmente é `Var`.
                const declaracaoVar = declaracaoInicializadora as Var;
                const valorInicializacao = await declaracaoVar.inicializador.aceitar(this);
                texto += `uma variável ${declaracaoVar.simbolo.lexema} inicializada com ${valorInicializacao}, `;
            }

            texto = texto.slice(0, -2);
        }

        texto += ')';
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Condição
        const textoCondicao = await declaracao.condicao.aceitar(this);
        const textoArestaCondicao = `Linha${declaracao.linha}Condicao{se ${textoCondicao}}`;
        const arestaCondicao = new ArestaFluxograma(declaracao, textoArestaCondicao);
        vertices = vertices.concat(this.logicaComumConexaoArestas(arestaCondicao));

        this.anteriores.push(arestaCondicao);
        this.ultimaDicaVertice = 'Sim';

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = await declaracao.corpo.aceitar(this);
        vertices = vertices.concat(verticesCorpo);

        // Incremento
        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const textoIncremento = await declaracao.incrementar.aceitar(this);
        const arestaIncremento = new ArestaFluxograma(
            declaracao,
            `Linha${declaracao.linha}Incremento(${textoIncremento})`
        );
        const verticeIncremento = new VerticeFluxograma(ultimaArestaCorpo, arestaIncremento);
        vertices.push(verticeIncremento);

        const verticeLaco = new VerticeFluxograma(arestaIncremento, arestaCondicao);
        vertices.push(verticeLaco);

        // Configura a condição como anterior
        this.anteriores.pop();
        this.anteriores.push(arestaCondicao);
        this.ultimaDicaVertice = 'Não';
        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoSe(declaracao: Se): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}{se `;
        const condicao = await declaracao.condicao.aceitar(this);
        texto += condicao;
        texto += `}`;

        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        this.ultimaDicaVertice = 'Sim';

        // Caminho então, normalmente um `Bloco`.
        const verticesEntao: VerticeFluxograma[] = await declaracao.caminhoEntao.aceitar(this);
        vertices = vertices.concat(verticesEntao);

        const ultimaArestaEntao =
            verticesEntao.length > 0 ? verticesEntao[verticesEntao.length - 1].destino : aresta;

        if (declaracao.caminhoSenao) {
            this.anteriores = [];

            // Verifica se é "senão se" ou apenas "senão"
            const ehSenaoSe = declaracao.caminhoSenao.constructor === Se;

            if (ehSenaoSe) {
                // Para "senão se", conecta diretamente ao próximo condicional sem nó intermediário
                this.anteriores.push(aresta);
                this.ultimaDicaVertice = 'Não';
            } else {
                // Para "senão" simples, cria o nó intermediário
                const arestaSenao = new ArestaFluxograma(
                    declaracao,
                    `Linha${declaracao.caminhoSenao.linha}(senão)`
                );
                vertices.push(new VerticeFluxograma(aresta, arestaSenao, 'Não'));
                this.anteriores.push(arestaSenao);
            }

            const verticesSenao: VerticeFluxograma[] = await declaracao.caminhoSenao.aceitar(this);
            vertices = vertices.concat(verticesSenao);
        }

        this.anteriores.push(ultimaArestaEntao);
        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoTendoComo(declaracao: TendoComo): Promise<VerticeFluxograma[]> {
        const textoVariavelIteracao = await declaracao.inicializacaoVariavel.aceitar(this);
        let texto = `Linha${declaracao.linha}(tendo ${textoVariavelIteracao} como `;
        texto += declaracao.simboloVariavel.lexema + ')';
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = await declaracao.corpo.aceitar(this);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        vertices.push(new VerticeFluxograma(ultimaArestaCorpo, aresta));

        return Promise.resolve(vertices);
    }

    async visitarDeclaracaoTente(declaracao: Tente): Promise<VerticeFluxograma[]> {
        const texto = `Linha${declaracao.linha}(tente)`;
        const aresta = new ArestaFluxograma(declaracao, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Caminho tente (try)
        const verticesTente: VerticeFluxograma[] = [];
        for (const declaracaoTente of declaracao.caminhoTente) {
            const verticesDeclaracao = await declaracaoTente.aceitar(this);
            verticesTente.push(...verticesDeclaracao);
        }
        vertices = vertices.concat(verticesTente);

        const ultimaArestaTente =
            verticesTente.length > 0 ? verticesTente[verticesTente.length - 1].destino : aresta;

        const anterioresAposTente: ArestaFluxograma[] = [];

        // Caminho pegue (catch) - se existir
        if (declaracao.caminhoPegue) {
            this.anteriores = [aresta];
            const arestaPegue = new ArestaFluxograma(
                declaracao,
                `Linha${declaracao.linha}Pegue(pegue)`
            );
            vertices.push(new VerticeFluxograma(aresta, arestaPegue, 'Erro'));
            this.anteriores.push(arestaPegue);

            const verticesPegue: VerticeFluxograma[] = [];
            if (Array.isArray(declaracao.caminhoPegue)) {
                for (const declaracaoPegue of declaracao.caminhoPegue) {
                    const verticesDeclaracao = await declaracaoPegue.aceitar(this);
                    verticesPegue.push(...verticesDeclaracao);
                }
            }
            vertices = vertices.concat(verticesPegue);

            const ultimaArestaPegue =
                verticesPegue.length > 0
                    ? verticesPegue[verticesPegue.length - 1].destino
                    : arestaPegue;

            anterioresAposTente.push(ultimaArestaPegue);
        }

        // Caminho senão (else) - se existir
        if (declaracao.caminhoSenao && declaracao.caminhoSenao.length > 0) {
            this.anteriores = [ultimaArestaTente];
            const arestaSenao = new ArestaFluxograma(
                declaracao,
                `Linha${declaracao.linha}Senao(senão - sem erro)`
            );
            vertices.push(new VerticeFluxograma(ultimaArestaTente, arestaSenao, 'Sucesso'));
            this.anteriores.push(arestaSenao);

            const verticesSenao: VerticeFluxograma[] = [];
            for (const declaracaoSenao of declaracao.caminhoSenao) {
                const verticesDeclaracao = await declaracaoSenao.aceitar(this);
                verticesSenao.push(...verticesDeclaracao);
            }
            vertices = vertices.concat(verticesSenao);

            const ultimaArestaSenao =
                verticesSenao.length > 0
                    ? verticesSenao[verticesSenao.length - 1].destino
                    : arestaSenao;

            anterioresAposTente.push(ultimaArestaSenao);
        } else {
            // Se não há senão, o caminho de sucesso também continua
            anterioresAposTente.push(ultimaArestaTente);
        }

        // Caminho finalmente (finally) - se existir
        if (declaracao.caminhoFinalmente && declaracao.caminhoFinalmente.length > 0) {
            this.anteriores = anterioresAposTente;
            const arestaFinalmente = new ArestaFluxograma(
                declaracao,
                `Linha${declaracao.linha}Finalmente(finalmente)`
            );
            vertices = vertices.concat(this.logicaComumConexaoArestas(arestaFinalmente));
            this.anteriores.push(arestaFinalmente);

            const verticesFinalmente: VerticeFluxograma[] = [];
            for (const declaracaoFinalmente of declaracao.caminhoFinalmente) {
                const verticesDeclaracao = await declaracaoFinalmente.aceitar(this);
                verticesFinalmente.push(...verticesDeclaracao);
            }
            vertices = vertices.concat(verticesFinalmente);
        } else {
            // Se não há finalmente, os anteriores são os caminhos após tente
            this.anteriores = anterioresAposTente;
        }

        return Promise.resolve(vertices);
    }

    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarDeclaracaoVar(declaracao: Var): Promise<VerticeFluxograma[]> {
        let texto = `Linha${declaracao.linha}(variável: ${declaracao.simbolo.lexema}`;
        texto += await this.logicaComumTraducaoVarEConst(declaracao, texto);

        const aresta = new ArestaFluxograma(declaracao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    visitarDeclaracaoVarMultiplo(declaracao: VarMultiplo): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoDeAtribuicao(expressao: Atribuir): Promise<string> {
        const textoAlvo = await expressao.alvo.aceitar(this);
        const textoValor = await expressao.valor.aceitar(this);
        return Promise.resolve(`${textoAlvo} recebe: ${textoValor}`);
    }

    async visitarExpressaoAcessoIndiceVariavel(expressao: AcessoIndiceVariavel): Promise<string> {
        const textoIndice = await expressao.indice.aceitar(this);
        return Promise.resolve(`no índice ${textoIndice}`);
    }

    visitarExpressaoAcessoIntervaloVariavel(
        expressao: AcessoIntervaloVariavel
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    visitarExpressaoAcessoElementoMatriz(expressao: AcessoElementoMatriz): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoAcessoMetodo(expressao: AcessoMetodo): Promise<string> {
        return Promise.resolve(`método ${expressao.nomeMetodo}`);
    }

    async visitarExpressaoAcessoMetodoOuPropriedade(
        expressao: AcessoMetodoOuPropriedade
    ): Promise<string> {
        return Promise.resolve(`método ou propriedade ${expressao.simbolo.lexema}`);
    }

    async visitarExpressaoAcessoPropriedade(expressao: AcessoPropriedade): Promise<string> {
        return Promise.resolve(`propriedade ${expressao.nomePropriedade}`);
    }

    async visitarExpressaoAgrupamento(expressao: Agrupamento): Promise<string> {
        return await expressao.expressao.aceitar(this);
    }

    async visitarExpressaoArgumentoReferenciaFuncao(
        expressao: ArgumentoReferenciaFuncao
    ): Promise<string> {
        const nomeFuncao = expressao.simboloFuncao.lexema;
        return Promise.resolve(`referência à função ${nomeFuncao}`);
    }

    async visitarExpressaoAtribuicaoPorIndice(expressao: AtribuicaoPorIndice): Promise<string> {
        const textoObjeto = await expressao.objeto.aceitar(this);
        const textoIndice = await expressao.indice.aceitar(this);
        const textoValor = await expressao.valor.aceitar(this);
        return Promise.resolve(`${textoObjeto} no índice ${textoIndice} recebe: ${textoValor}`);
    }

    visitarExpressaoAtribuicaoPorIndicesMatriz(
        expressao: AtribuicaoPorIndicesMatriz
    ): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoBinaria(expressao: Binario): Promise<string> {
        const operandoEsquerdo: string = await expressao.esquerda.aceitar(this);
        const operandoDireito: string = await expressao.direita.aceitar(this);
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return Promise.resolve(`somar ${operandoEsquerdo} e ${operandoDireito}`);
            case tiposDeSimbolos.SUBTRACAO:
                return Promise.resolve(`subtrair ${operandoDireito} de ${operandoEsquerdo}`);
            case tiposDeSimbolos.MULTIPLICACAO:
                return Promise.resolve(`multiplicar ${operandoEsquerdo} por ${operandoDireito}`);
            case tiposDeSimbolos.DIVISAO:
                return Promise.resolve(`dividir ${operandoEsquerdo} por ${operandoDireito}`);
            case tiposDeSimbolos.MODULO:
                return Promise.resolve(
                    `resto de ${operandoEsquerdo} dividido por ${operandoDireito}`
                );
            case tiposDeSimbolos.MENOR:
                return Promise.resolve(`${operandoEsquerdo} for menor que ${operandoDireito}`);
            case tiposDeSimbolos.MENOR_IGUAL:
                return Promise.resolve(
                    `${operandoEsquerdo} for menor ou igual a ${operandoDireito}`
                );
            case tiposDeSimbolos.MAIOR:
                return Promise.resolve(`${operandoEsquerdo} for maior que ${operandoDireito}`);
            case tiposDeSimbolos.MAIOR_IGUAL:
                return Promise.resolve(
                    `${operandoEsquerdo} for maior ou igual a ${operandoDireito}`
                );
            case tiposDeSimbolos.IGUAL_IGUAL:
                return Promise.resolve(`${operandoEsquerdo} for igual a ${operandoDireito}`);
            case tiposDeSimbolos.DIFERENTE:
                return Promise.resolve(`${operandoEsquerdo} for diferente de ${operandoDireito}`);
        }

        return Promise.resolve('');
    }

    async visitarExpressaoBloco(bloco: Bloco): Promise<VerticeFluxograma[]> {
        let vertices: VerticeFluxograma[] = [];
        for (const declaracao of bloco.declaracoes) {
            const verticesDeclaracao = await declaracao.aceitar(this);
            vertices = vertices.concat(verticesDeclaracao);
        }

        return Promise.resolve(vertices);
    }

    async visitarExpressaoComentario(expressao: ComentarioComoConstruto): Promise<string> {
        return Promise.resolve('');
    }

    async visitarExpressaoContinua(declaracao?: Continua): Promise<VerticeFluxograma[]> {
        const texto = `Linha${declaracao.linha}(continua)`;
        const aresta = new ArestaFluxograma(declaracao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    async visitarExpressaoDeChamada(expressao: Chamada): Promise<string> {
        const textoEntidadeChamada = await expressao.entidadeChamada.aceitar(this);
        let texto = `chamada a ${textoEntidadeChamada}`;

        if (expressao.argumentos.length > 0) {
            texto += `, com argumentos: `;
            for (const argumento of expressao.argumentos) {
                const textoArgumento = await argumento.aceitar(this);
                texto += `${textoArgumento}, `;
            }

            texto = texto.slice(0, -2);
        } else {
            texto += `, sem argumentos`;
        }

        return Promise.resolve(texto);
    }

    async visitarExpressaoDefinirValor(expressao: DefinirValor): Promise<string> {
        const textoObjeto = await expressao.objeto.aceitar(this);
        const textoValor = await expressao.valor.aceitar(this);
        return Promise.resolve(`${expressao.nome.lexema} em ${textoObjeto} recebe ${textoValor}`);
    }

    async visitarExpressaoFuncaoConstruto(expressao: FuncaoConstruto): Promise<string> {
        let texto = 'função anônima';

        if (expressao.parametros && expressao.parametros.length > 0) {
            const parametros = expressao.parametros.map((p) => p.nome.lexema).join(', ');
            texto += `(${parametros})`;
        } else {
            texto += '()';
        }

        return Promise.resolve(texto);
    }

    async visitarExpressaoDeVariavel(expressao: Variavel | Constante): Promise<string> {
        return Promise.resolve(expressao.simbolo.lexema);
    }

    async visitarExpressaoDicionario(expressao: Dicionario): Promise<string> {
        let texto = `dicionário`;
        if (expressao.chaves.length > 0) {
            texto += `, com `;
            for (const [chave, indice] of Object.entries(expressao.chaves)) {
                texto += `chave ${chave} definida com o valor ${expressao.valores[0]}`;
            }
        } else {
            texto += ' vazio';
        }

        return Promise.resolve(texto);
    }

    async visitarExpressaoExpressaoRegular(expressao: ExpressaoRegular): Promise<string> {
        // Representa a expressão regular como texto para o fluxograma
        const padraoRegex = expressao.valor ? String(expressao.valor) : expressao.simbolo.lexema;
        return Promise.resolve(`expressão regular: /${padraoRegex}/`);
    }

    async visitarExpressaoFalhar(expressao: Falhar): Promise<VerticeFluxograma[]> {
        let texto = `Linha${expressao.linha}(falhar`;

        if (expressao.explicacao) {
            const textoExplicacao = await expressao.explicacao.aceitar(this);
            texto += `: ${textoExplicacao}`;
        }

        texto += ')';

        const aresta = new ArestaFluxograma(expressao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    visitarExpressaoFimPara(declaracao: FimPara): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita): Promise<string> {
        const textoExpressao = await declaracao.expressao.aceitar(this);
        let formato = textoExpressao;

        // Adiciona informações de formatação se especificadas
        const partes: string[] = [textoExpressao];

        if (declaracao.espacos > 0) {
            partes.push(`${declaracao.espacos} espaços`);
        }

        if (declaracao.casasDecimais > 0) {
            partes.push(`${declaracao.casasDecimais} casas decimais`);
        }

        if (partes.length > 1) {
            formato = `${partes[0]} (${partes.slice(1).join(', ')})`;
        }

        return Promise.resolve(formato);
    }

    async visitarExpressaoIsto(expressao: Isto): Promise<string> {
        return Promise.resolve('this');
    }

    async visitarExpressaoLeia(expressao: Leia): Promise<string> {
        let texto = 'leia da entrada';
        if (expressao.argumentos && expressao.argumentos.length > 0) {
            const textoArgumento = await expressao.argumentos[0].aceitar(this);
            texto += `, imprimindo antes: \\'${textoArgumento}\\'`;
        }

        return Promise.resolve(texto);
    }

    async visitarExpressaoLiteral(expressao: Literal): Promise<string> {
        switch (expressao.tipo) {
            case 'lógico':
                return Promise.resolve(expressao.valor ? 'verdadeiro' : 'falso');
            case 'texto':
                return Promise.resolve(`\\'${expressao.valor}\\'`);
            default:
                return Promise.resolve(String(expressao.valor));
        }
    }

    async visitarExpressaoLogica(expressao: Logico): Promise<string> {
        const operandoEsquerdo: string = await expressao.esquerda.aceitar(this);
        const operandoDireito: string = await expressao.direita.aceitar(this);

        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.E:
                return Promise.resolve(`${operandoEsquerdo} e ${operandoDireito}`);
            case tiposDeSimbolos.OU:
                return Promise.resolve(`${operandoEsquerdo} ou ${operandoDireito}`);
        }

        return Promise.resolve('');
    }

    async visitarExpressaoReferenciaFuncao(expressao: ReferenciaFuncao): Promise<string> {
        const nomeFuncao = expressao.simboloFuncao.lexema;
        return Promise.resolve(`@${nomeFuncao}`);
    }

    async visitarExpressaoRetornar(expressao: Retorna): Promise<VerticeFluxograma[]> {
        let texto = `Linha${expressao.linha}(retorna`;
        if (expressao.valor) {
            texto += `: ${await expressao.valor.aceitar(this)}`;
        }
        texto += ')';

        const aresta = new ArestaFluxograma(expressao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    async visitarExpressaoSeparador(expressao: Separador): Promise<string> {
        return Promise.resolve(`${expressao.conteudo} `);
    }

    async visitarExpressaoSuper(expressao: Super): Promise<string> {
        return Promise.resolve('super');
    }

    async visitarExpressaoSustar(declaracao?: Sustar): Promise<VerticeFluxograma[]> {
        const texto = `Linha${declaracao.linha}(sustar)`;
        const aresta = new ArestaFluxograma(declaracao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return Promise.resolve(vertices);
    }

    async visitarExpressaoTupla(expressao: Tupla): Promise<string> {
        // Tupla base pode ter um único valor
        if (expressao.valor !== undefined) {
            return Promise.resolve(`tupla(${expressao.valor})`);
        }

        // Se não houver valor, tupla vazia
        return Promise.resolve('tupla()');
    }

    async visitarExpressaoTuplaN(expressao: TuplaN): Promise<string> {
        const valores = [];
        for (const elemento of expressao.elementos) {
            const valorTraduzido = await elemento.aceitar(this);
            valores.push(valorTraduzido);
        }

        return Promise.resolve(`tupla(${valores.join(', ')})`);
    }

    visitarExpressaoTipoDe(expressao: TipoDe): Promise<any> | void {
        throw new Error('Método não implementado.');
    }

    async visitarExpressaoUnaria(expressao: Unario): Promise<string> {
        const textoOperando = await expressao.operando.aceitar(this);
        let textoOperador = '';
        switch (expressao.operador.tipo) {
            case tiposDeSimbolos.INCREMENTAR:
                textoOperador = `incrementar ${textoOperando} em 1`;
                break;
            case tiposDeSimbolos.DECREMENTAR:
                textoOperador = `decrementar ${textoOperando} de 1`;
                break;
        }

        switch (expressao.incidenciaOperador) {
            case 'ANTES':
                return Promise.resolve(`${textoOperador}, devolver valor de ${textoOperando}`);
            case 'DEPOIS':
                return Promise.resolve(`devolver valor de ${textoOperando}, ${textoOperador}`);
        }
    }
    async visitarExpressaoVetor(expressao: Vetor): Promise<string> {
        let texto = `vetor: `;
        for (const elemento of expressao.valores) {
            texto += await elemento.aceitar(this);
        }

        return Promise.resolve(texto);
    }

    /**
     * Traduz uma declaração de Expressao que contém uma chamada de função,
     * criando os vértices necessários para conectar ao subgrafo da função.
     */
    async traduzirChamadaFuncao(
        declaracaoExpressao: Expressao,
        chamada: Chamada
    ): Promise<VerticeFluxograma[]> {
        // Verifica se é uma chamada a uma função conhecida
        if (chamada.entidadeChamada.constructor === Variavel) {
            const variavel = chamada.entidadeChamada as Variavel;
            const nomeFuncao = variavel.simbolo.lexema;

            if (this.declaracoesFuncoes[nomeFuncao]) {
                const subgrafo = this.declaracoesFuncoes[nomeFuncao];
                let vertices: VerticeFluxograma[] = [];

                // Conecta do fluxo atual para a entrada da função
                const textoPreChamada = `Linha${declaracaoExpressao.linha}(${await chamada.aceitar(this)})`;
                const arestaPreChamada = new ArestaFluxograma(declaracaoExpressao, textoPreChamada);
                vertices = vertices.concat(this.logicaComumConexaoArestas(arestaPreChamada));

                // Conecta a pré-chamada ao início da função
                vertices.push(new VerticeFluxograma(arestaPreChamada, subgrafo.arestaInicial));

                // A saída da função volta para o fluxo principal
                this.anteriores = [subgrafo.arestaFinal];

                return Promise.resolve(vertices);
            }
        }

        // Se não for uma função conhecida, trata como expressão normal
        return Promise.resolve([]);
    }

    protected logicaComumConexaoArestas(aresta: ArestaFluxograma) {
        const vertices: VerticeFluxograma[] = [];

        while (this.anteriores.length > 0) {
            const anterior = this.anteriores.shift();
            let textoVertice = undefined;
            if (this.ultimaDicaVertice) {
                textoVertice = String(this.ultimaDicaVertice);
                this.ultimaDicaVertice = undefined;
            }

            vertices.push(new VerticeFluxograma(anterior, aresta, textoVertice));
        }

        return vertices;
    }

    protected async logicaComumCaminhoEscolha(
        declaracaoEscolha: Escolha,
        caminhoEscolha: CaminhoEscolha,
        linha: number,
        textoIdentificadorOuLiteral: string,
        caminhoPadrao: boolean
    ): Promise<{
        caminho: ArestaFluxograma;
        declaracoesCaminho: VerticeFluxograma[];
    }> {
        let textoCaso: string = '';
        if (!caminhoPadrao) {
            textoCaso = `caso ${textoIdentificadorOuLiteral} seja igual a `;
            for (const condicao of caminhoEscolha.condicoes) {
                const textoCondicao = await condicao.aceitar(this);
                textoCaso += `${textoCondicao} ou `;
            }

            textoCaso = textoCaso.slice(0, -4);
            textoCaso += ':';
        } else {
            textoCaso = `caso ${textoIdentificadorOuLiteral} tenha qualquer outro valor:`;
        }

        let textoCaminho = `Linha${linha}(${textoCaso})`;

        const arestaCondicaoCaminho = new ArestaFluxograma(declaracaoEscolha, textoCaminho);
        this.anteriores.push(arestaCondicaoCaminho);
        let verticesResolvidos: VerticeFluxograma[] = [];

        for (const declaracaoCaminho of caminhoEscolha.declaracoes) {
            const verticesDeclaracoes: VerticeFluxograma[] = await declaracaoCaminho.aceitar(this);
            verticesResolvidos = verticesResolvidos.concat(verticesDeclaracoes);
            this.anteriores.pop();
            this.anteriores.push(verticesDeclaracoes[verticesDeclaracoes.length - 1].destino);
        }

        this.anteriores.pop();

        return Promise.resolve({
            caminho: arestaCondicaoCaminho,
            declaracoesCaminho: verticesResolvidos,
        });
    }

    protected async logicaComumTraducaoVarEConst(
        declaracaoVarOuConst: Var | Const,
        textoInicial: string
    ): Promise<string> {
        let adicional = '';
        if (declaracaoVarOuConst.inicializador) {
            adicional += `, iniciada com: ${await declaracaoVarOuConst.inicializador.aceitar(this)}`;
        }

        adicional += ')';
        return Promise.resolve(adicional);
    }

    /**
     * Ponto de entrada para a tradução de declarações em um fluxograma
     * no formato MermaidJs.
     * @param {Declaracao[]} declaracoes As declarações a serem traduzidas.
     * @returns {string} Texto no formato MermaidJs representando o fluxograma.
     */
    async traduzir(declaracoes: Declaracao[]): Promise<string> {
        this.anteriores = [];
        this.vertices = [];
        let resultado = 'graph TD;\n';
        this.indentacaoAtual = 4;
        this.declaracoesFuncoes = {};
        this.declaracoesClasses = {};

        for (const declaracao of declaracoes) {
            this.vertices = this.vertices.concat(await declaracao.aceitar(this));
        }

        // Renderiza os subgrafos de funções
        if (Object.keys(this.declaracoesFuncoes).length > 0) {
            for (const [nomeFuncao, subgrafo] of Object.entries(this.declaracoesFuncoes)) {
                resultado += `    subgraph ${nomeFuncao}["Função: ${nomeFuncao}()"]\n`;

                // Renderiza os vértices da função
                for (const vertice of subgrafo.vertices) {
                    resultado += '    ' + vertice.paraTexto();
                }

                resultado += `    end\n`;
            }
        }

        // Renderiza os subgrafos de classes
        if (Object.keys(this.declaracoesClasses).length > 0) {
            for (const [nomeClasse, subgrafo] of Object.entries(this.declaracoesClasses)) {
                resultado += subgrafo.paraTexto();
            }
        }

        if (this.vertices.length === 0 && this.anteriores.length === 0) {
            resultado += `    Vazio;\n`;
        }

        if (this.vertices.length > 0) {
            for (const vertice of this.vertices) {
                resultado += vertice.paraTexto();
            }
        }

        if (this.anteriores.length > 0) {
            while (this.anteriores.length > 0) {
                const anterior = this.anteriores.shift();
                let seta = '-->';
                if (this.ultimaDicaVertice) {
                    seta = `-->|${this.ultimaDicaVertice}|`;
                    this.ultimaDicaVertice = undefined;
                }

                resultado += `    ${anterior.texto}${seta}Fim;\n`;
            }
        }

        return resultado;
    }
}
