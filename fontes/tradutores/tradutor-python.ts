import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    AcessoPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Comentario,
    Construto,
    DefinirValor,
    Dicionario,
    Isto,
    Literal,
    Logico,
    ReferenciaFuncao,
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
    Escreva,
    Expressao,
    FuncaoDeclaracao,
    Leia,
    Para,
    ParaCada,
    Retorna,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { SimboloInterface, TradutorInterface } from '../interfaces';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

export class TradutorPython implements TradutorInterface<Declaracao> {
    indentacao: number = 0;
    classesConhecidas: string[] = [];

    protected traduzirSimboloOperador(operador: SimboloInterface): string {
        switch (operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.BIT_AND:
                return '&';
            case tiposDeSimbolos.BIT_OR:
                return '|';
            case tiposDeSimbolos.BIT_XOR:
                return '^';
            case tiposDeSimbolos.BIT_NOT:
                return '~';
            case tiposDeSimbolos.DIFERENTE:
                return '!=';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.E:
                return 'and';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '**';
            case tiposDeSimbolos.IGUAL:
                return '=';
            case tiposDeSimbolos.IGUAL_IGUAL:
                return '==';
            case tiposDeSimbolos.MAIOR:
                return '>';
            case tiposDeSimbolos.MAIOR_IGUAL:
                return '>=';
            case tiposDeSimbolos.MENOR:
                return '<';
            case tiposDeSimbolos.MENOR_IGUAL:
                return '<=';
            case tiposDeSimbolos.MODULO:
                return '%';
            case tiposDeSimbolos.MULTIPLICACAO:
                return '*';
            case tiposDeSimbolos.OU:
                return 'or';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
        }
    }

    protected traduzirFuncaoOuMetodo(nomeMetodo: string, objetoResolvido: string, argumentos: Construto[]): string {
        const argumentosResolvidos: string[] = [];
        for (const argumento of argumentos) {
            const argumentoResolvido = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce((atual, proximo) => atual += proximo + ', ', "");
        textoArgumentos = textoArgumentos.slice(0, -2);

        switch (nomeMetodo) {
            case 'adicionar':
            case 'empilhar':        
                return `${objetoResolvido}.append(${textoArgumentos})`;
            case 'fatiar':
                return `${objetoResolvido}[${argumentos[0]}:${argumentos[1]}]`;
            case 'inclui':
                return `${argumentosResolvidos[0]} in ${objetoResolvido}`;
            case 'inverter':
                return `reversed(${objetoResolvido})`;
            case 'juntar':
                return `${argumentosResolvidos[0]}.join(${objetoResolvido})`;
            case 'maiusculo':
                return `${objetoResolvido}.upper()`;
            case 'mapear':
                return `list(map(${this.traduzirFuncaoAnonimaParaLambda(argumentos[0])}), ${objetoResolvido})`;
            case 'minusculo':
                return `${objetoResolvido}.lower()`;
            case 'ordenar':
                return `${objetoResolvido}.sort()`;
            case 'remover':
                return `del ${objetoResolvido}[${argumentosResolvidos[0]}]`;
            case 'removerPrimeiro':
                return `${objetoResolvido}.pop(0)`;
            case 'removerUltimo':
                return `${objetoResolvido}.pop()`;
            case 'somar':
                return `sum(${objetoResolvido})`;
            case 'tamanho':
                return `len(${objetoResolvido})`;
        }

        return `${objetoResolvido}.${nomeMetodo}(${textoArgumentos}))`;
    }

    protected logicaComumBlocoEscopo(declaracoes: Declaracao[]): string {
        let resultado = '';
        this.indentacao += 4;

        if (typeof declaracoes[Symbol.iterator] === 'function') {
            for (const declaracaoOuConstruto of declaracoes) {
                resultado += ' '.repeat(this.indentacao);
                const nomeConstrutor = declaracaoOuConstruto.constructor.name;
                if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
                    resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoOuConstruto);
                } else {
                    resultado += this.dicionarioDeclaracoes[nomeConstrutor](declaracaoOuConstruto);
                }

                resultado += '\n';
            }
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '\n';
        return resultado;
    }

    traduzirConstrutoAcessoIndiceVariavel(acessoIndiceVariavel: AcessoIndiceVariavel): string {
        const entidade = this.dicionarioConstrutos[acessoIndiceVariavel.entidadeChamada.constructor.name](
            acessoIndiceVariavel.entidadeChamada
        );
        const indice = this.dicionarioConstrutos[acessoIndiceVariavel.indice.constructor.name](
            acessoIndiceVariavel.indice
        );
        return `${entidade}[${indice}]`;
    }

    // TODO: Talvez terminar (ou remover, sei lá).
    traduzirFuncaoAnonimaParaLambda(argumento: Construto): string {
        return "";
    }

    traduzirAcessoMetodoVetor(objeto: Construto, nomeMetodo: string, argumentos: Construto[]): string {
        const objetoResolvido = this.dicionarioConstrutos[objeto.constructor.name](objeto);

        const argumentosResolvidos: string[] = [];
        for (const argumento of argumentos) {
            const argumentoResolvido = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        switch (nomeMetodo) {
            case 'adicionar':
            case 'empilhar':
                let textoArgumentos = argumentosResolvidos.reduce((atual, proximo) => atual += proximo + ', ', "");
                textoArgumentos = textoArgumentos.slice(0, -2);
                return `${objetoResolvido}.append(${textoArgumentos})`;
            case 'fatiar':
                return `${objetoResolvido}[${argumentos[0]}:${argumentos[1]}]`;
            case 'inclui':
                return `${argumentos[0]} in ${objetoResolvido}`;
            case 'inverter':
                return `reversed(${objetoResolvido})`;
            case 'juntar':
                return `${argumentos[0]}.join(${objetoResolvido})`;
            case 'mapear':
                return `list(map(${this.traduzirFuncaoAnonimaParaLambda(argumentos[0])}), ${objetoResolvido})`;
            case 'ordenar':
                return `${objetoResolvido}.sort()`;
            case 'remover':
                return `del ${objetoResolvido}[${argumentos[0]}]`;
            case 'removerPrimeiro':
                return `del ${objetoResolvido}[0]`;
            case 'removerUltimo':
                return `del ${objetoResolvido}[-1]`;
            case 'somar':
                return `sum(${objetoResolvido})`;
            case 'tamanho':
                return `len(${objetoResolvido})`;
        }
    }

    traduzirConstrutoAcessoMetodo(acessoMetodo: AcessoMetodo, argumentos: Construto[]): string {
        switch (acessoMetodo.objeto.constructor.name) {
            case 'Isto':
                return `self.${acessoMetodo.nomeMetodo}`;
            case 'Variavel':
                let objetoVariavel = acessoMetodo.objeto as Variavel;
                return this.traduzirFuncaoOuMetodo(acessoMetodo.nomeMetodo, objetoVariavel.simbolo.lexema, argumentos);
            case 'Vetor':
                return this.traduzirAcessoMetodoVetor(acessoMetodo.objeto, acessoMetodo.nomeMetodo, argumentos);
            default:
                const objetoResolvido = this.dicionarioConstrutos[acessoMetodo.objeto.constructor.name](acessoMetodo.objeto);
                return `${objetoResolvido}.${acessoMetodo.nomeMetodo}`;
        }
    }

    traduzirConstrutoAcessoMetodoOuPropriedade(acessoMetodo: AcessoMetodoOuPropriedade, argumentos: Construto[]): string {
        if (acessoMetodo.objeto instanceof Variavel) {
            let objetoVariavel = acessoMetodo.objeto as Variavel;
            return this.traduzirFuncaoOuMetodo(acessoMetodo.simbolo.lexema, objetoVariavel.simbolo.lexema, argumentos);
        }

        return `self.${acessoMetodo.simbolo.lexema}`;
    }

    traduzirConstrutoAcessoPropriedade(acessoPropriedade: AcessoPropriedade, argumentos: Construto[]): string {
        if (acessoPropriedade.objeto instanceof Variavel) {
            let objetoVariavel = acessoPropriedade.objeto as Variavel;
            return this.traduzirFuncaoOuMetodo(objetoVariavel.simbolo.lexema, acessoPropriedade.nomePropriedade, argumentos);
        }

        return `self.${acessoPropriedade.nomePropriedade}`;
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.constructor.name](agrupamento.expressao || agrupamento);
    }

    traduzirConstrutoArgumentoReferenciaFuncao(
        argumentoReferenciaFuncao: ArgumentoReferenciaFuncao,
        argumentos: Construto[]
    ): string {
        const argumentosResolvidos: string[] = [];
        const argumentosValidados = argumentos || [];
        for (const argumento of argumentosValidados) {
            const argumentoResolvido = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce((atual, proximo) => atual += proximo + ', ', "");
        textoArgumentos = textoArgumentos.slice(0, -2);

        return `${argumentoReferenciaFuncao.simboloFuncao.lexema}(${textoArgumentos})`;
    }

    traduzirConstrutoAtribuicaoPorIndice(atribuicaoPorIndice: AtribuicaoPorIndice): string {
        const objeto = this.dicionarioConstrutos[atribuicaoPorIndice.objeto.constructor.name](
            atribuicaoPorIndice.objeto
        );
        const indice = this.dicionarioConstrutos[atribuicaoPorIndice.indice.constructor.name](
            atribuicaoPorIndice.indice
        );
        const valor = this.dicionarioConstrutos[atribuicaoPorIndice.valor.constructor.name](atribuicaoPorIndice.valor);
        return `${objeto}[${indice}] = ${valor}`;
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        let resultado = this.dicionarioConstrutos[atribuir.alvo.constructor.name](atribuir.alvo);
        const operador = atribuir.simboloOperador?.lexema || '=';

        // Em Delégua, atribuições com operações embutidas devolvem um construto `Binario` no valor
        // por várias razões, sendo a mais importante delas a lógica de interpretação.
        let valorResolvido = '';
        if (atribuir.simboloOperador && atribuir.valor.constructor.name === 'Binario') {
            valorResolvido = this.dicionarioConstrutos[atribuir.valor.direita.constructor.name](atribuir.valor.direita);
        } else {
            valorResolvido = this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        }

        resultado += ` ${operador} ` + valorResolvido;
        return resultado;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        let resultado = '';
        const valorEsquerdo = this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda)
        if (binario.esquerda.constructor.name === 'Agrupamento')
            resultado += '(' + valorEsquerdo + ')';
        else 
            resultado += valorEsquerdo;

        let operador = this.traduzirSimboloOperador(binario.operador);
        resultado += ` ${operador} `;

        const valorDireito = this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);
        if (binario.direita.constructor.name === 'Agrupamento')
            resultado += '(' + valorDireito + ')';
        else 
            resultado += valorDireito;

        return resultado;
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        return `${this.dicionarioConstrutos[chamada.entidadeChamada.constructor.name](
            chamada.entidadeChamada, chamada.argumentos
        )}`;
    }

    traduzirConstrutoComentario(comentario: Comentario): string {
        let resultado = '';
        if (comentario.multilinha) {
            resultado += `'''`;
            for (let linhaComentario of comentario.conteudo as string[]) {
                resultado += `${linhaComentario}\n`;
            }
            resultado += `'''`;
        } else {
            resultado += `# ${comentario.conteudo as string}`;
        }

        return resultado;
    }

    traduzirConstrutoDefinirValor(definirValor: DefinirValor): string {
        let resultado = '';
        if (definirValor.objeto instanceof Isto) {
            resultado = 'self.' + definirValor.nome.lexema + ' = ';
        }

        resultado += definirValor.valor.simbolo.lexema;
        return resultado;
    }

    traduzirConstrutoDicionario(dicionario: Dicionario): string {
        let resultado = `{${dicionario.chaves.length > 0 ? '\n' : ''}`;
        for (let indice = 0; indice < dicionario.chaves.length; indice++) {
            resultado += ' '.repeat(this.indentacao + 4);
            const chave = dicionario.chaves[indice];
            resultado += `${this.dicionarioConstrutos[chave.constructor.name](chave)}: `;
            const valor = dicionario.valores[indice];
            resultado += `${this.dicionarioConstrutos[valor.constructor.name](valor)},\n`;
        }

        resultado += '}';
        return resultado;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `'${literal.valor}'`;
        if (typeof literal.valor === 'boolean') {
            return literal.valor ? 'True' : 'False';
        }
        if (typeof literal.valor === 'number') {
            return String(literal.valor);
        }
        if (!literal.valor) return 'None';
        return literal.valor;
    }

    traduzirConstrutoLogico(logico: Logico): string {
        const direita = this.dicionarioConstrutos[logico.direita.constructor.name](logico.direita);
        const operador = this.traduzirSimboloOperador(logico.operador);
        const esquerda = this.dicionarioConstrutos[logico.esquerda.constructor.name](logico.esquerda);

        return `${esquerda} ${operador} ${direita}`;
    }

    traduzirConstrutoReferenciaFuncao(
        referenciaFuncao: ReferenciaFuncao,
        argumentos: Construto[]
    ): string {
        const argumentosResolvidos: string[] = [];
        const argumentosValidados = argumentos || [];
        for (const argumento of argumentosValidados) {
            const argumentoResolvido = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce((atual, proximo) => atual += proximo + ', ', "");
        textoArgumentos = textoArgumentos.slice(0, -2);

        return `${referenciaFuncao.simboloFuncao.lexema}(${textoArgumentos})`;
    }

    traduzirConstrutoUnario(unario: Unario) {
        const operador = this.traduzirSimboloOperador(unario.operador);
        const operando = this.dicionarioConstrutos[unario.operando.constructor.name](unario.operando);
        switch (unario.incidenciaOperador) {
            case 'ANTES':
                return `${operador}${operando}`;
            case 'DEPOIS':
                return `${operando}${operador}`;
        }
    }

    traduzirConstrutoVariavel(variavel: Variavel, argumentos: Construto[]): string {
        const argumentosResolvidos: string[] = [];
        const argumentosValidados = argumentos || [];
        for (const argumento of argumentosValidados) {
            const argumentoResolvido = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce((atual, proximo) => atual += proximo + ', ', "");
        textoArgumentos = textoArgumentos.slice(0, -2);

        switch (variavel.simbolo.lexema) {
            case 'texto':
                return `str(${textoArgumentos})`;
            default:
                if (argumentosValidados.length === 0 && !this.classesConhecidas.includes(variavel.simbolo.lexema)) {
                    return `${variavel.simbolo.lexema}`;
                }

                return `${variavel.simbolo.lexema}(${textoArgumentos})`;
        }
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        if (!vetor.valores.length) {
            return '[]';
        }

        let resultado = '[';

        for (let valor of vetor.valores) {
            resultado += `${this.dicionarioConstrutos[valor.constructor.name](valor)}, `;
        }
        if (vetor.valores.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ']';

        return resultado;
    }

    protected logicaTraducaoMetodoClasse(metodoClasse: FuncaoDeclaracao): string {
        this.indentacao += 4;
        let resultado = ' '.repeat(this.indentacao);
        let temContrutor = metodoClasse.simbolo.lexema === 'construtor';
        resultado += temContrutor ? 'def __init__(' : 'def ' + metodoClasse.simbolo.lexema + '(';

        let temParametros = metodoClasse.funcao.parametros.length;
        resultado += temParametros ? 'self, ' : 'self';

        for (let parametro of metodoClasse.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }
        if (metodoClasse.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += '):\n';
        if (metodoClasse.funcao.corpo.length === 0) {
            resultado += ' '.repeat(this.indentacao + 4);
            resultado += 'pass\n';
            this.indentacao -= 4;
            return resultado;
        }

        resultado += this.logicaComumBlocoEscopo(metodoClasse.funcao.corpo);
        resultado += ' '.repeat(this.indentacao) + '\n';
        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco): string {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes);
    }

    traduzirDeclaracaoClasse(declaracaoClasse: Classe): string {
        let resultado = 'class ';

        if (declaracaoClasse.superClasse)
            resultado += `${declaracaoClasse.simbolo.lexema}(${declaracaoClasse.superClasse.simbolo.lexema}):\n`;
        else resultado += declaracaoClasse.simbolo.lexema + ':\n';
        
        if (declaracaoClasse.metodos.length === 0) { 
            this.classesConhecidas.push(declaracaoClasse.simbolo.lexema);
            return (resultado += '    pass\n');
        }

        for (let metodo of declaracaoClasse.metodos) {
            resultado += this.logicaTraducaoMetodoClasse(metodo);
        }
        
        this.classesConhecidas.push(declaracaoClasse.simbolo.lexema);
        return resultado;
    }

    traduzirDeclaracaoConst(declaracaoConst: Const): string {
        let resultado = declaracaoConst.simbolo.lexema + ' = ';
        const inicializador = declaracaoConst.inicializador;
        if (inicializador) {
            if (this.dicionarioConstrutos[inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[declaracaoConst.inicializador.constructor.name](
                    declaracaoConst.inicializador
                );
            } else {
                resultado += this.dicionarioDeclaracoes[declaracaoConst.inicializador.constructor.name](
                    declaracaoConst.inicializador
                );
            }
        } else {
            resultado += 'None';
        }

        return resultado;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): string {
        let resultado = ' '.repeat(this.indentacao) + 'while ';
        const condicao = this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](
            declaracaoEnquanto.condicao
        );
        resultado += condicao + ':\n';
        resultado += this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](declaracaoEnquanto.corpo);
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'print(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](declaracaoExpressao.expressao);
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): string {
        let resultado = 'def ';
        resultado += declaracaoFuncao.simbolo.lexema + '(';

        for (const parametro of declaracaoFuncao.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        if (declaracaoFuncao.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += '):\n';

        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo);
        return resultado;
    }

    traduzirDeclaracaoLeia(declaracaoLeia: Leia) {
        let resultado = 'input(';
        for (const argumento of declaracaoLeia.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';

        return resultado;
    }

    /**
     * Como não existe declaração `para` com variáveis de controle em Python, o
     * que tentamos aqui é criar a mesma coisa usando `while()`.
     * @param declaracaoPara A declaração `Para`.
     * @returns Um bloco equivalente ao que seria um bloco `for` com variáveis de controle em Python.
     */
    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        let resultado = '';

        // Em uma declaração `Para` em Delégua, são obrigatórios a condição e o incremento.
        if (declaracaoPara.inicializador) {
            if (Array.isArray(declaracaoPara.inicializador)) {
                for (const declaracaoInicializador of declaracaoPara.inicializador) {
                    resultado +=
                        this.dicionarioDeclaracoes[declaracaoInicializador.constructor.name](declaracaoInicializador) +
                        `\n`;
                }
            } else {
                resultado +=
                    this.dicionarioDeclaracoes[declaracaoPara.inicializador.constructor.name](
                        declaracaoPara.inicializador
                    ) + `\n`;
            }
        }

        const condicao = this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](declaracaoPara.condicao);
        resultado += ' '.repeat(this.indentacao) + `while ${condicao}:\n`;

        // O incremento passa a ser a última instrução do bloco.
        declaracaoPara.corpo.declaracoes.push(new Expressao(declaracaoPara.incrementar));
        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](declaracaoPara.corpo);
        return resultado;
    }

    traduzirDeclaracaoParaCada(declaracaoParaCada: ParaCada): string {
        let resultado = `for ${declaracaoParaCada.nomeVariavelIteracao} in `;
        resultado +=
            this.dicionarioConstrutos[declaracaoParaCada.vetor.constructor.name](declaracaoParaCada.vetor) + ':\n';

        resultado += this.dicionarioDeclaracoes[declaracaoParaCada.corpo.constructor.name](declaracaoParaCada.corpo);
        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracaoRetorna: Retorna): string {
        let resultado = 'return ';
        const nomeConstrutor = declaracaoRetorna.valor.constructor.name;
        return (resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoRetorna?.valor));
    }

    traduzirDeclaracaoSe(declaracaoSe: Se, iniciarComIf: boolean = true): string {
        let resultado = '';
        if (iniciarComIf) {
            resultado += 'if ';
        } else {
            resultado += 'elif ';
        }

        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](declaracaoSe.condicao);
        resultado += condicao;
        resultado += ':\n';
        resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoEntao.constructor.name](declaracaoSe.caminhoEntao);

        if (declaracaoSe.caminhoSenao) {
            resultado += ' '.repeat(this.indentacao);
            const senao = declaracaoSe.caminhoSenao as Se;
            if (senao?.caminhoEntao) {
                resultado += 'elif ';
                resultado += this.dicionarioConstrutos[senao.condicao.constructor.name](senao.condicao, false);
                resultado += ':\n';
                resultado += this.dicionarioDeclaracoes[senao.caminhoEntao.constructor.name](senao.caminhoEntao);
                resultado += ' '.repeat(this.indentacao);

                if (senao?.caminhoSenao) {
                    if (senao.caminhoSenao instanceof Bloco) {
                        resultado += 'else:\n';
                        resultado += this.dicionarioDeclaracoes[senao.caminhoSenao.constructor.name](
                            senao.caminhoSenao,
                            false
                        );
                        return resultado;
                    }

                    resultado += this.dicionarioDeclaracoes[senao.caminhoSenao.constructor.name](
                        senao.caminhoSenao,
                        false
                    );
                    return resultado;
                }
            }

            resultado += 'else:\n';
            resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoSenao.constructor.name](
                declaracaoSe.caminhoSenao
            );
        }

        return resultado;
    }

    traduzirDeclaracaoTente(declaracaoTente: Tente): string {
        let resultado = 'try:\n';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);

        for (let condicao of declaracaoTente.caminhoTente) {
            resultado += this.dicionarioDeclaracoes[condicao.constructor.name](condicao) + '\n';
            resultado += ' '.repeat(this.indentacao);
        }

        if (declaracaoTente.caminhoPegue !== null) {
            resultado += '\nexcept:\n';
            resultado += ' '.repeat(this.indentacao);
            if (Array.isArray(declaracaoTente.caminhoPegue)) {
                for (let declaracao of declaracaoTente.caminhoPegue) {
                    resultado += this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao) + '\n';
                }
            } else {
                for (let corpo of declaracaoTente.caminhoPegue.corpo) {
                    resultado += this.dicionarioDeclaracoes[corpo.constructor.name](corpo) + '\n';
                }
            }

            resultado += ' '.repeat(this.indentacao);
        }
        if (declaracaoTente.caminhoFinalmente !== null) {
            resultado += '\nfinally:\n';
            resultado += ' '.repeat(this.indentacao);
            for (let finalmente of declaracaoTente.caminhoFinalmente) {
                resultado += this.dicionarioDeclaracoes[finalmente.constructor.name](finalmente) + '\n';
            }
        }

        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        let resultado = declaracaoVar.simbolo.lexema + ' = ';
        const inicializador = declaracaoVar.inicializador;
        if (inicializador) {
            if (inicializador.constructor.name in this.dicionarioConstrutos) {
                resultado += this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name](
                    declaracaoVar.inicializador
                );
            } else {
                resultado += this.dicionarioDeclaracoes[declaracaoVar.inicializador.constructor.name](
                    declaracaoVar.inicializador
                );
            }
        } else {
            resultado += 'None';
        }

        return resultado;
    }

    dicionarioConstrutos = {
        AcessoMetodo: this.traduzirConstrutoAcessoMetodo.bind(this),
        AcessoMetodoOuPropriedade: this.traduzirConstrutoAcessoMetodoOuPropriedade.bind(this),
        AcessoPropriedade: this.traduzirConstrutoAcessoPropriedade.bind(this),
        AcessoIndiceVariavel: this.traduzirConstrutoAcessoIndiceVariavel.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        ArgumentoReferenciaFuncao: this.traduzirConstrutoArgumentoReferenciaFuncao.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        Comentario: this.traduzirConstrutoComentario.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        Dicionario: this.traduzirConstrutoDicionario.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        ReferenciaFuncao: this.traduzirConstrutoReferenciaFuncao.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Comentario: this.traduzirConstrutoComentario.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        Continua: () => 'continue',
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Sustar: () => 'break',
        Tente: this.traduzirDeclaracaoTente.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
    };

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';
        this.classesConhecidas = [];

        try {
            for (const declaracao of declaracoes) {
                resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
            }
        } catch (erro) {
            console.error(`Erro em tradução para Python: ${erro}`);
        }

        return resultado.replace(/\n{2,}/g, '\n');
    }
}
