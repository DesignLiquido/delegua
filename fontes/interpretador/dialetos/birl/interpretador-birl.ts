import { Construto, Atribuir, Literal, FimPara, FormatacaoEscrita, Super } from '../../../construtos';
import {
    Declaracao,
    Expressao,
    Leia,
    Para,
    ParaCada,
    Se,
    Fazer,
    Escolha,
    Tente,
    Enquanto,
    Importar,
    Escreva,
    EscrevaMesmaLinha,
    Bloco,
    Var,
    Const,
    Continua,
    Sustar,
    Retorna,
    FuncaoDeclaracao,
    Classe,
} from '../../../declaracoes';
import { EspacoVariaveis } from '../../../espaco-variaveis';
import { ObjetoPadrao } from '../../../estruturas';
import { ErroEmTempoDeExecucao } from '../../../excecoes';
import { InterpretadorInterface } from '../../../interfaces';
import { ErroInterpretador } from '../../../interfaces/erros/erro-interpretador';
import { EscopoExecucao } from '../../../interfaces/escopo-execucao';
import { PilhaEscoposExecucaoInterface } from '../../../interfaces/pilha-escopos-execucao-interface';
import { RetornoInterpretador } from '../../../interfaces/retornos';
import { ContinuarQuebra, SustarQuebra, RetornoQuebra, Quebra } from '../../../quebras';
import { PilhaEscoposExecucao } from '../../pilha-escopos-execucao';

export class InterpretadorBirl implements InterpretadorInterface {
    diretorioBase: any;

    funcaoDeRetorno: Function = null;
    funcaoDeRetornoMesmaLinha: Function = null;

    pilhaEscoposExecucao: PilhaEscoposExecucaoInterface;
    interfaceEntradaSaida: any;

    erros: ErroInterpretador[];
    declaracoes: Declaracao[];

    resultadoInterpretador: Array<string> = [];

    regexInterpolacao = /\$\{([a-z_][\w]*)\}/gi;

    constructor(diretorioBase: string, funcaoDeRetorno: Function = null, funcaoDeRetornoMesmaLinha: Function = null) {
        this.diretorioBase = diretorioBase;

        this.funcaoDeRetorno = funcaoDeRetorno || console.log;
        this.funcaoDeRetornoMesmaLinha = funcaoDeRetornoMesmaLinha || process.stdout.write.bind(process.stdout);

        this.erros = [];
        this.declaracoes = [];

        this.pilhaEscoposExecucao = new PilhaEscoposExecucao();
        const escopoExecucao: EscopoExecucao = {
            declaracoes: [],
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

    }

    async avaliar(expressao: Construto | Declaracao): Promise<any> {
        // @todo: Implementar validação mais inteligente.
        // Descomente o código abaixo quando precisar detectar expressões undefined ou nulas.
        // Por algum motivo o depurador do VSCode não funciona direito aqui
        // com breakpoint condicional.
        /* if (expressao === null || expressao === undefined) {
            console.log('Aqui');
        } */

        return await expressao.aceitar(this);
    }
    executarBloco(declaracoes: Declaracao[], ambiente?: EspacoVariaveis): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAgrupamento(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoUnaria(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoBinaria(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeChamada(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoDeAtribuicao(expressao: Atribuir) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDeVariavel(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoDeExpressao(declaracao: Expressao) {
        throw new Error('Método não implementado.');
    }
    /**
     * Execução da leitura de valores da entrada configurada no
     * início da aplicação.
     * @param expressao Expressão do tipo Leia
     * @returns Promise com o resultado da leitura.
     */
    async visitarExpressaoLeia(expressao: Leia): Promise<any> {
        const mensagem = expressao.argumentos && expressao.argumentos[0] ? expressao.argumentos[0].valor : '> ';
        return new Promise((resolucao) =>
            this.interfaceEntradaSaida.question(mensagem, (resposta: any) => {
                resolucao(resposta);
            })
        );
    }

    /**
     * Busca variáveis interpoladas.
     * @param {texto} textoOriginal O texto original com as variáveis interpoladas.
     * @returns Uma lista de variáveis interpoladas.
     */
    private buscarVariaveisInterpolacao(textoOriginal: string): any[] {
        const variaveis = textoOriginal.match(this.regexInterpolacao);

        return variaveis.map((s) => {
            const nomeVariavel: string = s.replace(/[\$\{\}]*/g, '');
            return {
                variavel: nomeVariavel,
                valor: this.pilhaEscoposExecucao.obterVariavelPorNome(nomeVariavel),
            };
        });
    }

     /**
     * Retira a interpolação de um texto.
     * @param {texto} texto O texto
     * @param {any[]} variaveis A lista de variaveis interpoladas
     * @returns O texto com o valor das variaveis.
     */
     private retirarInterpolacao(texto: string, variaveis: any[]): string {
        const valoresVariaveis = variaveis.map((v) => ({
            valorResolvido: this.pilhaEscoposExecucao.obterVariavelPorNome(v.variavel),
            variavel: v.variavel,
        }));

        let textoFinal = texto;

        valoresVariaveis.forEach((elemento) => {
            const valorFinal = elemento.valorResolvido.hasOwnProperty('valor')
                ? elemento.valorResolvido.valor
                : elemento.valorResolvido;

            textoFinal = textoFinal.replace('${' + elemento.variavel + '}', valorFinal);
        });

        return textoFinal;
    }


    visitarExpressaoLiteral(expressao: Literal): any {
        if (this.regexInterpolacao.test(expressao.valor)) {
            const variaveis = this.buscarVariaveisInterpolacao(expressao.valor);

            return this.retirarInterpolacao(expressao.valor, variaveis);
        }

        return expressao.valor;
    }

    visitarExpressaoLogica(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoPara(declaracao: Para): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoParaCada(declaracao: ParaCada): Promise<any> {
        throw new Error('Método não implementado.');
    }

    protected eVerdadeiro(objeto: any): boolean {
        if (objeto === null) return false;
        if (typeof objeto === 'boolean') return Boolean(objeto);
        if (objeto.hasOwnProperty('valor')) {
            return Boolean(objeto.valor);
        }

        return true;
    }

    /**
     * Executa uma expressão Se, que tem uma condição, pode ter um bloco
     * Senão, e múltiplos blocos Senão-se.
     * @param declaracao A declaração Se.
     * @returns O resultado da avaliação do bloco cuja condição é verdadeira.
     */
    async visitarDeclaracaoSe(declaracao: Se): Promise<any> {
        if (this.eVerdadeiro(await this.avaliar(declaracao.condicao))) {
            return await this.executar(declaracao.caminhoEntao);
        }

        //  @todo: Verificar se é necessário avaliar o caminho Senão.
        for (let i = 0; i < declaracao.caminhosSeSenao.length; i++) {
            const atual = declaracao.caminhosSeSenao[i];

            if (this.eVerdadeiro(await this.avaliar(atual.condicao))) {
                return await this.executar(atual.caminho);
            }
        }

        if (declaracao.caminhoSenao !== null) {
            return await this.executar(declaracao.caminhoSenao);
        }

        return null;
    }

    visitarExpressaoFimPara(declaracao: FimPara) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoFazer(declaracao: Fazer) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoFormatacaoEscrita(declaracao: FormatacaoEscrita) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEscolha(declaracao: Escolha) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoTente(declaracao: Tente) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoEnquanto(declaracao: Enquanto) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoImportar(declaracao: Importar) {
        throw new Error('Método não implementado.');
    }

    protected async avaliarArgumentosEscreva(argumentos: Construto[]): Promise<string> {
        let formatoTexto: string = '';

        for (const argumento of argumentos) {
            const resultadoAvaliacao = await this.avaliar(argumento);
            let valor = resultadoAvaliacao?.hasOwnProperty('valor') ? resultadoAvaliacao.valor : resultadoAvaliacao;

            formatoTexto += `${this.paraTexto(valor)} `;
        }

        return formatoTexto;
    }

    /**
     * Execução de uma escrita na saída configurada, que pode ser `console` (padrão) ou
     * alguma função para escrever numa página Web.
     * @param declaracao A declaração.
     * @returns Sempre nulo, por convenção de visita.
     */
    async visitarDeclaracaoEscreva(declaracao: Escreva): Promise<any> {
        try {
            const formatoTexto: string = await this.avaliarArgumentosEscreva(declaracao.argumentos);
            this.funcaoDeRetorno(formatoTexto);
            return null;
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: declaracao.linha,
                hashArquivo: declaracao.hashArquivo,
            });
        }
    }
    visitarExpressaoEscrevaMesmaLinha(declaracao: EscrevaMesmaLinha) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoBloco(declaracao: Bloco): Promise<any> {
        throw new Error('Método não implementado.');
    }

    protected async avaliacaoDeclaracaoVar(declaracao: Var): Promise<any> {
        let valorOuOutraVariavel = null;
        if (declaracao.inicializador !== null) {
            valorOuOutraVariavel = await this.avaliar(declaracao.inicializador);
        }

        let valorFinal = null;
        if (valorOuOutraVariavel !== null && valorOuOutraVariavel !== undefined) {
            valorFinal = valorOuOutraVariavel.hasOwnProperty('valor')
                ? valorOuOutraVariavel.valor
                : valorOuOutraVariavel;
        }

        return valorFinal;
    }

    /**
     * Executa expressão de definição de variável.
     * @param declaracao A declaração Var
     * @returns Sempre retorna nulo.
     */
    async visitarDeclaracaoVar(declaracao: Var): Promise<any> {
        const valorFinal = await this.avaliacaoDeclaracaoVar(declaracao);

        let subtipo;
        if (declaracao.tipo !== undefined) {
            subtipo = declaracao.tipo;
        }

        this.pilhaEscoposExecucao.definirVariavel(declaracao.simbolo.lexema, valorFinal, subtipo);

        return null;
    }

    visitarDeclaracaoConst(declaracao: Const): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoContinua(declaracao?: Continua): ContinuarQuebra {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoSustar(declaracao?: Sustar): SustarQuebra {
        throw new Error('Método não implementado.');
    }
    async visitarExpressaoRetornar(declaracao: Retorna): Promise<RetornoQuebra> {
        let valor = null;
        if (declaracao.valor != null) valor = await this.avaliar(declaracao.valor);

        return new RetornoQuebra(valor);
    }
    visitarExpressaoDeleguaFuncao(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAtribuicaoSobrescrita(expressao: any): Promise<any> {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoIndiceVariavel(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDefinirValor(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoDefinicaoFuncao(declaracao: FuncaoDeclaracao) {
        throw new Error('Método não implementado.');
    }
    visitarDeclaracaoClasse(declaracao: Classe) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoAcessoMetodo(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoIsto(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoDicionario(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoVetor(expressao: any) {
        throw new Error('Método não implementado.');
    }
    visitarExpressaoSuper(expressao: Super) {
        throw new Error('Método não implementado.');
    }

    paraTexto(objeto: any) {
        if (objeto === null || objeto === undefined) return 'nulo';
        if (typeof objeto === 'boolean') {
            return objeto ? 'verdadeiro' : 'falso';
        }

        if (objeto instanceof Date) {
            const formato = Intl.DateTimeFormat('pt', {
                dateStyle: 'full',
                timeStyle: 'full',
            });
            return formato.format(objeto);
        }

        if (Array.isArray(objeto)) return objeto;
        if (objeto.valor instanceof ObjetoPadrao) return objeto.valor.paraTexto();
        if (typeof objeto === 'object') return JSON.stringify(objeto);

        return objeto.toString();
    }

    /**
     * Efetivamente executa uma declaração.
     * @param declaracao A declaração a ser executada.
     * @param mostrarResultado Se resultado deve ser mostrado ou não. Normalmente usado
     *                         pelo modo LAIR.
     */
    async executar(declaracao: Declaracao, mostrarResultado = false): Promise<any> {
        const resultado: any = await declaracao.aceitar(this);
        if (mostrarResultado) {
            this.funcaoDeRetorno(this.paraTexto(resultado));
        }
        if (resultado || typeof resultado === 'boolean') {
            this.resultadoInterpretador.push(this.paraTexto(resultado));
        }
        return resultado;
    }

    /**
     * Executa o último escopo empilhado no topo na pilha de escopos do interpretador.
     * Esse método pega exceções, mas apenas as devolve.
     *
     * O tratamento das exceções é feito de acordo com o bloco chamador.
     * Por exemplo, em `tente ... pegue ... finalmente`, a exceção é capturada e tratada.
     * Em outros blocos, pode ser desejável ter o erro em tela.
     * @param manterAmbiente Se verdadeiro, ambiente do topo da pilha de escopo é copiado para o ambiente imediatamente abaixo.
     * @returns O resultado da execução do escopo, se houver.
     */
    async executarUltimoEscopo(manterAmbiente = false): Promise<any> {
        const ultimoEscopo = this.pilhaEscoposExecucao.topoDaPilha();
        try {
            let retornoExecucao: any;
            for (
                ;
                !(retornoExecucao instanceof Quebra) && ultimoEscopo.declaracaoAtual < ultimoEscopo.declaracoes.length;
                ultimoEscopo.declaracaoAtual++
            ) {
                retornoExecucao = await this.executar(ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual]);
            }

            return retornoExecucao;
        } catch (erro: any) {
            const declaracaoAtual = ultimoEscopo.declaracoes[ultimoEscopo.declaracaoAtual];
            this.erros.push({
                erroInterno: erro,
                linha: declaracaoAtual.linha,
                hashArquivo: declaracaoAtual.hashArquivo,
            });
            return Promise.reject(erro);
        } finally {
            this.pilhaEscoposExecucao.removerUltimo();
            if (manterAmbiente) {
                const escopoAnterior = this.pilhaEscoposExecucao.topoDaPilha();
                escopoAnterior.ambiente.valores = Object.assign(
                    escopoAnterior.ambiente.valores,
                    ultimoEscopo.ambiente.valores
                );
            }
        }
    }

    async interpretar(declaracoes: Declaracao[], manterAmbiente?: boolean): Promise<RetornoInterpretador> {
        this.erros = [];

        const escopoExecucao: EscopoExecucao = {
            declaracoes: declaracoes,
            declaracaoAtual: 0,
            ambiente: new EspacoVariaveis(),
            finalizado: false,
            tipo: 'outro',
            emLacoRepeticao: false,
        };
        this.pilhaEscoposExecucao.empilhar(escopoExecucao);

        try {
            const retornoOuErro = await this.executarUltimoEscopo(manterAmbiente);
            if (retornoOuErro instanceof ErroEmTempoDeExecucao) {
                this.erros.push(retornoOuErro);
            }
        } catch (erro: any) {
            this.erros.push({
                erroInterno: erro,
                linha: -1,
                hashArquivo: -1,
            });
        } finally {
            const retorno = {
                erros: this.erros,
                resultado: this.resultadoInterpretador,
            } as RetornoInterpretador;

            this.resultadoInterpretador = [];
            return retorno;
        }
    }
}
