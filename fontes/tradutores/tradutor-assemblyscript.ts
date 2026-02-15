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
    Construto,
    Deceto,
    Dicionario,
    Dupla,
    DefinirValor,
    Elvis,
    ExpressaoRegular,
    FuncaoConstruto,
    Isto,
    Leia,
    Literal,
    Logico,
    Noneto,
    Octeto,
    Quarteto,
    Quinteto,
    ReferenciaFuncao,
    Separador,
    Sexteto,
    Septeto,
    SeTernario,
    TipoDe,
    Trio,
    TuplaN,
    Unario,
    Variavel,
    Vetor,
} from '../construtos';
import {
    Ajuda,
    Bloco,
    Classe,
    Comentario,
    Const,
    ConstMultiplo,
    Declaracao,
    Enquanto,
    Escolha,
    Escreva,
    EscrevaMesmaLinha,
    Expressao,
    Falhar,
    Fazer,
    FuncaoDeclaracao,
    Importar,
    Para,
    ParaCada,
    Retorna,
    Se,
    TendoComo,
    Tente,
    TextoDocumentacao,
    Var,
    VarMultiplo,
} from '../declaracoes';
import { SimboloInterface } from '../interfaces';
import { CaminhoEscolha } from '../interfaces/construtos';
import tiposDeSimbolos from '../tipos-de-simbolos/delegua';

export class TradutorAssemblyScript {
    indentacao: number = 0;
    declaracoesDeClasses: Classe[];

    traduzirSimboloOperador(operador: SimboloInterface): string {
        switch (operador.tipo) {
            case tiposDeSimbolos.ADICAO:
                return '+';
            case tiposDeSimbolos.BIT_AND:
                return '&';
            case tiposDeSimbolos.BIT_OR:
                return '|';
            case tiposDeSimbolos.CIRCUMFLEXO:
                return '^';
            case tiposDeSimbolos.BIT_NOT:
                return '~';
            case tiposDeSimbolos.DIFERENTE:
                return '!=';
            case tiposDeSimbolos.DIVISAO:
                return '/';
            case tiposDeSimbolos.E:
                return '&&';
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
                return '||';
            case tiposDeSimbolos.SUBTRACAO:
                return '-';
        }
    }

    traduzirFuncoesNativas(metodo: string): string {
        switch (metodo.toLowerCase()) {
            case 'adicionar':
            case 'empilhar':
                return 'push';
            case 'concatenar':
                return 'concat';
            case 'fatiar':
                return 'slice';
            case 'inclui':
                return 'includes';
            case 'inverter':
                return 'reverse';
            case 'juntar':
                return 'join';
            case 'ordenar':
                return 'sort';
            case 'removerprimeiro':
                return 'shift';
            case 'removerultimo':
                return 'pop';
            case 'tamanho':
                return 'length';
            case 'maiusculo':
                return 'toUpperCase';
            case 'minusculo':
                return 'toLowerCase';
            case 'substituir':
                return 'replace';
            default:
                return metodo;
        }
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

    traduzirConstrutoSeparador(separador: Separador): string {
        return `${separador.conteudo} `;
    }

    traduzirDeclaracaoEscreva(declaracaoEscreva: Escreva): string {
        let resultado = 'trace(';
        for (const argumento of declaracaoEscreva.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        if (typeof literal.valor === 'string') return `"${literal.valor}"`;
        return String(literal.valor);
    }

    resolveTipoDeclaracaoVarEContante(tipo: string): string {
        switch (tipo) {
            case 'texto':
                return ': string';
            case 'inteiro':
                return ': i32';
            case 'longo':
                return ': i64';
            case 'inteiro_curto':
            case 'inteiroCurto':
                return ': i16';
            case 'byte':
                return ': i8';
            case 'numero':
            case 'número':
            case 'real':
                return ': f64';
            case 'real_curto':
            case 'realCurto':
                return ': f32';
            case 'logico':
            case 'lógico':
                return ': bool';
            case 'vazio':
            case 'nada':
                return ': void';
            case 'nulo':
                throw new Error(`Tipo 'nulo' não é válido no AssemblyScript. Use 'Type | null' para tipos anuláveis.`);
            case 'inteiro[]':
                return ': i32[]';
            case 'longo[]':
                return ': i64[]';
            case 'real[]':
            case 'numero[]':
            case 'número[]':
                return ': f64[]';
            case 'texto[]':
                return ': string[]';
            case 'logico[]':
            case 'lógico[]':
                return ': bool[]';
            case 'dicionario':
            case 'dicionário':
                return ': Map<string, i32>';
            case 'dupla':
                return ': i32[]';
            case 'trio':
                return ': i32[]';
            case 'quarteto':
                return ': i32[]';
            case 'quinteto':
                return ': i32[]';
            case 'sexteto':
                return ': i32[]';
            case 'septeto':
                return ': i32[]';
            case 'octeto':
                return ': i32[]';
            case 'noneto':
                return ': i32[]';
            case 'deceto':
                return ': i32[]';
            case 'tupla':
                return ': i32[]';
            default:
                throw new Error(`Tipo não reconhecido ou não suportado no AssemblyScript: '${tipo}'. AssemblyScript requer anotações de tipo explícitas.`);
        }
    }

    traduzirDeclaracaoVar(declaracaoVar: Var): string {
        let resultado = 'let ';
        resultado += declaracaoVar.simbolo.lexema;
        resultado += this.resolveTipoDeclaracaoVarEContante(declaracaoVar.tipo);
        if (!declaracaoVar?.inicializador) resultado += ';';
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
            resultado += ';';
        }
        return resultado;
    }

    traduzirDeclaracaoConst(declaracaoConst: Const): string {
        let resultado = 'const ';
        resultado += declaracaoConst.simbolo.lexema;
        resultado += this.resolveTipoDeclaracaoVarEContante(declaracaoConst.tipo);
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

    traduzirDeclaracaoTente(declaracaoTente: Tente): string {
        let resultado = '/* AVISO: AssemblyScript não suporta try/catch/finally. Este código pode não funcionar como esperado. */\n';
        resultado += 'try {\n';
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

    traduzirDeclaracaoVarMultiplo(declaracaoVarMultiplo: VarMultiplo): string {
        const variaveis = declaracaoVarMultiplo.simbolos.map(s => s.lexema).join(', ');
        let resultado = 'let ';
        resultado += variaveis;
        resultado += this.resolveTipoDeclaracaoVarEContante(declaracaoVarMultiplo.tipo);
        if (!declaracaoVarMultiplo?.inicializador) resultado += ';';
        else {
            resultado += ' = ';
            if (this.dicionarioConstrutos[declaracaoVarMultiplo.inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[
                    declaracaoVarMultiplo.inicializador.constructor.name
                ](declaracaoVarMultiplo.inicializador);
            } else {
                resultado += this.dicionarioDeclaracoes[
                    declaracaoVarMultiplo.inicializador.constructor.name
                ](declaracaoVarMultiplo.inicializador);
            }
            resultado += ';';
        }
        return resultado;
    }

    traduzirDeclaracaoConstMultiplo(declaracaoConstMultiplo: ConstMultiplo): string {
        const constantes = declaracaoConstMultiplo.simbolos.map(s => s.lexema).join(', ');
        let resultado = 'const ';
        resultado += constantes;
        resultado += this.resolveTipoDeclaracaoVarEContante(declaracaoConstMultiplo.tipo);
        if (!declaracaoConstMultiplo?.inicializador) resultado += ';';
        else {
            resultado += ' = ';
            if (this.dicionarioConstrutos[declaracaoConstMultiplo.inicializador.constructor.name]) {
                resultado += this.dicionarioConstrutos[
                    declaracaoConstMultiplo.inicializador.constructor.name
                ](declaracaoConstMultiplo.inicializador);
            } else {
                resultado += this.dicionarioDeclaracoes[
                    declaracaoConstMultiplo.inicializador.constructor.name
                ](declaracaoConstMultiplo.inicializador);
            }
            resultado += ';';
        }
        return resultado;
    }

    traduzirDeclaracaoEscrevaMesmaLinha(declaracaoEscrevaMesmaLinha: EscrevaMesmaLinha): string {
        let resultado = 'trace(';
        for (const argumento of declaracaoEscrevaMesmaLinha.argumentos) {
            const valor = this.dicionarioConstrutos[argumento.constructor.name](argumento);
            resultado += valor + ', ';
        }

        resultado = resultado.slice(0, -2);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoTendoComo(declaracaoTendoComo: TendoComo): string {
        // TendoComo is a resource management pattern (like try-with-resources in Java)
        // AssemblyScript doesn't have built-in support, so we'll just treat it as a scope
        let resultado = `// tendo ${declaracaoTendoComo.simboloVariavel.lexema} como recurso\n`;
        resultado += ' '.repeat(this.indentacao);
        resultado += `let ${declaracaoTendoComo.simboloVariavel.lexema} = `;
        
        if (this.dicionarioConstrutos[declaracaoTendoComo.inicializacaoVariavel.constructor.name]) {
            resultado += this.dicionarioConstrutos[
                declaracaoTendoComo.inicializacaoVariavel.constructor.name
            ](declaracaoTendoComo.inicializacaoVariavel);
        } else {
            resultado += this.dicionarioDeclaracoes[
                declaracaoTendoComo.inicializacaoVariavel.constructor.name
            ](declaracaoTendoComo.inicializacaoVariavel);
        }
        
        resultado += ';\n';
        resultado += ' '.repeat(this.indentacao);
        resultado += this.dicionarioDeclaracoes[declaracaoTendoComo.corpo.constructor.name](
            declaracaoTendoComo.corpo
        );
        
        return resultado;
    }

    traduzirDeclaracaoAjuda(declaracaoAjuda: Ajuda): string {
        // Ajuda is a help/documentation statement
        // In AssemblyScript, we'll just comment it out
        return '// ajuda' + '\n';
    }

    traduzirDeclaracaoTextoDocumentacao(declaracaoTextoDoc: TextoDocumentacao): string {
        // TextoDocumentacao is documentation text
        // We'll convert it to a comment
        return `/** ${declaracaoTextoDoc} */\n`;
    }

    logicaComumBlocoEscopo(declaracoes: Declaracao[]): string {
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

    traduzirDeclaracaoSe(declaracaoSe: Se): string {
        let resultado = 'if (';

        const condicao = this.dicionarioConstrutos[declaracaoSe.condicao.constructor.name](
            declaracaoSe.condicao
        );

        resultado += condicao;

        resultado += ')';
        resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoEntao.constructor.name](
            declaracaoSe.caminhoEntao
        );

        if (declaracaoSe.caminhoSenao !== null) {
            resultado += ' '.repeat(this.indentacao);
            resultado += 'else ';
            const se = declaracaoSe?.caminhoSenao as Se;
            if (se?.caminhoEntao) {
                resultado += 'if (';
                resultado += this.dicionarioConstrutos[se.condicao.constructor.name](se.condicao);
                resultado += ')';
                resultado += this.dicionarioDeclaracoes[se.caminhoEntao.constructor.name](
                    se.caminhoEntao
                );
                resultado += ' '.repeat(this.indentacao);
                if (se?.caminhoSenao) {
                    resultado += 'else ';
                    resultado += this.dicionarioDeclaracoes[se.caminhoSenao.constructor.name](
                        se.caminhoSenao
                    );
                    return resultado;
                }
            }

            resultado += this.dicionarioDeclaracoes[declaracaoSe.caminhoSenao.constructor.name](
                declaracaoSe.caminhoSenao
            );
        }

        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracaoRetorna: Retorna): string {
        let resultado = 'return ';
        const nomeConstrutor = declaracaoRetorna.valor.constructor.name;
        return (resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoRetorna?.valor));
    }

    traduzirDeclaracaoParaCada(declaracaoParaCada: ParaCada): string {
        // AssemblyScript não suporta for...of. Convertendo para loop baseado em índice.
        if (declaracaoParaCada.variavelIteracao.constructor.name !== 'Variavel') {
            throw new Error('Desestruturação em paraCada não é suportada no AssemblyScript. Use uma variável simples.');
        }
        
        const nomeVariavel = (declaracaoParaCada.variavelIteracao as any).simbolo.lexema;
        const nomeVetor = `__arr_${nomeVariavel}`;
        let resultado = `const ${nomeVetor} = `;
        resultado +=
            this.dicionarioConstrutos[declaracaoParaCada.vetorOuDicionario.constructor.name](
                declaracaoParaCada.vetorOuDicionario
            ) + ';';
        resultado += '\n';
        resultado += ' '.repeat(this.indentacao);
        resultado += `for (let __i_${nomeVariavel} = 0; __i_${nomeVariavel} < ${nomeVetor}.length; __i_${nomeVariavel}++) `;
        
        // Traduz o corpo diretamente - se for um Bloco, ele já terá as chaves
        resultado += this.dicionarioDeclaracoes[declaracaoParaCada.corpo.constructor.name](
            declaracaoParaCada.corpo
        );
        
        return resultado;
    }

    traduzirDeclaracaoPara(declaracaoPara: Para): string {
        let resultado = 'for (';
        if (declaracaoPara.inicializador.constructor.name === 'Array') {
            resultado +=
                this.dicionarioDeclaracoes[declaracaoPara.inicializador[0].constructor.name](
                    declaracaoPara.inicializador[0]
                ) + ' ';
        } else {
            resultado +=
                this.dicionarioDeclaracoes[declaracaoPara.inicializador.constructor.name](
                    declaracaoPara.inicializador
                ) + ' ';
        }

        resultado += !resultado.includes(';') ? ';' : '';

        resultado +=
            this.dicionarioConstrutos[declaracaoPara.condicao.constructor.name](
                declaracaoPara.condicao
            ) + '; ';
        resultado +=
            this.dicionarioConstrutos[declaracaoPara.incrementar.constructor.name](
                declaracaoPara.incrementar
            ) + ') ';

        resultado += this.dicionarioDeclaracoes[declaracaoPara.corpo.constructor.name](
            declaracaoPara.corpo
        );
        return resultado;
    }

    traduzirDeclaracaoImportar(declaracaoImportar: Importar) {
        return `'importar() não é suportado por este padrão de JavaScript'`;
    }

    traduzirDeclaracaoLeia(declaracaoLeia: Leia) {
        return `'leia() não é suportado por este padrão de JavaScript.'`;
    }

    traduzirDeclaracaoFuncao(declaracaoFuncao: FuncaoDeclaracao): string {
        let resultado = 'function ';
        resultado += declaracaoFuncao.simbolo.lexema + '(';

        // Adiciona parâmetros com tipos
        for (const parametro of declaracaoFuncao.funcao.parametros) {
            resultado += parametro.nome.lexema;
            
            // Adiciona tipo do parâmetro se disponível
            if (parametro.tipoDado) {
                try {
                    resultado += this.resolveTipoDeclaracaoVarEContante(parametro.tipoDado);
                } catch (e) {
                    // Se não conseguir resolver o tipo, lança erro mais específico
                    throw new Error(`Parâmetro '${parametro.nome.lexema}' da função '${declaracaoFuncao.simbolo.lexema}' tem tipo não suportado: '${parametro.tipoDado}'`);
                }
            } else {
                // AssemblyScript requer tipos explícitos em todos os parâmetros
                throw new Error(`Parâmetro '${parametro.nome.lexema}' da função '${declaracaoFuncao.simbolo.lexema}' não tem tipo definido. AssemblyScript requer tipos explícitos.`);
            }
            
            resultado += ', ';
        }

        if (declaracaoFuncao.funcao.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ')';
        
        // Adiciona tipo de retorno
        const tipoRetorno = this.inferirTipoRetornoFuncao(declaracaoFuncao.funcao);
        resultado += tipoRetorno;
        
        resultado += ' ';

        resultado += this.logicaComumBlocoEscopo(declaracaoFuncao.funcao.corpo);
        return resultado;
    }
    
    inferirTipoRetornoFuncao(funcao: FuncaoConstruto): string {
        // Se a função tem tipo de retorno explícito, usa ele
        if (funcao.tipo && funcao.tipo !== 'qualquer') {
            try {
                return this.resolveTipoDeclaracaoVarEContante(funcao.tipo);
            } catch (e) {
                // Se não conseguir resolver, retorna void por padrão
                return ': void';
            }
        }
        
        // Procura por declarações de retorno no corpo
        const temRetorno = this.verificaSeTemRetornoArray(funcao.corpo);
        
        if (temRetorno) {
            // Por enquanto, assumimos que se tem retorno mas sem tipo explícito,
            // precisamos de mais informação. Retornamos void como fallback.
            // TODO: Implementar inferência baseada no valor retornado
            return ': void';
        }
        
        return ': void';
    }
    
    verificaSeTemRetornoArray(corpo: Declaracao[]): boolean {
        if (!corpo) return false;
        
        for (const declaracao of corpo) {
            if (declaracao.constructor.name === 'Retorna') {
                return true;
            }
            // Verifica recursivamente em blocos aninhados
            if ((declaracao as any).corpo) {
                const corpoInterno = (declaracao as any).corpo;
                if (Array.isArray(corpoInterno)) {
                    if (this.verificaSeTemRetornoArray(corpoInterno)) {
                        return true;
                    }
                } else if (corpoInterno.declaracoes) {
                    // É um Bloco
                    if (this.verificaSeTemRetornoArray(corpoInterno.declaracoes)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    verificaSeTemRetorno(corpo: Bloco): boolean {
        if (!corpo || !corpo.declaracoes) return false;
        
        return this.verificaSeTemRetornoArray(corpo.declaracoes);
    }

    traduzirDeclaracaoFalhar(falhar: Falhar) {
        return `abort('${falhar.explicacao.valor}')`;
    }

    traduzirDeclaracaoFazer(declaracaoFazer: Fazer): string {
        let resultado = 'do ';
        resultado += this.dicionarioDeclaracoes[declaracaoFazer.caminhoFazer.constructor.name](
            declaracaoFazer.caminhoFazer
        );
        resultado +=
            'while (' +
            this.dicionarioConstrutos[declaracaoFazer.condicaoEnquanto.constructor.name](
                declaracaoFazer.condicaoEnquanto
            ) +
            ') ';
        return resultado;
    }

    traduzirDeclaracaoExpressao(declaracaoExpressao: Expressao): string {
        return this.dicionarioConstrutos[declaracaoExpressao.expressao.constructor.name](
            declaracaoExpressao.expressao
        );
    }

    logicaComumCaminhosEscolha(caminho: CaminhoEscolha): string {
        let resultado = '';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);

        for (let condicao of caminho.condicoes) {
            resultado +=
                'case ' + this.dicionarioConstrutos[condicao.constructor.name](condicao) + ':\n';
            resultado += ' '.repeat(this.indentacao);
        }

        for (let declaracao of caminho.declaracoes) {
            resultado += ' '.repeat(this.indentacao + 4);
            switch (declaracao.constructor.name) {
                case 'Retorna':
                    const declaracaoRetorna = declaracao as Retorna;
                    resultado +=
                        'return ' +
                        this.dicionarioConstrutos[declaracaoRetorna.valor.constructor.name](
                            declaracaoRetorna.valor
                        );
                    break;
                default:
                    resultado +=
                        this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao) + '\n';
                    break;
            }

            resultado += ' '.repeat(this.indentacao + 4);
            resultado += 'break' + '\n';
        }

        this.indentacao -= 4;
        return resultado;
    }

    traduzirDeclaracaoEscolha(declaracaoEscolha: Escolha): string {
        let resultado = 'switch (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEscolha.identificadorOuLiteral.constructor.name](
                declaracaoEscolha.identificadorOuLiteral
            ) + ') {\n';

        for (let caminho of declaracaoEscolha.caminhos) {
            resultado += this.logicaComumCaminhosEscolha(caminho);
        }

        if (declaracaoEscolha.caminhoPadrao) {
            resultado += ' '.repeat(4);
            resultado += 'default:\n';
            resultado += this.logicaComumCaminhosEscolha(declaracaoEscolha.caminhoPadrao);
        }

        resultado += '}\n';
        return resultado;
    }

    traduzirDeclaracaoEnquanto(declaracaoEnquanto: Enquanto): string {
        let resultado = 'while (';
        resultado +=
            this.dicionarioConstrutos[declaracaoEnquanto.condicao.constructor.name](
                declaracaoEnquanto.condicao
            ) + ') ';
        resultado += this.dicionarioDeclaracoes[declaracaoEnquanto.corpo.constructor.name](
            declaracaoEnquanto.corpo
        );
        return resultado;
    }

    traduzirDeclaracaoBloco(declaracaoBloco: Bloco): string {
        return this.logicaComumBlocoEscopo(declaracaoBloco.declaracoes);
    }

    traduzirConstrutoVetor(vetor: Vetor): string {
        if (!vetor.valores.length) {
            return '[]';
        }

        let resultado = '[';

        for (let valor of vetor.valores) {
            resultado += `${this.dicionarioConstrutos[valor.constructor.name](valor)}`;
        }

        resultado += ']';

        return resultado;
    }

    traduzirConstrutoDicionario(dicionario: Dicionario): string {
        // AssemblyScript Maps são inicializados via construtor
        // Map<K, V>() requer: new Map<string, ValueType>()
        if (!dicionario.chaves.length) {
            return 'new Map<string, i32>()';
        }

        // AssemblyScript não suporta literal syntax para Map, precisa usar constructor
        // Gerar algo como: { let m = new Map<string, i32>(); m.set("key", value); ... return m; }
        let resultado = '(() => { let m = new Map<string, i32>(); ';
        
        for (let i = 0; i < dicionario.chaves.length; i++) {
            const chave = dicionario.chaves[i];
            const valor = dicionario.valores[i];
            
            // A chave pode ser um Construto (como Literal) ou um valor simples
            let chaveStr: string;
            if (typeof chave === 'string') {
                chaveStr = `"${chave}"`;
            } else if (chave && chave.constructor && this.dicionarioConstrutos[chave.constructor.name]) {
                // Se for um Construto, traduzi-lo
                chaveStr = this.dicionarioConstrutos[chave.constructor.name](chave);
            } else {
                // Fallback: converter para string
                chaveStr = `"${String(chave)}"`;
            }
            
            resultado += `m.set(${chaveStr}, ${this.dicionarioConstrutos[valor.constructor.name](valor)}); `;
        }
        
        resultado += 'return m; })()';
        return resultado;
    }

    traduzirConstrutoDupla(dupla: Dupla): string {
        const primeiro = this.dicionarioConstrutos[dupla.primeiro.constructor.name](dupla.primeiro);
        const segundo = this.dicionarioConstrutos[dupla.segundo.constructor.name](dupla.segundo);
        return `[${primeiro}, ${segundo}]`;
    }

    traduzirConstrutoTrio(trio: Trio): string {
        const primeiro = this.dicionarioConstrutos[trio.primeiro.constructor.name](trio.primeiro);
        const segundo = this.dicionarioConstrutos[trio.segundo.constructor.name](trio.segundo);
        const terceiro = this.dicionarioConstrutos[trio.terceiro.constructor.name](trio.terceiro);
        return `[${primeiro}, ${segundo}, ${terceiro}]`;
    }

    traduzirConstrutoQuarteto(quarteto: Quarteto): string {
        const primeiro = this.dicionarioConstrutos[quarteto.primeiro.constructor.name](quarteto.primeiro);
        const segundo = this.dicionarioConstrutos[quarteto.segundo.constructor.name](quarteto.segundo);
        const terceiro = this.dicionarioConstrutos[quarteto.terceiro.constructor.name](quarteto.terceiro);
        const quarto = this.dicionarioConstrutos[quarteto.quarto.constructor.name](quarteto.quarto);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}]`;
    }

    traduzirConstrutoQuinteto(quinteto: Quinteto): string {
        const primeiro = this.dicionarioConstrutos[quinteto.primeiro.constructor.name](quinteto.primeiro);
        const segundo = this.dicionarioConstrutos[quinteto.segundo.constructor.name](quinteto.segundo);
        const terceiro = this.dicionarioConstrutos[quinteto.terceiro.constructor.name](quinteto.terceiro);
        const quarto = this.dicionarioConstrutos[quinteto.quarto.constructor.name](quinteto.quarto);
        const quinto = this.dicionarioConstrutos[quinteto.quinto.constructor.name](quinteto.quinto);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}, ${quinto}]`;
    }

    traduzirConstrutoSexteto(sexteto: Sexteto): string {
        const primeiro = this.dicionarioConstrutos[sexteto.primeiro.constructor.name](sexteto.primeiro);
        const segundo = this.dicionarioConstrutos[sexteto.segundo.constructor.name](sexteto.segundo);
        const terceiro = this.dicionarioConstrutos[sexteto.terceiro.constructor.name](sexteto.terceiro);
        const quarto = this.dicionarioConstrutos[sexteto.quarto.constructor.name](sexteto.quarto);
        const quinto = this.dicionarioConstrutos[sexteto.quinto.constructor.name](sexteto.quinto);
        const sexto = this.dicionarioConstrutos[sexteto.sexto.constructor.name](sexteto.sexto);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}, ${quinto}, ${sexto}]`;
    }

    traduzirConstrutoSepteto(septeto: Septeto): string {
        const primeiro = this.dicionarioConstrutos[septeto.primeiro.constructor.name](septeto.primeiro);
        const segundo = this.dicionarioConstrutos[septeto.segundo.constructor.name](septeto.segundo);
        const terceiro = this.dicionarioConstrutos[septeto.terceiro.constructor.name](septeto.terceiro);
        const quarto = this.dicionarioConstrutos[septeto.quarto.constructor.name](septeto.quarto);
        const quinto = this.dicionarioConstrutos[septeto.quinto.constructor.name](septeto.quinto);
        const sexto = this.dicionarioConstrutos[septeto.sexto.constructor.name](septeto.sexto);
        const setimo = this.dicionarioConstrutos[septeto.setimo.constructor.name](septeto.setimo);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}, ${quinto}, ${sexto}, ${setimo}]`;
    }

    traduzirConstrutoOcteto(octeto: Octeto): string {
        const primeiro = this.dicionarioConstrutos[octeto.primeiro.constructor.name](octeto.primeiro);
        const segundo = this.dicionarioConstrutos[octeto.segundo.constructor.name](octeto.segundo);
        const terceiro = this.dicionarioConstrutos[octeto.terceiro.constructor.name](octeto.terceiro);
        const quarto = this.dicionarioConstrutos[octeto.quarto.constructor.name](octeto.quarto);
        const quinto = this.dicionarioConstrutos[octeto.quinto.constructor.name](octeto.quinto);
        const sexto = this.dicionarioConstrutos[octeto.sexto.constructor.name](octeto.sexto);
        const setimo = this.dicionarioConstrutos[octeto.setimo.constructor.name](octeto.setimo);
        const oitavo = this.dicionarioConstrutos[octeto.oitavo.constructor.name](octeto.oitavo);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}, ${quinto}, ${sexto}, ${setimo}, ${oitavo}]`;
    }

    traduzirConstrutoNoneto(noneto: Noneto): string {
        const primeiro = this.dicionarioConstrutos[noneto.primeiro.constructor.name](noneto.primeiro);
        const segundo = this.dicionarioConstrutos[noneto.segundo.constructor.name](noneto.segundo);
        const terceiro = this.dicionarioConstrutos[noneto.terceiro.constructor.name](noneto.terceiro);
        const quarto = this.dicionarioConstrutos[noneto.quarto.constructor.name](noneto.quarto);
        const quinto = this.dicionarioConstrutos[noneto.quinto.constructor.name](noneto.quinto);
        const sexto = this.dicionarioConstrutos[noneto.sexto.constructor.name](noneto.sexto);
        const setimo = this.dicionarioConstrutos[noneto.setimo.constructor.name](noneto.setimo);
        const oitavo = this.dicionarioConstrutos[noneto.oitavo.constructor.name](noneto.oitavo);
        const nono = this.dicionarioConstrutos[noneto.nono.constructor.name](noneto.nono);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}, ${quinto}, ${sexto}, ${setimo}, ${oitavo}, ${nono}]`;
    }

    traduzirConstrutoDeceto(deceto: Deceto): string {
        const primeiro = this.dicionarioConstrutos[deceto.primeiro.constructor.name](deceto.primeiro);
        const segundo = this.dicionarioConstrutos[deceto.segundo.constructor.name](deceto.segundo);
        const terceiro = this.dicionarioConstrutos[deceto.terceiro.constructor.name](deceto.terceiro);
        const quarto = this.dicionarioConstrutos[deceto.quarto.constructor.name](deceto.quarto);
        const quinto = this.dicionarioConstrutos[deceto.quinto.constructor.name](deceto.quinto);
        const sexto = this.dicionarioConstrutos[deceto.sexto.constructor.name](deceto.sexto);
        const setimo = this.dicionarioConstrutos[deceto.setimo.constructor.name](deceto.setimo);
        const oitavo = this.dicionarioConstrutos[deceto.oitavo.constructor.name](deceto.oitavo);
        const nono = this.dicionarioConstrutos[deceto.nono.constructor.name](deceto.nono);
        const decimo = this.dicionarioConstrutos[deceto.decimo.constructor.name](deceto.decimo);
        return `[${primeiro}, ${segundo}, ${terceiro}, ${quarto}, ${quinto}, ${sexto}, ${setimo}, ${oitavo}, ${nono}, ${decimo}]`;
    }

    traduzirConstrutoTuplaN(tuplaN: TuplaN): string {
        const elementos = tuplaN.elementos.map(elemento =>
            this.dicionarioConstrutos[elemento.constructor.name](elemento)
        );
        return `[${elementos.join(', ')}]`;
    }

    traduzirConstrutoSeTernario(seTernario: SeTernario): string {
        const condicao = this.dicionarioConstrutos[seTernario.condicao.constructor.name](seTernario.condicao);
        const expressaoSe = this.dicionarioConstrutos[seTernario.expressaoSe.constructor.name](seTernario.expressaoSe);
        const expressaoSenao = this.dicionarioConstrutos[seTernario.expressaoSenao.constructor.name](seTernario.expressaoSenao);
        return `${condicao} ? ${expressaoSe} : ${expressaoSenao}`;
    }

    traduzirConstrutoElvis(elvis: Elvis): string {
        const esquerda = this.dicionarioConstrutos[elvis.esquerda.constructor.name](elvis.esquerda);
        const direita = this.dicionarioConstrutos[elvis.direita.constructor.name](elvis.direita);
        // Elvis operator (?:) is equivalent to || in JavaScript for null-coalescing
        return `${esquerda} || ${direita}`;
    }

    traduzirConstrutoAcessoPropriedade(acessoPropriedade: AcessoPropriedade): string {
        const objeto = this.dicionarioConstrutos[acessoPropriedade.objeto.constructor.name](acessoPropriedade.objeto);
        return `${objeto}.${acessoPropriedade.nomePropriedade}`;
    }

    traduzirConstrutoExpressaoRegular(expressaoRegular: ExpressaoRegular): string {
        // AssemblyScript doesn't have native regex support like JavaScript
        // Return the pattern as a string for now
        const valor = expressaoRegular.valor;
        if (typeof valor === 'string') {
            return `"${valor}"`;
        }
        return String(valor);
    }

    traduzirConstrutoVariavel(variavel: Variavel): string {
        return variavel.simbolo.lexema;
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

    traduzirConstrutoTipoDe(tipoDe: TipoDe): string {
        throw new Error('O operador typeof não é suportado no AssemblyScript. Use verificações de tipo em tempo de compilação como instanceof ou is<T>() em vez disso.');
    }

    traduzirConstrutoLogico(logico: Logico): string {
        let esquerda = this.dicionarioConstrutos[logico.esquerda.constructor.name](logico.esquerda);
        let operador = this.traduzirSimboloOperador(logico.operador);
        let direita = this.dicionarioConstrutos[logico.direita.constructor.name](logico.direita);

        return `${esquerda} ${operador} ${direita}`;
    }

    traduzirFuncaoConstruto(funcaoConstruto: FuncaoConstruto): string {
        let resultado = 'function(';
        for (const parametro of funcaoConstruto.parametros) {
            const tipoParametro = this.resolveTipoDeclaracaoVarEContante(parametro.tipoDado);
            resultado += `${parametro.nome.lexema}${tipoParametro}, `;
        }

        if (funcaoConstruto.parametros.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ') ';

        resultado += this.logicaComumBlocoEscopo(funcaoConstruto.corpo);
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

    traduzirConstrutoChamada(chamada: Chamada): string {
        let resultado = '';

        const retorno = `${this.dicionarioConstrutos[chamada.entidadeChamada.constructor.name](
            chamada.entidadeChamada,
            chamada.argumentos
        )}`;

        const instanciaClasse = this.declaracoesDeClasses.some(
            (declaracao) => declaracao?.simbolo?.lexema === retorno
        );
        if (instanciaClasse) {
            const classe = this.declaracoesDeClasses.find(
                (declaracao) => declaracao?.simbolo?.lexema === retorno
            );
            if (classe.simbolo.lexema === retorno) resultado += `new ${retorno}`;
        } else {
            resultado += retorno;
        }
        resultado += '(';
        for (let parametro of chamada.argumentos) {
            resultado += this.dicionarioConstrutos[parametro.constructor.name](parametro) + ', ';
        }
        if (chamada.argumentos.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ')';
        return resultado;
    }

    traduzirConstrutoComentario(comentario: Comentario): string {
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

    traduzirConstrutoBinario(binario: Binario): string {
        // Tratamento especial para exponenciação no AssemblyScript
        if (binario.operador.tipo === tiposDeSimbolos.EXPONENCIACAO) {
            const esquerda = this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda);
            const direita = this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita);
            return `Math.pow(${esquerda}, ${direita})`;
        }

        let resultado = '';
        if (binario.esquerda.constructor.name === 'Agrupamento')
            resultado +=
                '(' +
                this.dicionarioConstrutos[binario.esquerda.constructor.name](binario.esquerda) +
                ')';
        else
            resultado += this.dicionarioConstrutos[binario.esquerda.constructor.name](
                binario.esquerda
            );

        let operador = this.traduzirSimboloOperador(binario.operador);
        resultado += ` ${operador} `;

        if (binario.direita.constructor.name === 'Agrupamento')
            resultado +=
                '(' +
                this.dicionarioConstrutos[binario.direita.constructor.name](binario.direita) +
                ')';
        else
            resultado += this.dicionarioConstrutos[binario.direita.constructor.name](
                binario.direita
            );

        return resultado;
    }

    traduzirConstrutoAtribuir(atribuir: Atribuir): string {
        let resultado = this.dicionarioConstrutos[atribuir.alvo.constructor.name](atribuir.alvo);
        resultado +=
            ' = ' + this.dicionarioConstrutos[atribuir.valor.constructor.name](atribuir.valor);
        return resultado;
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

        if ((AtribuicaoPorIndice?.valor as any).simbolo?.lexema) {
            resultado += `${(AtribuicaoPorIndice.valor as any).simbolo.lexema}`;
        } else {
            resultado += this.dicionarioConstrutos[AtribuicaoPorIndice.valor.constructor.name](
                AtribuicaoPorIndice.valor
            );
        }

        return resultado;
    }

    traduzirConstrutoAcessoMetodo(acessoMetodo: AcessoMetodoOuPropriedade): string {
        if (acessoMetodo.objeto instanceof Variavel) {
            let objetoVariavel = acessoMetodo.objeto as Variavel;
            return `${objetoVariavel.simbolo.lexema}.${this.traduzirFuncoesNativas(acessoMetodo.simbolo.lexema)}`;
        }
        return `this.${acessoMetodo.simbolo.lexema}`;
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

    traduzirConstrutoAgrupamento(agrupamento: Agrupamento): string {
        return this.dicionarioConstrutos[agrupamento.constructor.name](
            agrupamento.expressao || agrupamento
        );
    }

    dicionarioConstrutos = {
        AcessoIndiceVariavel: this.traduzirConstrutoAcessoIndiceVariavel.bind(this),
        AcessoMetodo: this.traduzirConstrutoAcessoMetodo.bind(this),
        AcessoMetodoOuPropriedade: this.traduzirConstrutoAcessoMetodo.bind(this),
        AcessoPropriedade: this.traduzirConstrutoAcessoPropriedade.bind(this),
        Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        ArgumentoReferenciaFuncao: this.traduzirConstrutoArgumentoReferenciaFuncao.bind(this),
        AtribuicaoPorIndice: this.traduzirConstrutoAtribuicaoPorIndice.bind(this),
        Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        Binario: this.traduzirConstrutoBinario.bind(this),
        Chamada: this.traduzirConstrutoChamada.bind(this),
        ComentarioComoConstruto: this.traduzirConstrutoComentario.bind(this),
        Deceto: this.traduzirConstrutoDeceto.bind(this),
        DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        Dicionario: this.traduzirConstrutoDicionario.bind(this),
        Dupla: this.traduzirConstrutoDupla.bind(this),
        Elvis: this.traduzirConstrutoElvis.bind(this),
        ExpressaoRegular: this.traduzirConstrutoExpressaoRegular.bind(this),
        FuncaoConstruto: this.traduzirFuncaoConstruto.bind(this),
        Isto: () => 'this',
        Literal: this.traduzirConstrutoLiteral.bind(this),
        Logico: this.traduzirConstrutoLogico.bind(this),
        Noneto: this.traduzirConstrutoNoneto.bind(this),
        Octeto: this.traduzirConstrutoOcteto.bind(this),
        Quarteto: this.traduzirConstrutoQuarteto.bind(this),
        Quinteto: this.traduzirConstrutoQuinteto.bind(this),
        ReferenciaFuncao: this.traduzirConstrutoReferenciaFuncao.bind(this),
        Separador: this.traduzirConstrutoSeparador.bind(this),
        SeTernario: this.traduzirConstrutoSeTernario.bind(this),
        Sexteto: this.traduzirConstrutoSexteto.bind(this),
        Septeto: this.traduzirConstrutoSepteto.bind(this),
        TipoDe: this.traduzirConstrutoTipoDe.bind(this),
        Trio: this.traduzirConstrutoTrio.bind(this),
        TuplaN: this.traduzirConstrutoTuplaN.bind(this),
        Unario: this.traduzirConstrutoUnario.bind(this),
        Variavel: this.traduzirConstrutoVariavel.bind(this),
        Vetor: this.traduzirConstrutoVetor.bind(this),
    };

    dicionarioDeclaracoes = {
        Ajuda: this.traduzirDeclaracaoAjuda.bind(this),
        Bloco: this.traduzirDeclaracaoBloco.bind(this),
        Enquanto: this.traduzirDeclaracaoEnquanto.bind(this),
        Comentario: this.traduzirConstrutoComentario.bind(this),
        Continua: () => 'continue',
        Escolha: this.traduzirDeclaracaoEscolha.bind(this),
        Expressao: this.traduzirDeclaracaoExpressao.bind(this),
        Fazer: this.traduzirDeclaracaoFazer.bind(this),
        Falhar: this.traduzirDeclaracaoFalhar.bind(this),
        FuncaoDeclaracao: this.traduzirDeclaracaoFuncao.bind(this),
        Importar: this.traduzirDeclaracaoImportar.bind(this),
        Leia: this.traduzirDeclaracaoLeia.bind(this),
        Para: this.traduzirDeclaracaoPara.bind(this),
        ParaCada: this.traduzirDeclaracaoParaCada.bind(this),
        Retorna: this.traduzirDeclaracaoRetorna.bind(this),
        Se: this.traduzirDeclaracaoSe.bind(this),
        Sustar: () => 'break',
        Classe: this.traduzirDeclaracaoClasse.bind(this),
        Tente: this.traduzirDeclaracaoTente.bind(this),
        Const: this.traduzirDeclaracaoConst.bind(this),
        ConstMultiplo: this.traduzirDeclaracaoConstMultiplo.bind(this),
        Var: this.traduzirDeclaracaoVar.bind(this),
        VarMultiplo: this.traduzirDeclaracaoVarMultiplo.bind(this),
        Escreva: this.traduzirDeclaracaoEscreva.bind(this),
        EscrevaMesmaLinha: this.traduzirDeclaracaoEscrevaMesmaLinha.bind(this),
        TendoComo: this.traduzirDeclaracaoTendoComo.bind(this),
        TextoDocumentacao: this.traduzirDeclaracaoTextoDocumentacao.bind(this),
    };

    traduzir(declaracoes: Declaracao[]): string {
        let resultado = '';

        this.declaracoesDeClasses = declaracoes.filter(
            (declaracao) => declaracao instanceof Classe
        ) as Classe[];

        for (const declaracao of declaracoes) {
            resultado += `${this.dicionarioDeclaracoes[declaracao.constructor.name](declaracao)} \n`;
        }

        return resultado;
    }
}
