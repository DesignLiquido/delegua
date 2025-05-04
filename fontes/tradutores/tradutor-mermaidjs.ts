import { Agrupamento, Atribuir, Binario, Literal, Unario, Variavel, Vetor } from '../construtos';
import { Bloco, Declaracao, Enquanto, Escreva, Expressao, Fazer, Para, ParaCada, Se, Var } from '../declaracoes';
import { TradutorInterface } from '../interfaces';

import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

class ArestaFluxograma {
    declaracao: Declaracao;
    texto: string;

    constructor(declaracao: Declaracao, texto: string) {
        this.declaracao = declaracao;
        this.texto = texto;
    }
}

class VerticeFluxograma {
    origem: ArestaFluxograma;
    destino: ArestaFluxograma;
    texto?: string;

    constructor(origem: ArestaFluxograma, destino: ArestaFluxograma, texto?: string) {
        this.origem = origem;
        this.destino = destino;
        this.texto = texto;
    }

    paraTexto(): string {
        const seta = this.texto ? `-->|${this.texto}|` : '-->';
        return `    ${this.origem.texto}${seta}${this.destino.texto};\n`;
    }
}

/**
 * [MermaidJs](https://mermaid.js.org/) é uma especificação que nos permite 
 * criar fluxogramas através de uma notação por texto.
 * 
 * Este tradutor converte estruturas da avaliação sintática em um fluxograma
 * compatível com o MermaidJs.
 * 
 * Diferenteente de outros tradutores, este não trabalha diretamente com `string`s. 
 * Construtos sim devolvem `string`s, mas declarações devolvem um vetor de 
 * `VerticeFluxograma`. 
 */
export class TradutorMermaidJs implements TradutorInterface<Declaracao> {
    anteriores: ArestaFluxograma[];
    vertices: VerticeFluxograma[];
    ultimaDicaVertice: string | undefined;

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.expressao.constructor.name](agrupamento.expressao);
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        const textoAlvo = this.dicionarioConstrutos[atribuir.alvo.constructor.name](atribuir.alvo);
        const textoValor = this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        return `${textoAlvo} recebe: ${textoValor}`;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        const operandoEsquerdo: string = this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda);
        const operandoDireito: string = this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);
        switch (binario.operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return `somar ${operandoEsquerdo} e ${operandoDireito}`;
            case tiposDeSimbolos.MENOR:
                return `${operandoEsquerdo} for menor que ${operandoDireito}`;
        }
        
        return "";
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        switch (literal.tipo) {
            case 'lógico':
                return literal.valor ? 'verdadeiro' : 'falso';
            case 'texto':
                return `\\'${literal.valor}\\'`;
            default:
                return literal.valor;
        }
    }

    traduzirConstrutoUnario(unario: Unario): string {
        const textoOperando = this.dicionarioConstrutos[unario.operando.constructor.name](unario.operando);
        let textoOperador = "";
        switch (unario.operador.tipo) {
            case tiposDeSimbolos.INCREMENTAR:
                textoOperador = `incrementar ${textoOperando} em 1`;
                break;
            case tiposDeSimbolos.DECREMENTAR:
                textoOperador = `decrementar ${textoOperando} de 1`;
                break;
        }

        switch (unario.incidenciaOperador) {
            case "ANTES":
                return `${textoOperador}, devolver valor de ${textoOperando}`;
            case "DEPOIS":
                return `devolver valor de ${textoOperando}, ${textoOperador}`;
        }
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        let texto = `vetor: `;
        for (const elemento of vetor.valores) {
            // Na grande maioria dos casos, cada elemento é um construto.
            const textoValor = this.dicionarioConstrutos[elemento.constructor.name](elemento);
            texto += `${textoValor}, `;
        }

        texto = texto.slice(0, -2);
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
            const verticesDeclaracao = this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao);
            vertices = vertices.concat(verticesDeclaracao);
        }

        return vertices;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): VerticeFluxograma[] {
        let texto = `Linha${declaracaoEnquanto.linha}(enquanto `;
        const condicao = this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](declaracaoEnquanto.condicao);

        texto += condicao + ')';
        const aresta = new ArestaFluxograma(declaracaoEnquanto, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](declaracaoEnquanto.corpo);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const verticeLaco = new VerticeFluxograma(ultimaArestaCorpo, aresta);
        vertices.push(verticeLaco);

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
        const textoConstruto = this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
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
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[declaracaoFazerEnquanto.caminhoFazer.constructor.name](declaracaoFazerEnquanto.caminhoFazer);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const condicao: string = this.dicionarioConstrutos[declaracaoFazerEnquanto.condicaoEnquanto.constructor.name](declaracaoFazerEnquanto.condicaoEnquanto);
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

    traduzirDeclaracaoPara(declaracaoPara: Para): VerticeFluxograma[] {
        let texto = `Linha${declaracaoPara.linha}(para `;
        if (declaracaoPara.inicializador) {
            for (const declaracaoInicializadora of declaracaoPara.inicializador as Declaracao[]) {
                // Normalmente é `Var`.
                const declaracaoVar = declaracaoInicializadora as Var;
                const valorInicializacao = this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](declaracaoVar.inicializador);
                texto += `uma variável ${declaracaoVar.simbolo.lexema} inicializada com ${valorInicializacao}, `;
            }

            texto = texto.slice(0, -2);
        }

        texto += ')';
        const aresta = new ArestaFluxograma(declaracaoPara, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Condição
        const textoCondicao = this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](declaracaoPara.condicao);
        const textoArestaCondicao = `Linha${declaracaoPara.linha}Condicao{se ${textoCondicao}}`;
        const arestaCondicao = new ArestaFluxograma(declaracaoPara, textoArestaCondicao);
        vertices = vertices.concat(this.logicaComumConexaoArestas(arestaCondicao));

        this.anteriores.push(arestaCondicao);
        this.ultimaDicaVertice = 'Sim';

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](declaracaoPara.corpo);
        vertices = vertices.concat(verticesCorpo);

        // Incremento
        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        const textoIncremento = this.dicionarioConstrutos[declaracaoPara.incrementar.constructor.name](declaracaoPara.incrementar);
        const arestaIncremento = new ArestaFluxograma(declaracaoPara, `Linha${declaracaoPara.linha}Incremento(${textoIncremento})`);
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
        let texto = `Linha${declaracaoParaCada.linha}(para cada ${declaracaoParaCada.nomeVariavelIteracao} em `;
        const textoVariavelIterada = this.dicionarioConstrutos[declaracaoParaCada.vetor.constructor.name](declaracaoParaCada.vetor);
        texto += textoVariavelIterada + ')';
        const aresta = new ArestaFluxograma(declaracaoParaCada, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);

        // Corpo, normalmente um `Bloco`.
        const verticesCorpo: VerticeFluxograma[] = this.dicionarioDeclaracoes[declaracaoParaCada.corpo.constructor.name](declaracaoParaCada.corpo);
        vertices = vertices.concat(verticesCorpo);

        const ultimaArestaCorpo = verticesCorpo[verticesCorpo.length - 1].destino;
        vertices.push(new VerticeFluxograma(ultimaArestaCorpo, aresta));

        return vertices;
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): VerticeFluxograma[] {
        let texto = `Linha${declaracaoSe.linha}{se `;
        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](declaracaoSe.condicao);
        texto += condicao;
        texto += `}`;

        const aresta = new ArestaFluxograma(declaracaoSe, texto);
        let vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        this.ultimaDicaVertice = 'Sim';

        // Caminho então, normalmente um `Bloco`.
        const verticesEntao: VerticeFluxograma[] = this.dicionarioDeclaracoes[declaracaoSe.caminhoEntao.constructor.name](declaracaoSe.caminhoEntao);
        vertices = vertices.concat(verticesEntao);

        const ultimaArestaEntao = verticesEntao[verticesEntao.length - 1].destino;

        if (declaracaoSe.caminhoSenao) {
            this.anteriores = [];
            const arestaSenao = new ArestaFluxograma(declaracaoSe, `Linha${declaracaoSe.caminhoSenao.linha}(senão)`);
            vertices.push(new VerticeFluxograma(aresta, arestaSenao, 'Não'));
            this.anteriores.push(arestaSenao);

            const verticesSenao: VerticeFluxograma[] = this.dicionarioDeclaracoes[declaracaoSe.caminhoSenao.constructor.name](declaracaoSe.caminhoSenao);
            vertices = vertices.concat(verticesSenao); 
        }

        this.anteriores.push(ultimaArestaEntao);
        return vertices;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): VerticeFluxograma[] {
        let texto = `Linha${declaracaoVar.linha}(variável: ${declaracaoVar.simbolo.lexema}`;
        if (declaracaoVar.inicializador) {
            texto += `, iniciada com: ${this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](declaracaoVar.inicializador)}`;
        }

        texto += ')';
        const aresta = new ArestaFluxograma(declaracaoVar, texto);
        const vertices: VerticeFluxograma[] = this.logicaComumConexaoArestas(aresta);

        this.anteriores.push(aresta);
        return vertices;
    }

    dicionarioConstrutos = {
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this)
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Fazer: this.traduzirDeclaracaoFazerEnquanto.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this)
    };

    traduzir(declaracoes: Declaracao[]): string {
        this.anteriores = [];
        this.vertices = [];
        let resultado = 'graph TD;\n';

        for (const declaracao of declaracoes) {
            this.vertices = this.vertices.concat(this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao));
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
