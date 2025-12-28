import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Dicionario,
    FuncaoConstruto,
    Leia,
    Literal,
    Separador,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Bloco,
    Classe,
    Const,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    Expressao,
    Fazer,
    FuncaoDeclaracao,
    Para,
    ParaCada,
    Se,
    Var,
} from '../declaracoes';
import { CaminhoEscolha, TradutorInterface } from '../interfaces';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';
import { ArestaFluxograma, DiagramaClasse, SubgrafoClasse, SubgrafoFuncao, VerticeFluxograma } from './mermaid';

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
export class TradutorMermaidJs implements TradutorInterface<Declaracao> {
    anteriores: ArestaFluxograma[];
    vertices: VerticeFluxograma[];
    ultimaDicaVertice: string | undefined;
    classes: DiagramaClasse[];
    subgrafosFuncoes: { [nome: string]: SubgrafoFuncao };
    indentacaoAtual: number;

    traduzirConstrutoAcessoIndiceVariavel(acessoIndiceVariavel: AcessoIndiceVariavel): string {
        const textoIndice = this.dicionarioConstrutos[acessoIndiceVariavel.indice.constructor.name](
            acessoIndiceVariavel.indice
        );
        return `no índice ${textoIndice}`;
    }

    traduzirConstrutoAcessoMetodo(acessoMetodo: AcessoMetodo): string {
        return `método ${acessoMetodo.nomeMetodo}`;
    }

    traduzirConstrutoAcessoMetodoOuPropriedade(
        acessoMetodoOuPropriedade: AcessoMetodoOuPropriedade
    ): string {
        return `método ou propriedade ${acessoMetodoOuPropriedade.simbolo.lexema}`;
    }

    traduzirConstrutoAcessoPropriedade(acessoPropriedade: AcessoPropriedade): string {
        return `propriedade ${acessoPropriedade.nomePropriedade}`;
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.expressao.constructor.name](
            agrupamento.expressao
        );
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        const textoAlvo = this.dicionarioConstrutos[atribuir.alvo.constructor.name](atribuir.alvo);
        const textoValor = this.dicionarioConstrutos[atribuir.valor.constructor.name](
            atribuir.valor
        );
        return `${textoAlvo} recebe: ${textoValor}`;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        const operandoEsquerdo: string = this.dicionarioConstrutos[
            binario.esquerda.constructor.name
        ](binario.esquerda);
        const operandoDireito: string = this.dicionarioConstrutos[binario.direita.constructor.name](
            binario.direita
        );
        switch (binario.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return `somar ${operandoEsquerdo} e ${operandoDireito}`;
            case tiposDeSimbolos.MENOR:
                return `${operandoEsquerdo} for menor que ${operandoDireito}`;
        }

        return '';
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        const textoEntidadeChamada = this.dicionarioConstrutos[
            chamada.entidadeChamada.constructor.name
        ](chamada.entidadeChamada);
        let texto = `chamada a ${textoEntidadeChamada}`;

        if (chamada.argumentos.length > 0) {
            texto += `, com argumentos: `;
            for (const argumento of chamada.argumentos) {
                const textoArgumento =
                    this.dicionarioConstrutos[argumento.constructor.name](argumento);
                texto += `${textoArgumento}, `;
            }

            texto = texto.slice(0, -2);
        } else {
            texto += `, sem argumentos`;
        }

        return texto;
    }

    traduzirConstrutoDefinirValor(definirValor: DefinirValor): string {
        const textoObjeto = this.dicionarioConstrutos[definirValor.objeto.constructor.name](
            definirValor.objeto
        );
        const textoValor = this.dicionarioConstrutos[definirValor.valor.constructor.name](
            definirValor.valor
        );
        return `${definirValor.nome.lexema} em ${textoObjeto} recebe ${textoValor}`;
    }

    traduzirConstrutoDicionario(dicionario: Dicionario): string {
        let texto = `dicionário`;
        if (dicionario.chaves.length > 0) {
            texto += `, com `;
            for (const [chave, indice] of Object.entries(dicionario.chaves)) {
                texto += `chave ${chave} definida com o valor ${dicionario.valores[0]}`;
            }
        } else {
            texto += ' vazio';
        }

        return texto;
    }

    traduzirFuncaoConstruto(funcaoConstruto: FuncaoConstruto): VerticeFluxograma[] {
        let vertices: VerticeFluxograma[] = [];
        let arestas: ArestaFluxograma[] = [];

        if (funcaoConstruto.corpo && funcaoConstruto.corpo.length > 0) {
            for (const declaracaoCorpo of funcaoConstruto.corpo) {
                // Usa o mesmo caminho de outras declarações,
                // então todas as arestas passam por logicaComumConexaoArestas.
                const verticesCorpo = this.dicionarioDeclaracoes[
                    declaracaoCorpo.constructor.name
                ](declaracaoCorpo);
                vertices = vertices.concat(verticesCorpo);
                arestas = arestas.concat(this.anteriores);
                this.anteriores = [];
            }
        }

        let primeiraAresta: ArestaFluxograma | undefined = undefined;
        if (this.anteriores.length > 0) {
            primeiraAresta = this.anteriores[0];
            const verticesRestantes: VerticeFluxograma[] = this.logicaComumConexaoArestas(primeiraAresta);
            console.log(verticesRestantes);
        }

        return vertices;
    }

    traduzirConstrutoLeia(leia: Leia): string {
        let texto = 'leia da entrada';
        if (leia.argumentos && leia.argumentos.length > 0) {
            const textoArgumento = this.dicionarioConstrutos[leia.argumentos[0].constructor.name](
                leia.argumentos[0]
            );
            texto += `, imprimindo antes: \\'${textoArgumento}\\'`;
        }

        return texto;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        switch (literal.tipo) {
            case 'lógico':
                return literal.valor ? 'verdadeiro' : 'falso';
            case 'texto':
                return `\\'${literal.valor}\\'`;
            default:
                return String(literal.valor);
        }
    }

    traduzirConstrutoSeparador(separador: Separador): string {
        return `${separador.conteudo} `;
    }

    traduzirConstrutoUnario(unario: Unario): string {
        const textoOperando = this.dicionarioConstrutos[unario.operando.constructor.name](
            unario.operando
        );
        let textoOperador = '';
        switch (unario.operador.tipo) {
            case tiposDeSimbolos.INCREMENTAR:
                textoOperador = `incrementar ${textoOperando} em 1`;
                break;
            case tiposDeSimbolos.DECREMENTAR:
                textoOperador = `decrementar ${textoOperando} de 1`;
                break;
        }

        switch (unario.incidenciaOperador) {
            case 'ANTES':
                return `${textoOperador}, devolver valor de ${textoOperando}`;
            case 'DEPOIS':
                return `devolver valor de ${textoOperando}, ${textoOperador}`;
        }
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        let texto = `vetor: `;
        for (const elemento of vetor.valores) {
            texto += this.dicionarioConstrutos[elemento.constructor.name](elemento);
        }

        return texto;
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

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco) {
        let vertices: VerticeFluxograma[] = [];
        for (const declaracao of declaracaoBloco.declaracoes) {
            const verticesDeclaracao =
                this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
            vertices = vertices.concat(verticesDeclaracao);
        }

        return vertices;
    }

    traduzirDeclaracaoClasse(declaracaoClasse: Classe): VerticeFluxograma[] {
        const nomeClasse = declaracaoClasse.simbolo.lexema;
        const superClasse = declaracaoClasse.superClasse 
            ? declaracaoClasse.superClasse.nome.lexema 
            : undefined;

        // Cria o diagrama de classe
        const diagramaClasse = new DiagramaClasse(nomeClasse, superClasse);

        // Adiciona métodos ao diagrama
        if (declaracaoClasse.metodos && declaracaoClasse.metodos.length > 0) {
            for (const metodo of declaracaoClasse.metodos) {
                const parametros: string[] = [];
                
                if (metodo.funcao.parametros && metodo.funcao.parametros.length > 0) {
                    for (const param of metodo.funcao.parametros) {
                        const nomeParam = param.nome.lexema;
                        const tipoParam = param.tipoDado || 'qualquer';
                        parametros.push(`${nomeParam}: ${tipoParam}`);
                    }
                }

                const tipoRetorno = metodo.funcao.tipo;

                diagramaClasse.metodos.push({
                    nome: metodo.simbolo.lexema,
                    parametros,
                    tipoRetorno
                });
            }
        }

        // Adiciona o diagrama à lista
        this.classes.push(diagramaClasse);

        // No fluxograma principal, apenas mostra a definição da classe
        const texto = `Linha${declaracaoClasse.linha}[Classe ${nomeClasse}${superClasse ? ` herda ${superClasse}` : ''}]`;
        const aresta = new ArestaFluxograma(declaracaoClasse, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return vertices;
    }

    traduzirDeclaracaoConst(declaracaoConst: Const): VerticeFluxograma[] {
        let texto = `Linha${declaracaoConst.linha}(variável: ${declaracaoConst.simbolo.lexema}`;
        texto += this.logicaComumTraducaoVarEConst(declaracaoConst, texto);

        const aresta = new ArestaFluxograma(declaracaoConst, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return vertices;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): VerticeFluxograma[] {
        let texto = `Linha${declaracaoEnquanto.linha}(enquanto `;
        const condicao = this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](
            declaracaoEnquanto.condicao
        );

        texto += condicao + ')';
        const aresta = new ArestaFluxograma(declaracaoEnquanto, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[
            declaracaoEnquanto.corpo.constructor.name
        ](declaracaoEnquanto.corpo);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const verticeLaco = new VerticeFluxograma(ultimaArestaCorpo, aresta);
        vertices.push(verticeLaco);

        return vertices;
    }

    protected logicaComumCaminhoEscolha(
        declaracaoEscolha: Escolha,
        caminhoEscolha: CaminhoEscolha,
        linha: number,
        textoIdentificadorOuLiteral: string,
        caminhoPadrao: boolean
    ): {
        caminho: ArestaFluxograma;
        declaracoesCaminho: VerticeFluxograma[];
    } {
        let textoCaso: string = '';
        if (!caminhoPadrao) {
            textoCaso = `caso ${textoIdentificadorOuLiteral} seja igual a `;
            for (const condicao of caminhoEscolha.condicoes) {
                const textoCondicao =
                    this.dicionarioConstrutos[condicao.constructor.name](condicao);
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
            const verticesDeclaracoes: VerticeFluxograma[] =
                this.dicionarioDeclaracoes[declaracaoCaminho.constructor.name](declaracaoCaminho);
            verticesResolvidos = verticesResolvidos.concat(verticesDeclaracoes);
            this.anteriores.pop();
            this.anteriores.push(verticesDeclaracoes[verticesDeclaracoes.length - 1].destino);
        }

        this.anteriores.pop();

        return {
            caminho: arestaCondicaoCaminho,
            declaracoesCaminho: verticesResolvidos,
        };
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: Escolha): VerticeFluxograma[] {
        let texto = `Linha${declaracaoEscolha.linha}(escolha um caminho pelo valor de `;
        const textoIdentificadorOuLiteral = this.dicionarioConstrutos[
            declaracaoEscolha.identificadorOuLiteral.constructor.name
        ](declaracaoEscolha.identificadorOuLiteral);
        texto += textoIdentificadorOuLiteral + ')';
        const aresta = new ArestaFluxograma(declaracaoEscolha, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        const arestasCaminho: {
            caminho: ArestaFluxograma;
            declaracoesCaminho: VerticeFluxograma[];
        }[] = [];

        for (const caminho of declaracaoEscolha.caminhos) {
            arestasCaminho.push(
                this.logicaComumCaminhoEscolha(
                    declaracaoEscolha,
                    caminho,
                    caminho.condicoes[0].linha,
                    textoIdentificadorOuLiteral,
                    false
                )
            );
        }

        if (declaracaoEscolha.caminhoPadrao) {
            arestasCaminho.push(
                this.logicaComumCaminhoEscolha(
                    declaracaoEscolha,
                    declaracaoEscolha.caminhoPadrao,
                    declaracaoEscolha.caminhoPadrao.declaracoes[0].linha - 1,
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

        return vertices;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): VerticeFluxograma[] {
        let texto = `Linha${declaracaoEscreva.linha}(escreva: `;
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            texto += valor + ', ';
        }

        texto = texto.slice(0, -2);
        texto += ')';
        const aresta = new ArestaFluxograma(declaracaoEscreva, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return vertices;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): VerticeFluxograma[] {
        let texto = `Linha${declaracaoExpressao.linha}(`;
        const textoConstruto = this.dicionarioConstrutos[
            declaracaoExpressao.expressao.constructor.name
        ](declaracaoExpressao.expressao);
        texto += textoConstruto + ')';

        const aresta = new ArestaFluxograma(declaracaoExpressao, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return vertices;
    }

    traduzirDeclaracaoFazerEnquanto(declaracaoFazerEnquanto: Fazer) {
        const texto = `Linha${declaracaoFazerEnquanto.linha}(fazer)`;
        const aresta = new ArestaFluxograma(declaracaoFazerEnquanto, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[
            declaracaoFazerEnquanto.caminhoFazer.constructor.name
        ](declaracaoFazerEnquanto.caminhoFazer);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const condicao: string = this.dicionarioConstrutos[
            declaracaoFazerEnquanto.condicaoEnquanto.constructor.name
        ](declaracaoFazerEnquanto.condicaoEnquanto);
        let textoEnquanto = `Linha${declaracaoFazerEnquanto.condicaoEnquanto.linha}(enquanto ${condicao})`;

        const arestaEnquanto = new ArestaFluxograma(declaracaoFazerEnquanto, textoEnquanto);
        const verticeEnquanto = new VerticeFluxograma(ultimaArestaCorpo, arestaEnquanto);
        vertices.push(verticeEnquanto);

        const verticeCondicaoComFazer = new VerticeFluxograma(arestaEnquanto, aresta);
        vertices.push(verticeCondicaoComFazer);

        this.anteriores.pop();
        this.anteriores.push(arestaEnquanto);
        return vertices;
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): VerticeFluxograma[] {
        // Gera o corpo como vértices, mas não conecta nada ao fluxo principal
        const verticesCorpo = this.traduzirFuncaoConstruto(declaracaoFuncao.funcao);

        if (verticesCorpo.length === 0) {
            return [];
        }

        // Descobre o texto dos nós do corpo
        /* let textoSubgrafo = `subgraph função ${declaracaoFuncao.simbolo.lexema}\n`;
        for (const vertice of verticesCorpo) {
            textoSubgrafo += vertice.paraTexto();
        }
        textoSubgrafo += `end;\n`; */

        // Armazena o subgraph para imprimir depois de graph TD;
        // this.subgrafosFuncoes.push(textoSubgrafo);

        // IMPORTANTE: não altera this.anteriores aqui, para a função
        // não entrar no fluxo principal. O fluxo principal continua
        // sendo só as declarações "top-level" (como a chamada em Linha4).

        // Também não precisa devolver vértices, porque eles já
        // foram adicionados em this.vertices pelos próprios tradutores
        // das declarações do corpo (via dicionarioDeclaracoes).
        return [];
    }

    traduzirDeclaracaoPara(declaracaoPara: Para): VerticeFluxograma[] {
        let texto = `Linha${declaracaoPara.linha}(para `;
        if (declaracaoPara.inicializador) {
            for (const declaracaoInicializadora of declaracaoPara.inicializador as Declaracao[]) {
                // Normalmente é `Var`.
                const declaracaoVar = declaracaoInicializadora as Var;
                const valorInicializacao = this.dicionarioConstrutos[
                    declaracaoVar.inicializador.constructor.name
                ](declaracaoVar.inicializador);
                texto += `uma variável ${declaracaoVar.simbolo.lexema} inicializada com ${valorInicializacao}, `;
            }

            texto = texto.slice(0, -2);
        }

        texto += ')';
        const aresta = new ArestaFluxograma(declaracaoPara, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Condição
        const textoCondicao = this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](
            declaracaoPara.condicao
        );
        const textoArestaCondicao = `Linha${declaracaoPara.linha}Condicao{se ${textoCondicao}}`;
        const arestaCondicao = new ArestaFluxograma(declaracaoPara, textoArestaCondicao);
        vertices = vertices.concat(this.logicaComumConexaoArestas(arestaCondicao));

        this.anteriores.push(arestaCondicao);
        this.ultimaDicaVertice = 'Sim';

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[
            declaracaoPara.corpo.constructor.name
        ](declaracaoPara.corpo);
        vertices = vertices.concat(verticesCorpo);

        // Incremento
        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const textoIncremento = this.dicionarioConstrutos[
            declaracaoPara.incrementar.constructor.name
        ](declaracaoPara.incrementar);
        const arestaIncremento = new ArestaFluxograma(
            declaracaoPara,
            `Linha${declaracaoPara.linha}Incremento(${textoIncremento})`
        );
        const verticeIncremento = new VerticeFluxograma(ultimaArestaCorpo, arestaIncremento);
        vertices.push(verticeIncremento);

        const verticeLaco = new VerticeFluxograma(arestaIncremento, arestaCondicao);
        vertices.push(verticeLaco);

        // Configura a condição como anterior
        this.anteriores.pop();
        this.anteriores.push(arestaCondicao);
        this.ultimaDicaVertice = 'Não';
        return vertices;
    }

    traduzirDeclaracaoParaCada(declaracaoParaCada: ParaCada): VerticeFluxograma[] {
        const textoVariavelIteracao = this.dicionarioConstrutos[
            declaracaoParaCada.variavelIteracao.constructor.name
        ](declaracaoParaCada.variavelIteracao);
        let texto = `Linha${declaracaoParaCada.linha}(para cada ${textoVariavelIteracao} em `;
        const textoVariavelIterada = this.dicionarioConstrutos[
            declaracaoParaCada.vetorOuDicionario.constructor.name
        ](declaracaoParaCada.vetorOuDicionario);
        texto += textoVariavelIterada + ')';
        const aresta = new ArestaFluxograma(declaracaoParaCada, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[
            declaracaoParaCada.corpo.constructor.name
        ](declaracaoParaCada.corpo);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        vertices.push(new VerticeFluxograma(ultimaArestaCorpo, aresta));

        return vertices;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): VerticeFluxograma[] {
        let texto = `Linha${declaracaoSe.linha}{se `;
        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](
            declaracaoSe.condicao
        );
        texto += condicao;
        texto += `}`;

        const aresta = new ArestaFluxograma(declaracaoSe, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        this.ultimaDicaVertice = 'Sim';

        // Caminho então, normalmente um `Bloco`.
        const verticesEntao: VerticeFluxograma[] = this.dicionarioDeclaracoes[
            declaracaoSe.caminhoEntao.constructor.name
        ](declaracaoSe.caminhoEntao);
        vertices = vertices.concat(verticesEntao);

        const ultimaArestaEntao = verticesEntao[verticesEntao.length - 1].destino;

        if (declaracaoSe.caminhoSenao) {
            this.anteriores = [];
            const arestaSenao = new ArestaFluxograma(
                declaracaoSe,
                `Linha${declaracaoSe.caminhoSenao.linha}(senão)`
            );
            vertices.push(new VerticeFluxograma(aresta, arestaSenao, 'Não'));
            this.anteriores.push(arestaSenao);

            const verticesSenao: VerticeFluxograma[] = this.dicionarioDeclaracoes[
                declaracaoSe.caminhoSenao.constructor.name
            ](declaracaoSe.caminhoSenao);
            vertices = vertices.concat(verticesSenao);
        }

        this.anteriores.push(ultimaArestaEntao);
        return vertices;
    }

    protected logicaComumTraducaoVarEConst(
        declaracaoVarOuConst: Var | Const,
        textoInicial: string
    ): string {
        if (declaracaoVarOuConst.inicializador) {
            textoInicial += `, iniciada com: ${this.dicionarioConstrutos[declaracaoVarOuConst.inicializador.constructor.name](declaracaoVarOuConst.inicializador)}`;
        }

        textoInicial += ')';
        return textoInicial;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): VerticeFluxograma[] {
        let texto = `Linha${declaracaoVar.linha}(variável: ${declaracaoVar.simbolo.lexema}`;
        texto += this.logicaComumTraducaoVarEConst(declaracaoVar, texto);

        const aresta = new ArestaFluxograma(declaracaoVar, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return vertices;
    }

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirConstrutoAcessoIndiceVariavel.bind(this),
        AcessoMetodo: this.traduzirConstrutoAcessoMetodo.bind(this),
        AcessoMetodoOuPropriedade: this.traduzirConstrutoAcessoMetodoOuPropriedade.bind(this),
        AcessoPropriedade: this.traduzirConstrutoAcessoPropriedade.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        ComentarioComoConstruto: () => '',
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        Dicionario: this.traduzirConstrutoDicionario.bind(this),
        // FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        FuncaoConstruto: () => { throw new Error("Fluxogramas de funções ainda não é suportado.") },
        Isto: () => 'this',
        Leia: this.traduzirConstrutoLeia.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Separador: this.traduzirConstrutoSeparador.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        // Classe: this.traduzirDeclaracaoClasse.bind(this),
        Classe: () => { throw new Error("Fluxogramas de classes ainda não é suportado.") },
        Comentario: () => '',
        Const: this.traduzirDeclaracaoConst.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Fazer: this.traduzirDeclaracaoFazerEnquanto.bind(this),
        // FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        FuncaoDeclaracao: () => { throw new Error("Fluxogramas de funções ainda não é suportado.") },
        Para: this.traduzirDeclaracaoPara.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    /**
     * Ponto de entrada para a tradução de declarações em um fluxograma
     * no formato MermaidJs.
     * @param {Declaracao[]} declaracoes As declarações a serem traduzidas.
     * @returns {string} Texto no formato MermaidJs representando o fluxograma.
     */
    traduzir(declaracoes: Declaracao[]): string {
        this.anteriores = [];
        this.vertices = [];
        let resultado = 'graph TD;\n';
        this.indentacaoAtual = 4;
        this.subgrafosFuncoes = {};

        for (const declaracao of declaracoes) {
            this.vertices = this.vertices.concat(
                this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)
            );
        }

        if (Object.keys(this.subgrafosFuncoes).length > 0) {
            for (const subgrafo of Object.values(this.subgrafosFuncoes)) {
                resultado += subgrafo;
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
