import {
    AcessoIndiceVariavel,
    AcessoMetodoOuPropriedade,
    Agrupamento,
    AtribuicaoPorIndice,
    Atribuir,
    Binario,
    Chamada,
    DefinirValor,
    Dicionario,
    FuncaoConstruto,
    Literal,
    Logico,
    TipoDe,
    Unario,
    Variavel,
    Vetor,
    Leia
} from '../construtos';

import {
    Bloco,
    Classe,
    Comentario,
    Const,
    Escolha,
    Escreva,
    Enquanto,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    Se,
    Tente,
    Var,
    Retorna,
    Continua,
    Sustar,
    Falhar,
    Declaracao,
    Expressao,
    ParaCada,
    TextoDocumentacao,
} from '../declaracoes';

import { VisitanteComumInterface } from '../interfaces';
import tiposDeSimbolos from '../tipos-de-simbolos/pitugues';

export class FormatadorPitugues implements VisitanteComumInterface {
    private nívelIndentação = 0;
    private tamanhoIndentação = 4;
    private códigoFormatado = '';
    private quebraLinha = '\n';

    private indentar(): string {
        return ' '.repeat(this.nívelIndentação);
    }

    private adicionarLinha(texto: string = ''): void {
        this.códigoFormatado += this.indentar() + texto + this.quebraLinha;
    }

    private aumentarIndentação(): void {
        this.nívelIndentação += this.tamanhoIndentação;
    }

    private diminuirIndentação(): void {
        this.nívelIndentação -= this.tamanhoIndentação;
    }

    // Métodos obrigatórios da interface, não usados no Pituguês.
    visitarDeclaracaoCabecalhoPrograma(): Promise<any> { return Promise.resolve(); }
    visitarDeclaracaoConstMultiplo(): Promise<any> { return Promise.resolve(); }
    visitarDeclaracaoEscrevaMesmaLinha(): Promise<any> { return Promise.resolve(); }
    visitarDeclaracaoInicioAlgoritmo(): Promise<any> { return Promise.resolve(); }
    visitarDeclaracaoTendoComo(): Promise<any> { return Promise.resolve(); }
    visitarDeclaracaoVarMultiplo(): Promise<any> { return Promise.resolve(); }

    visitarExpressaoAcessoElementoMatriz(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoAcessoMetodo(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoAcessoPropriedade(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoArgumentoReferenciaFuncao(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoAtribuicaoPorIndicesMatriz(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoComentario(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoExpressaoRegular(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoFimPara(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoFormatacaoEscrita(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoReferenciaFuncao(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoSeparador(): Promise<any> { return Promise.resolve(); }
    visitarExpressaoTupla(): Promise<any> { return Promise.resolve(); }

    async visitarDeclaracaoDeExpressao(declaracao: Expressao): Promise<any> { 
        this.códigoFormatado += this.indentar();
        this.códigoFormatado += await declaracao.expressao.aceitar(this) + `\n`;
    }

    async visitarDeclaracaoClasse(declaração: Classe): Promise<any> {
        this.adicionarLinha(`classe ${declaração.simbolo.lexema}:`);
        this.aumentarIndentação();

        // Atributos
        for (const atributo of declaração.propriedades || []) {
            const tipo = atributo.tipo ? `: ${atributo.tipo}` : '';
            this.adicionarLinha(`${atributo.nome.lexema}${tipo}`);
        }

        // Métodos
        for (const método of declaração.metodos || []) {
            const nome = método.simbolo.lexema;
            const éConstrutor = nome === 'construtor';
            const parâmetros = método.funcao.parametros;

            this.códigoFormatado += this.indentar();
            this.códigoFormatado += `${éConstrutor ? 'construtor' : `função ${nome}`}(`;

            if (parâmetros.length > 0) {
                for (let i = 0; i < parâmetros.length; i++) {
                    const p = parâmetros[i];
                    const tipo = p.tipoDado ? `: ${p.tipoDado}` : '';
                    this.códigoFormatado += `${p.nome.lexema}${tipo}`;
                    this.códigoFormatado += ', ';
                }

                if (parâmetros.length > 1) {
                    this.códigoFormatado = this.códigoFormatado.slice(0, -2);
                }
            }

            this.códigoFormatado += '):\n';

            this.aumentarIndentação();
            for (const instrução of método.funcao.corpo) {
                await instrução.aceitar(this);
            }

            this.diminuirIndentação();
        }

        this.diminuirIndentação();
    }

    async visitarDeclaracaoDefinicaoFuncao(declaração: FuncaoDeclaracao): Promise<any> {
        const parâmetros = declaração.funcao.parametros;

        this.códigoFormatado += this.indentar() + `função ${declaração.simbolo.lexema}(`;

        for (let i = 0; i < parâmetros.length; i++) {
            const p = parâmetros[i];
            const tipo = p.tipoDado ? `: ${p.tipoDado}` : '';
            this.códigoFormatado += `${p.nome.lexema}${tipo}`;
            if (i < parâmetros.length - 1) this.códigoFormatado += ', ';
        }
        this.códigoFormatado += '):\n';

        this.aumentarIndentação();
        for (const instrução of declaração.funcao.corpo) {
            await instrução.aceitar(this);
        }
        this.diminuirIndentação();
    }

    visitarDeclaracaoTextoDocumentacao(declaracao: TextoDocumentacao): Promise<any> | void {
        this.códigoFormatado += `'''${declaracao.conteudo}'''`;
    }

    async visitarDeclaracaoVar(declaração: Var): Promise<any> {
        this.códigoFormatado += this.indentar() + `var ${declaração.simbolo.lexema} = `;
        if (declaração.inicializador) {
            this.códigoFormatado += await declaração.inicializador.aceitar(this);
        } else {
            this.códigoFormatado += 'nulo';
        }

        this.códigoFormatado += `\n`;
    }

    async visitarDeclaracaoConst(declaração: Const): Promise<any> {
        return Promise.resolve();
    }

    async visitarDeclaracaoSe(declaração: Se): Promise<any> {
        this.adicionarLinha(`se ${await declaração.condicao.aceitar(this)}:`);
        this.aumentarIndentação();
        for (const instrução of (declaração.caminhoEntao as Bloco).declaracoes) {
            await instrução.aceitar(this);
        }
        this.diminuirIndentação();

        if (declaração.caminhoSenao) {
            this.adicionarLinha('senão:');
            this.aumentarIndentação();
            if (declaração.caminhoSenao instanceof Bloco) {
                for (const instrução of declaração.caminhoSenao.declaracoes) {
                    await instrução.aceitar(this);
                }
            } else {
                await (declaração.caminhoSenao as Se).aceitar(this);
            }
            this.diminuirIndentação();
        }
    }

    async visitarDeclaracaoEnquanto(declaração: Enquanto): Promise<any> {
        this.adicionarLinha(`enquanto ${await declaração.condicao.aceitar(this)}:`);
        this.aumentarIndentação();
        for (const instrução of (declaração.corpo as Bloco).declaracoes) {
            await instrução.aceitar(this);
        }
        this.diminuirIndentação();
    }

    async visitarDeclaracaoEscolha(declaração: Escolha): Promise<any> {
        const valor = await declaração.identificadorOuLiteral.aceitar(this);
        this.adicionarLinha(`escolha ${valor}:`);
        this.aumentarIndentação();

        for (const caminho of declaração.caminhos) {
            for (const condição of caminho.condicoes) {
                this.adicionarLinha(`caso ${await condição.aceitar(this)}:`);
                this.aumentarIndentação();
                for (const instrução of caminho.declaracoes) {
                    await instrução.aceitar(this);
                }
                this.diminuirIndentação();
            }
        }

        if (declaração.caminhoPadrao?.declaracoes?.length) {
            this.adicionarLinha('padrão:');
            this.aumentarIndentação();
            for (const instrução of declaração.caminhoPadrao.declaracoes) {
                await instrução.aceitar(this);
            }
            this.diminuirIndentação();
        }

        this.diminuirIndentação();
    }

    async visitarDeclaracaoFazer(declaração: Fazer): Promise<any> {
        this.adicionarLinha('fazer:');
        this.aumentarIndentação();
        for (const instrução of (declaração.caminhoFazer as Bloco).declaracoes) {
            await instrução.aceitar(this);
        }
        this.diminuirIndentação();
        this.adicionarLinha(`enquanto ${await declaração.condicaoEnquanto.aceitar(this)}`);
    }

    async visitarDeclaracaoParaCada(declaração: ParaCada): Promise<any> { 
        const variavelIteracao = await declaração.variavelIteracao.aceitar(this);
        const vetorOuDicionario = await declaração.vetorOuDicionario.aceitar(this);
        this.adicionarLinha(`para cada ${variavelIteracao} de ${vetorOuDicionario}:`);
        this.aumentarIndentação();
        for (const instrução of (declaração.corpo as Bloco).declaracoes) {
            await instrução.aceitar(this);
        }
        this.diminuirIndentação();
    }

    async visitarDeclaracaoPara(declaração: Para): Promise<any> {
        return Promise.resolve();
    }

    async visitarDeclaracaoTente(declaração: Tente): Promise<any> {
        this.adicionarLinha('tente:');
        this.aumentarIndentação();
        for (const instrução of declaração.caminhoTente) await instrução.aceitar(this);
        this.diminuirIndentação();

        if (declaração.caminhoPegue) {
            this.adicionarLinha('pegue como erro:');
            this.aumentarIndentação();
            const declaracoes = declaração.caminhoPegue instanceof FuncaoConstruto ? declaração.caminhoPegue.corpo : declaração.caminhoPegue as Declaracao[];
            for (const instrução of declaracoes) {
                await instrução.aceitar(this);
            }
            this.diminuirIndentação();
        }

        if (declaração.caminhoFinalmente) {
            this.adicionarLinha('finalmente:');
            this.aumentarIndentação();
            for (const instrução of declaração.caminhoFinalmente) await instrução.aceitar(this);
            this.diminuirIndentação();
        }
    }

    async visitarDeclaracaoEscreva(declaração: Escreva): Promise<any> {
        this.códigoFormatado += this.indentar() + `${declaração.simboloEscreva ? declaração.simboloEscreva.lexema : 'imprima'}(`;
        for (let i = 0; i < declaração.argumentos.length; i++) {
            this.códigoFormatado += await declaração.argumentos[i].aceitar(this);
            if (i < declaração.argumentos.length - 1) this.códigoFormatado += ', ';
        }
        this.códigoFormatado += `)${this.quebraLinha}`;
    }

    async visitarDeclaracaoImportar(declaração: Importar): Promise<any> {
        const caminho = await declaração.caminho.aceitar(this);
        this.adicionarLinha(`importar "${caminho.replace(/'/g, '')}"`);
    }

    async visitarDeclaracaoComentario(declaração: Comentario): Promise<any> {
        this.adicionarLinha(`# ${declaração.conteudo}`);
    }

    // ================================================================
    // Expressões
    // ================================================================

    async visitarExpressaoBloco(declaração: Bloco): Promise<any> {
        for (const instrução of declaração.declaracoes) {
            await instrução.aceitar(this);
        }
    }

    async visitarExpressaoRetornar(declaração: Retorna): Promise<any> {
        if (declaração.valor) {
            return `retorna ${await declaração.valor.aceitar(this)}`;
        } else {
            return 'retorna';
        }
    }

    visitarExpressaoContinua(): any {
        this.adicionarLinha('continue');
    }

    visitarExpressaoSustar(): any {
        this.adicionarLinha('sustar');
    }

    async visitarExpressaoFalhar(expressão: Falhar): Promise<any> {
        const mensagem = expressão.explicacao ? await expressão.explicacao.aceitar(this) : '"Erro"';
        this.adicionarLinha(`levante Erro(${mensagem})`);
    }

    async visitarExpressaoDeAtribuicao(expressão: Atribuir): Promise<any> {
        return `${await expressão.alvo.aceitar(this)} = ${await expressão.valor.aceitar(this)}`;
    }

    async visitarExpressaoBinaria(expressão: Binario): Promise<any> {
        const esquerda = await expressão.esquerda.aceitar(this);
        const direita = await expressão.direita.aceitar(this);
        const operador = this.mapearOperador(expressão.operador.tipo);
        return `${esquerda} ${operador} ${direita}`;
    }

    async visitarExpressaoLogica(expressão: Logico): Promise<any> {
        const esquerda = await expressão.esquerda.aceitar(this);
        const direita = await expressão.direita.aceitar(this);
        const operador = expressão.operador.tipo === tiposDeSimbolos.E ? 'e' : 'ou';
        return `${esquerda} ${operador} ${direita}`;
    }

    async visitarExpressaoLiteral(expressão: Literal): Promise<any> {
        if (expressão.valor === null) return 'nulo';
        if (expressão.valor === true) return 'verdadeiro';
        if (expressão.valor === false) return 'falso';
        if (typeof expressão.valor === 'string') {
            return `'${expressão.valor.replace(/'/g, "\\'")}'`;
        }
        return String(expressão.valor);
    }

    async visitarExpressaoDeVariavel(expressão: Variavel): Promise<any> {
        return expressão.simbolo.lexema;
    }

    async visitarExpressaoAgrupamento(expressão: Agrupamento): Promise<any> {
        return `(${await expressão.expressao.aceitar(this)})`;
    }

    async visitarExpressaoUnaria(expressão: Unario): Promise<any> {
        const operador = expressão.operador.tipo === tiposDeSimbolos.SUBTRACAO ? '-'
                       : expressão.operador.tipo === tiposDeSimbolos.NEGACAO ? 'não '
                       : '';
        const operando = await expressão.operando.aceitar(this);
        return expressão.incidenciaOperador === 'ANTES'
            ? `${operador}${operando}`
            : `${operando}${operador}`;
    }

    async visitarExpressaoDeChamada(expressão: Chamada): Promise<any> {
        const função = await expressão.entidadeChamada.aceitar(this);
        const argumentos = await Promise.all(expressão.argumentos.map(a => a.aceitar(this)));
        return `${função}(${argumentos.join(', ')})`;
    }

    visitarExpressaoIsto(): Promise<any> {
        return Promise.resolve('isto');
    }

    async visitarExpressaoSuper(): Promise<any> {
        return 'super()';
    }

    async visitarExpressaoVetor(expressão: Vetor): Promise<any> {
        const valores = await Promise.all(expressão.valores.map(v => v.aceitar(this)));
        return `[${valores.join(', ')}]`;
    }

    async visitarExpressaoDicionario(expressão: Dicionario): Promise<any> {
        const pares = await Promise.all(
            expressão.chaves.map(async (chave, i) => {
                const k = await chave.aceitar(this);
                const v = await expressão.valores[i].aceitar(this);
                return `${k}: ${v}`;
            })
        );
        return `{${pares.join(', ')}}`;
    }

    async visitarExpressaoAcessoIndiceVariavel(expressão: AcessoIndiceVariavel): Promise<any> {
        const entidade = await expressão.entidadeChamada.aceitar(this);
        const índice = await expressão.indice.aceitar(this);
        return `${entidade}[${índice}]`;
    }

    async visitarExpressaoAtribuicaoPorIndice(expressão: AtribuicaoPorIndice): Promise<any> {
        const objeto = await expressão.objeto.aceitar(this);
        const índice = await expressão.indice.aceitar(this);
        const valor = await expressão.valor.aceitar(this);
        return `${objeto}[${índice}] = ${valor}`;
    }

    async visitarExpressaoAcessoMetodoOuPropriedade(expressão: AcessoMetodoOuPropriedade): Promise<any> {
        const objeto = await expressão.objeto.aceitar(this);
        return `${objeto}.${expressão.simbolo.lexema}`;
    }

    async visitarExpressaoDefinirValor(expressão: DefinirValor): Promise<any> {
        const objeto = await expressão.objeto.aceitar(this);
        const valor = await expressão.valor.aceitar(this);
        return `${objeto}.${expressão.nome.lexema} = ${valor}`;
    }

    async visitarExpressaoFuncaoConstruto(expressão: FuncaoConstruto): Promise<any> {
        const parâmetros = expressão.parametros.map(p => {
            const tipo = p.tipoDado ? `: ${p.tipoDado}` : '';
            return p.nome.lexema + tipo;
        }).join(', ');

        let funçãoStr = `função(${parâmetros || ''}):\n`;

        this.aumentarIndentação();
        for (const instrução of expressão.corpo) {
            const linha = await instrução.aceitar(this);
            if (linha) {  // Only add if it returns something
                funçãoStr += this.indentar() + linha;
                if (!linha.endsWith('\n')) funçãoStr += '\n';
            }
        }
        this.diminuirIndentação();
        
        return funçãoStr.trimEnd();
    }

    async visitarExpressaoLeia(expressão: Leia): Promise<any> {
        const argumentos = await Promise.all(expressão.argumentos.map(a => a.aceitar(this)));
        return argumentos.length > 0 ? `input(${argumentos.join(', ')})` : 'input()';
    }

    async visitarExpressaoTipoDe(expressão: TipoDe): Promise<any> {
        const valor = await expressão.valor.aceitar(this);
        return `type(${valor})`;
    }

    private mapearOperador(tipo: any): string {
        const mapa: Record<string, string> = {
            [tiposDeSimbolos.ADICAO]: '+',
            [tiposDeSimbolos.SUBTRACAO]: '-',
            [tiposDeSimbolos.MULTIPLICACAO]: '*',
            [tiposDeSimbolos.DIVISAO]: '/',
            [tiposDeSimbolos.MODULO]: '%',
            [tiposDeSimbolos.MAIOR]: '>',
            [tiposDeSimbolos.MAIOR_IGUAL]: '>=',
            [tiposDeSimbolos.MENOR]: '<',
            [tiposDeSimbolos.MENOR_IGUAL]: '<=',
            [tiposDeSimbolos.IGUAL_IGUAL]: '==',
            [tiposDeSimbolos.DIFERENTE]: '!=',
        };
        return mapa[tipo] || String(tipo);
    }

    async formatar(declarações: any[]): Promise<string> {
        this.códigoFormatado = '';
        this.nívelIndentação = 0;

        for (const declaração of declarações) {
            await declaração.aceitar(this);
        }

        return this.códigoFormatado.trimEnd() + '\n';
    }
}