import {
    AcessoIndiceVariavel,
    AcessoMetodo,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    ArgumentoReferenciaFuncao,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    Construto,
    DefinirValor,
    Dicionario,
    FimPara,
    FuncaoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    ReferenciaFuncao,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Bloco,
    Classe,
    Comentario,
    Const,
    Declaracao,
    Enquanto,
    Escreva,
    Expressao,
    FuncaoDeclaracao,
    Para,
    ParaCada,
    Retorna,
    Se,
    Tente,
    Var,
} from '../declaracoes';
import { SimboloInterface, TradutorInterface } from '../interfaces';

import tiposDeSimbolos from '../tipos-de-simbolos/tenda';

export class TradutorReversoTenda implements TradutorInterface<Declaracao> {
    indentacao: number = 0;

    traduzirSimboloOperador(operador: SimboloInterface): string {
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
                return 'e';
            case tiposDeSimbolos.EXPONENCIACAO:
                return '**';
            case tiposDeSimbolos.IGUAL:
                return '=';
            case tiposDeSimbolos.É:
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
            case tiposDeSimbolos.NÃO:
                return '!';
            case tiposDeSimbolos.OU:
                return 'ou';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
        }
    }

    traduzirFuncaoOuMetodo(
        nomeMetodo: string,
        objetoResolvido: string,
        argumentos: Construto[]
    ): string {
        if (argumentos === undefined) {
            return `${objetoResolvido}.${nomeMetodo}`;
        }

        const argumentosResolvidos: string[] = [];
        for (const argumento of argumentos) {
            const argumentoResolvido =
                this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce(
            (atual, proximo) => (atual += proximo + ', '),
            ''
        );
        textoArgumentos = textoArgumentos.slice(0, -2);

        switch (nomeMetodo) {
            case 'adicionar':
            case 'empilhar':
                return `${objetoResolvido}.push(${textoArgumentos})`;
            case 'fatiar':
                return `${objetoResolvido}.slice(${argumentos[0]}, ${argumentos[1]})`;
            case 'inclui':
                return `${objetoResolvido}.includes(${argumentosResolvidos[0]})`;
            case 'inverter':
                return `${objetoResolvido}.toReversed()`;
            case 'juntar':
                return `${argumentosResolvidos[0]}.join(${objetoResolvido})`;
            case 'maiusculo':
                return `${objetoResolvido}.toUpperCase()`;
            case 'mapear':
                return `${objetoResolvido}.map(${this.traduzirFuncaoAnonimaParaLambda(argumentos[0])})`;
            case 'minusculo':
                return `${objetoResolvido}.toLowerCase()`;
            case 'ordenar':
                return `${objetoResolvido}.sort()`;
            case 'remover':
                return `delete ${objetoResolvido}[${argumentosResolvidos[0]}]`;
            case 'removerPrimeiro':
                return `${objetoResolvido}.shift()`;
            case 'removerUltimo':
                return `${objetoResolvido}.pop()`;
            case 'somar':
                return `${objetoResolvido}.reduce((acumulador, valorAtual) => acumulador + valorAtual, 0)`;
            case 'tamanho':
                return `${objetoResolvido}.length`;
        }

        return `${objetoResolvido}.${nomeMetodo}(${textoArgumentos}))`;
    }

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.constructor.name](
            agrupamento.expressao || agrupamento
        );
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        let resultado = this.dicionarioConstrutos[atribuir.alvo.constructor.name](atribuir.alvo);
        const operador = atribuir.simboloOperador?.lexema || '=';

        // Em Delégua, atribuições com operações embutidas devolvem um construto `Binario` no valor
        // por várias razões, sendo a mais importante delas a lógica de interpretação.
        let valorResolvido = '';
        if (atribuir.simboloOperador && atribuir.valor.constructor === Binario) {
            valorResolvido = this.dicionarioConstrutos[
                (atribuir.valor as Binario).direita.constructor.name
            ]((atribuir.valor as Binario).direita);
        } else {
            valorResolvido = this.dicionarioConstrutos[atribuir.valor.constructor.name](
                atribuir.valor
            );
        }

        resultado += ` ${operador} ` + valorResolvido;
        return resultado;
    }

    traduzirConstrutoBinario(binario: Binario): string {
        let resultado = '';
        // if (binario.esquerda.constructor.name === 'Agrupamento')
        //     resultado += '(' + this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda) + ')';
        // else
        resultado += this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda);

        let operador = this.traduzirSimboloOperador(binario.operador);
        resultado += ` ${operador} `;

        // if (binario.direita.constructor.name === 'Agrupamento')
        // resultado += '(' + this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita) + ')';
        // else
        resultado += this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);

        return resultado;
    }

    traduzirConstrutoChamada(chamada: Chamada): string {
        let resultado = '';

        const retorno = `${this.dicionarioConstrutos[chamada.entidadeChamada.constructor.name](
            chamada.entidadeChamada,
            chamada.argumentos
        )}`;

        resultado += retorno;
        return resultado;
    }

    traduzirDeclaracaoComentario(comentario: Comentario): string {
        let resultado = '';
        if (comentario.multilinha) {
            resultado += `/*`;
            for (let linhaComentario of comentario.conteudo as string[]) {
                resultado += `${linhaComentario}\n`;
            }
            resultado += `*/`;
        } else {
            resultado += `// ${comentario.conteudo as string}`;
        }

        return resultado;
    }

    traduzirConstrutoDefinirValor(definirValor: DefinirValor): string {
        let resultado = '';
        if (definirValor.objeto instanceof Isto) {
            resultado = 'this.' + definirValor.nome.lexema + ' = ';
        }

        resultado += definirValor.valor.simbolo.lexema;
        return resultado;
    }

    traduzirConstrutoDicionario(dicionario: Dicionario): string {
        let resultado = '{';

        for (let i = 0; i < dicionario.chaves.length; i++) {
            if (dicionario.esSpread && dicionario.esSpread[i]) {
                resultado += '...';
                resultado +=
                    this.dicionarioConstrutos[dicionario.valores[i].constructor.name](
                        dicionario.valores[i]
                    ) + ',';
            } else {
                resultado += this.dicionarioConstrutos[dicionario.chaves[i].constructor.name](
                    dicionario.chaves[i]
                );
                resultado += ':';
                resultado +=
                    this.dicionarioConstrutos[dicionario.valores[i].constructor.name](
                        dicionario.valores[i]
                    ) + ',';
            }
        }
        resultado += '}';

        return resultado;
    }

    traduzirConstrutoFimPara(fimPara: FimPara): string {
        const traducaoIncremento = this.dicionarioDeclaracoes[fimPara.incremento.constructor.name](
            fimPara.incremento
        );
        return traducaoIncremento;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') {
            const possuiInterpolacao = /\$\{(verdadeiro|falso|nulo)\}/.test(literal.valor);

            const valor = literal.valor.replace(/\$\{(verdadeiro|falso|nulo)\}/g, (_, match) => {
                switch (match) {
                    case 'verdadeiro':
                        return '${true}';
                    case 'falso':
                        return '${false}';
                    case 'nulo':
                        return '${null}';
                    default:
                        return match;
                }
            });

            return possuiInterpolacao ? `\`${valor}\`` : `"${literal.valor}"`;
        }

        return literal.valor;
    }

    traduzirConstrutoVariavel(variavel: Variavel, argumentos: Construto[]): string {
        const argumentosResolvidos: string[] = [];
        const argumentosValidados = argumentos || [];
        for (const argumento of argumentosValidados) {
            const argumentoResolvido =
                this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce(
            (atual, proximo) => (atual += proximo + ', '),
            ''
        );
        textoArgumentos = textoArgumentos.slice(0, -2);

        if (argumentosValidados.length > 0) {
            return `${variavel.simbolo.lexema}(${textoArgumentos})`;
        }

        return `${variavel.simbolo.lexema}`;
    }

    protected logicaComumBlocoEscopo(declaracoes: Declaracao[]): string {
        let resultado = '{\n';
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
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco): string {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes);
    }

    logicaTraducaoMetodoClasse(metodoClasse: FuncaoDeclaracao): string {
        this.indentacao += 4;
        let resultado = ' '.repeat(this.indentacao);
        resultado +=
            metodoClasse.simbolo.lexema === 'construtor'
                ? 'constructor('
                : metodoClasse.simbolo.lexema + '(';

        for (let parametro of metodoClasse.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }
        if (metodoClasse.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') ';
        resultado += this.logicaComumBlocoEscopo(metodoClasse.funcao.corpo);
        resultado += ' '.repeat(this.indentacao) + '\n';

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoClasse(declaracaoClasse: Classe): string {
        let resultado = 'export class ';

        if (declaracaoClasse.superClasse)
            resultado += `${declaracaoClasse.simbolo.lexema} extends ${declaracaoClasse.superClasse.simbolo.lexema} {\n`;
        else resultado += declaracaoClasse.simbolo.lexema + ' {\n';

        for (let metodo of declaracaoClasse.metodos) {
            resultado += this.logicaTraducaoMetodoClasse(metodo);
        }

        resultado += '}';
        return resultado;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): string {
        let resultado = 'enquanto (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](
                declaracaoEnquanto.condicao
            ) + ') ';
        resultado += this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](
            declaracaoEnquanto.corpo
        );
        return resultado;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'escreva(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](
            declaracaoExpressao.expressao
        );
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): string {
        let resultado = 'função ';
        resultado += declaracaoFuncao.simbolo.lexema + '(';

        for (const parametro of declaracaoFuncao.funcao.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        if (declaracaoFuncao.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') ';

        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo);
        return resultado;
    }

    traduzirConstrutoLeia(declaracaoLeia: Leia) {
        return `leia("${declaracaoLeia.argumentos[0].valor}")'`;
    }

    traduzirDeclaracaoParaCada(declaracaoParaCada: ParaCada): string {
        const variavelIteracao = this.dicionarioConstrutos[
            declaracaoParaCada.variavelIteracao.constructor.name
        ](declaracaoParaCada.variavelIteracao);
        let resultado = `para cada ${variavelIteracao} em `;
        resultado +=
            this.dicionarioConstrutos[declaracaoParaCada.vetorOuDicionario.constructor.name](
                declaracaoParaCada.vetorOuDicionario
            ) + ' ';

        resultado += this.dicionarioDeclaracoes[declaracaoParaCada.corpo.constructor.name](
            declaracaoParaCada.corpo
        );
        return resultado;
    }

    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        let resultado = 'para ';
        if (declaracaoPara.inicializador.constructor.name === 'Array') {
            resultado +=
                this.dicionarioDeclaracoes[declaracaoPara.inicializador[0].constructor.name](
                    declaracaoPara.inicializador[0],
                    false
                ) + '; ';
        } else {
            resultado +=
                this.dicionarioDeclaracoes[declaracaoPara.inicializador.constructor.name](
                    declaracaoPara.inicializador,
                    false
                ) + '; ';
        }

        resultado +=
            this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](
                declaracaoPara.condicao
            ) + '; ';
        resultado +=
            this.dicionarioConstrutos[declaracaoPara.incrementar.constructor.name](
                declaracaoPara.incrementar
            ) + ' ';

        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](
            declaracaoPara.corpo
        );
        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracaoRetorna: Retorna): string {
        let resultado = 'retorna ';
        const nomeConstrutor = declaracaoRetorna.valor.constructor.name;
        return (resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoRetorna?.valor));
    }

    traduzirDeclaracaoSe(declaracaoSe: Se): string {
        let resultado = 'se ';

        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](
            declaracaoSe.condicao
        );

        resultado += condicao;

        resultado +=
            ' ' +
            this.dicionarioDeclaracoes[declaracaoSe.caminhoEntao.constructor.name](
                declaracaoSe.caminhoEntao
            );

        if (declaracaoSe.caminhoSenao !== null) {
            resultado += ' '.repeat(this.indentacao);
            resultado += ' senão ';

            resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoSenao.constructor.name](
                declaracaoSe.caminhoSenao
            );
        }

        return resultado;
    }

    traduzirDeclaracaoTente(declaracaoTente: Tente): string {
        let resultado = 'try {\n';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);

        for (let condicao of declaracaoTente.caminhoTente) {
            resultado += this.dicionarioDeclaracoes[condicao.constructor.name](condicao) + '\n';
            resultado += ' '.repeat(this.indentacao);
        }
        resultado += '}';

        if (declaracaoTente.caminhoPegue !== null) {
            resultado += '\ncatch {\n';
            resultado += ' '.repeat(this.indentacao);
            if (Array.isArray(declaracaoTente.caminhoPegue)) {
                for (let declaracao of declaracaoTente.caminhoPegue) {
                    resultado +=
                        this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao) + '\n';
                }
            } else {
                for (let corpo of declaracaoTente.caminhoPegue.corpo) {
                    resultado += this.dicionarioDeclaracoes[corpo.constructor.name](corpo) + '\n';
                }
            }

            resultado += ' '.repeat(this.indentacao);
            resultado += '}';
        }
        if (declaracaoTente.caminhoFinalmente !== null) {
            resultado += '\nfinally {\n';
            for (let finalmente of declaracaoTente.caminhoFinalmente) {
                resultado +=
                    this.dicionarioDeclaracoes[finalmente.constructor.name](finalmente) + '\n';
            }
            resultado += ' '.repeat(this.indentacao);
            resultado += '}';
        }

        return resultado;
    }

    traduzirDeclaracaoConst(declaracaoConst: Const): string {
        let resultado = 'const ';
        resultado += declaracaoConst.simbolo.lexema;
        if (!declaracaoConst?.inicializador) resultado += ';';
        else {
            resultado += ' = ';
            if (this.dicionarioConstrutos[declaracaoConst.inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[
                    declaracaoConst.inicializador.constructor.name
                ](declaracaoConst.inicializador);
            } else {
                resultado += this.dicionarioDeclaracoes[
                    declaracaoConst.inicializador.constructor.name
                ](declaracaoConst.inicializador);
            }
            resultado += ';';
        }
        return resultado;
    }

    traduzirDeclaracaoVar(declaracaoVar: Var, adicionarPontoEVirgula: boolean = true): string {
        let resultado = 'var ';
        resultado += declaracaoVar.simbolo.lexema;
        if (!declaracaoVar?.inicializador && adicionarPontoEVirgula) resultado += ';';
        else {
            resultado += ' = ';
            if (this.dicionarioConstrutos[declaracaoVar.inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[
                    declaracaoVar.inicializador.constructor.name
                ](declaracaoVar.inicializador);
            } else {
                resultado += this.dicionarioDeclaracoes[
                    declaracaoVar.inicializador.constructor.name
                ](declaracaoVar.inicializador);
            }
            // if (adicionarPontoEVirgula) resultado += ';';
        }

        return resultado;
    }

    // TODO: Talvez terminar (ou remover, sei lá).
    traduzirFuncaoAnonimaParaLambda(argumento: Construto): string {
        return '';
    }

    traduzirConstrutoAcessoMetodo(acessoMetodo: AcessoMetodo, argumentos: Construto[]): string {
        switch (acessoMetodo.objeto.constructor.name) {
            case 'Variavel':
                let objetoVariavel = acessoMetodo.objeto as Variavel;
                return this.traduzirFuncaoOuMetodo(
                    acessoMetodo.nomeMetodo,
                    objetoVariavel.simbolo.lexema,
                    argumentos
                );
            default:
                const objetoResolvido = this.dicionarioConstrutos[
                    acessoMetodo.objeto.constructor.name
                ](acessoMetodo.objeto);
                return `${objetoResolvido}.${acessoMetodo.nomeMetodo}`;
        }
    }

    traduzirConstrutoAcessoMetodoOuPropriedade(
        acessoMetodo: AcessoMetodoOuPropriedade,
        argumentos: Construto[]
    ): string {
        if (acessoMetodo.objeto instanceof Variavel) {
            let objetoVariavel = acessoMetodo.objeto as Variavel;
            return `${this.traduzirFuncaoOuMetodo(acessoMetodo.simbolo.lexema, objetoVariavel.simbolo.lexema, argumentos)}`;
        }

        return `this.${acessoMetodo.simbolo.lexema}`;
    }

    traduzirFuncaoConstruto(funcaoConstruto: FuncaoConstruto): string {
        let resultado = 'função(';
        for (const parametro of funcaoConstruto.parametros) {
            resultado += parametro.nome.lexema + ', ';
        }

        if (funcaoConstruto.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') ';

        resultado += this.logicaComumBlocoEscopo(funcaoConstruto.corpo);
        return resultado;
    }

    traduzirConstrutoLogico(logico: Logico): string {
        let direita = this.dicionarioConstrutos[logico.direita.constructor.name](logico.direita);
        let operador = this.traduzirSimboloOperador(logico.operador);
        let esquerda = this.dicionarioConstrutos[logico.esquerda.constructor.name](logico.esquerda);

        return `${direita} ${operador} ${esquerda}`;
    }

    // TODO: Eliminar o soft cast para `any`.
    traduzirConstrutoAtribuicaoPorIndice(AtribuicaoPorIndice: AtribuicaoPorIndice): string {
        let resultado = '';

        resultado += (AtribuicaoPorIndice.objeto as any).simbolo.lexema + '[';
        resultado +=
            this.dicionarioConstrutos[AtribuicaoPorIndice.indice.constructor.name](
                AtribuicaoPorIndice.indice
            ) + ']';
        resultado += ' = ';

        if ((AtribuicaoPorIndice?.valor as any)?.simbolo?.lexema) {
            resultado += `${(AtribuicaoPorIndice.valor as any).simbolo.lexema}`;
        } else {
            resultado += this.dicionarioConstrutos[AtribuicaoPorIndice.valor.constructor.name](
                AtribuicaoPorIndice.valor
            );
        }

        return resultado;
    }

    traduzirConstrutoAcessoIndiceVariavel(acessoIndiceVariavel: AcessoIndiceVariavel): string {
        let resultado = '';

        resultado += this.dicionarioConstrutos[
            acessoIndiceVariavel.entidadeChamada.constructor.name
        ](acessoIndiceVariavel.entidadeChamada);
        resultado += `[${this.dicionarioConstrutos[acessoIndiceVariavel.indice.constructor.name](
            acessoIndiceVariavel.indice
        )}]`;

        return resultado;
    }

    traduzirConstrutoArgumentoReferenciaFuncao(
        argumentoReferenciaFuncao: ArgumentoReferenciaFuncao,
        argumentos: Construto[]
    ): string {
        const argumentosResolvidos: string[] = [];
        for (const argumento of argumentos) {
            const argumentoResolvido =
                this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce(
            (atual, proximo) => (atual += proximo + ', '),
            ''
        );
        textoArgumentos = textoArgumentos.slice(0, -2);

        return `${argumentoReferenciaFuncao.simboloFuncao.lexema}(${textoArgumentos})`;
    }

    traduzirConstrutoReferenciaFuncao(
        referenciaFuncao: ReferenciaFuncao,
        argumentos: Construto[]
    ): string {
        const argumentosResolvidos: string[] = [];
        for (const argumento of argumentos) {
            const argumentoResolvido =
                this.dicionarioConstrutos[argumento.constructor.name](argumento);
            argumentosResolvidos.push(argumentoResolvido);
        }

        let textoArgumentos = argumentosResolvidos.reduce(
            (atual, proximo) => (atual += proximo + ', '),
            ''
        );
        textoArgumentos = textoArgumentos.slice(0, -2);

        return `${referenciaFuncao.simboloFuncao.lexema}(${textoArgumentos})`;
    }

    traduzirConstrutoTipoDe(tipoDe: TipoDe): string {
        let resultado = 'typeof ';

        if (!tipoDe.valor)
            resultado += tipoDe.valor; // Qual o sentido disso?
        else if (typeof tipoDe.valor === 'string') resultado += `'${tipoDe.valor}'`;
        else if (typeof tipoDe.valor === 'number') resultado += tipoDe.valor;
        else {
            // Talvez isso seja uma péssima ideia.
            // Pensar em algo melhor.
            let alvoTipoDe = String(
                this.dicionarioConstrutos[tipoDe.valor.constructor.name](tipoDe.valor)
            );
            if (alvoTipoDe.startsWith('new')) {
                alvoTipoDe = alvoTipoDe.slice(4, -2);
            }

            resultado += `${alvoTipoDe}`;
        }

        return resultado;
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

    traduzirConstrutoUnario(unario: Unario): string {
        let resultado = '';
        if (
            [tiposDeSimbolos.INCREMENTAR, tiposDeSimbolos.DECREMENTAR].includes(
                unario.operador.tipo
            )
        ) {
            resultado += unario.operando.valor ?? (unario.operando as any).simbolo.lexema;
            resultado += unario.operador.tipo === tiposDeSimbolos.INCREMENTAR ? '++' : '--';
        } else {
            resultado += this.traduzirSimboloOperador(unario.operador);
            resultado += unario.operando.valor ?? (unario.operando as any).simbolo.lexema;
        }
        return resultado;
    }

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirConstrutoAcessoIndiceVariavel.bind(this),
        AcessoMetodo: this.traduzirConstrutoAcessoMetodo.bind(this),
        AcessoMetodoOuPropriedade: this.traduzirConstrutoAcessoMetodoOuPropriedade.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        ArgumentoReferenciaFuncao: this.traduzirConstrutoArgumentoReferenciaFuncao.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        Dicionario: this.traduzirConstrutoDicionario.bind(this),
        FimPara: this.traduzirConstrutoFimPara.bind(this),
        FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        Isto: () => 'this',
        Leia: this.traduzirConstrutoLeia.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        ReferenciaFuncao: this.traduzirConstrutoReferenciaFuncao.bind(this),
        TipoDe: this.traduzirConstrutoTipoDe.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        Comentario: this.traduzirDeclaracaoComentario.bind(this),
        Continua: () => 'continue',
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
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

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
