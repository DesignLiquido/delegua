import { parseScript } from 'esprima';
import {
    ArrayExpression,
    BinaryExpression,
    BlockStatement,
    ClassDeclaration,
    DoWhileStatement,
    ForStatement,
    Identifier,
    IfStatement,
    Literal,
    MemberExpression,
    MethodDefinition,
    NewExpression,
    ReturnStatement,
    SwitchStatement,
    TryStatement,
    UpdateExpression,
    VariableDeclaration,
    WhileStatement,
} from 'estree';

/**
 * Esse tradutor traduz de JavaScript para Delégua.
 */
export class TradutorReversoJavaScript {
    indentacao: number = 0;

    constructor() {
        // Qualquer coisa pro ESLint ficar feliz.
    }

    traduzirSimboloOperador(operador: any): string {
        switch (operador) {
            case '===':
                return '==';
            default:
                return operador;
        }
    }

    traduzirConstrutoVetor(vetor: ArrayExpression) {
        if (!vetor.elements.length) {
            return '[]';
        }

        let resultado = '[';

        for (let elemento of vetor.elements) {
            resultado += this.dicionarioConstrutos[elemento.constructor.name](elemento) + ', ';
        }
        if (vetor.elements.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ']';
        return resultado;
    }

    traduzirIdentificador(identificador: Identifier): string {
        return identificador.name;
    }

    traduzirAtualizacaoVariavel(atualizarVariavel: UpdateExpression): string {
        let resultado = '';
        resultado += this.dicionarioConstrutos[atualizarVariavel.argument.constructor.name](atualizarVariavel.argument);
        resultado += this.traduzirSimboloOperador(atualizarVariavel.operator);
        return resultado;
    }

    traduzirNovo(novo: NewExpression) {
        let identificador = novo.callee as Identifier;

        let resultado = `${identificador.name}(`;

        for (let argumento of novo.arguments) {
            resultado += this.dicionarioConstrutos[argumento.type](argumento) + ', ';
        }
        if (novo.arguments.length > 0) {
            resultado = resultado.slice(0, -2);
        }

        resultado += ')';
        return resultado;
    }

    traduzirExpressao(expressao: MemberExpression): string {
        let objeto = this.dicionarioConstrutos[expressao.object.type](expressao.object);
        let propriedade = this.dicionarioConstrutos[expressao.property.type](expressao.property);
        if (objeto === 'console' && propriedade === 'log') {
            return 'escreva';
        }
        return `${objeto}${propriedade}`;
    }

    dicionarioConstrutos = {
        AssignmentExpression: this.traduzirConstrutoAtribuir.bind(this),
        ArrayExpression: this.traduzirConstrutoVetor.bind(this),
        ArrowFunctionExpression: this.traduzirDeclaracaoFuncao.bind(this),
        // Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        BinaryExpression: this.traduzirConstrutoBinario.bind(this),
        CallExpression: this.traduzirConstrutoChamada.bind(this),
        // DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        // Isto: this.traduzirConstrutoIsto.bind(this),
        Identifier: this.traduzirIdentificador.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        MemberExpression: this.traduzirExpressao.bind(this),
        NewExpression: this.traduzirNovo.bind(this),
        ThisExpression: (expressao) => 'isto.',
        UpdateExpression: this.traduzirAtualizacaoVariavel.bind(this),
        // Variavel: this.traduzirConstrutoVariavel.bind(this),
    };

    traduzirConstrutoChamada(chamada: any) {
        let resultado = '';
        resultado += this.dicionarioConstrutos[chamada.callee.type](chamada.callee) + '(';
        for (let parametro of chamada.arguments) {
            resultado += this.dicionarioConstrutos[parametro.type](parametro) + ', ';
        }
        if (chamada.arguments.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ')';
        return resultado;
    }

    traduzirConstrutoAtribuir(atribuir: any): string {
        let resultado = '';
        const direita = this.dicionarioConstrutos[atribuir.right.type](atribuir.right);
        const esquerda = this.dicionarioConstrutos[atribuir.left.type](atribuir.left);
        resultado += `${esquerda} ${this.traduzirSimboloOperador(atribuir.operator)} ${direita}`;
        return resultado;
    }

    traduzirExpressaoDeclaracao(declaracao): string {
        return this.dicionarioConstrutos[declaracao.expression.type](declaracao.expression);
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        return `${literal.raw}`;
    }

    traduzirConstrutoBinario(binario: BinaryExpression): string {
        let resultado = '';
        const direita = this.dicionarioConstrutos[binario.right.type](binario.right);
        const esquerda = this.dicionarioConstrutos[binario.left.type](binario.left);
        resultado += `${esquerda} ${this.traduzirSimboloOperador(binario.operator)} ${direita}`;
        return resultado;
    }

    traduzirDeclaracaoVariavel(declaracao: VariableDeclaration): string {
        let resultado = '';
        let informacoesDaVariavel = declaracao.declarations[0];
        const identificador = informacoesDaVariavel.id as Identifier;
        if (identificador) {
            resultado += `var ${identificador.name} = ${this.dicionarioConstrutos[informacoesDaVariavel.init.type](
                informacoesDaVariavel.init
            )}`;
        }

        return resultado;
    }

    logicaComumBlocoEscopo(declaracoes: any): string {
        let resultado = '{\n';
        this.indentacao += 4;

        const corpo = declaracoes.body.body || declaracoes.body;
        for (const declaracaoOuConstruto of corpo) {
            resultado += ' '.repeat(this.indentacao);
            const nomeConstrutor = declaracaoOuConstruto.constructor.name;
            if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
                resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoOuConstruto);
            } else {
                resultado += this.traduzirDeclaracao(declaracaoOuConstruto);
            }

            resultado += '\n';
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracaoPara(declaracao: ForStatement): string {
        let resultado = '';
        resultado += 'para (';
        resultado += this.traduzirDeclaracao(declaracao.init) + '; ';
        resultado += this.dicionarioConstrutos[declaracao.test.type](declaracao.test) + '; ';
        resultado += this.dicionarioConstrutos[declaracao.update.type](declaracao.update) + ') ';
        resultado += this.logicaComumBlocoEscopo(declaracao);

        return resultado;
    }

    traduzirDeclaracaoFuncao(declaracao: any): string {
        let resultado = '';
        const eFuncaoSeta = !declaracao.id;

        resultado += eFuncaoSeta ? '(' : `funcao ${declaracao.id.name}(`;

        for (let parametro of declaracao.params) {
            resultado += parametro.name + ', ';
        }
        if (declaracao.params.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        
        resultado += eFuncaoSeta ? ') => ' : ') ';
        resultado += this.logicaComumBlocoEscopo(declaracao);

        return resultado;
    }

    //TODO: Refatorar esse método. @Samuel
    traduzirDeclaracaoClasse(declaracao: ClassDeclaration): string {
        let resultado = `classe ${declaracao.id.name} `;
        if (declaracao.superClass) {
            let identificador = declaracao.superClass as Identifier;
            resultado += `herda ${identificador.name} `;
        }
        resultado += '{\n';
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);

        for (let corpo of declaracao.body.body) {
            if (corpo.type === 'MethodDefinition') {
                let _corpo = corpo as MethodDefinition;
                if (_corpo.kind === 'constructor') {
                    resultado += 'construtor(';
                    for (let valor of _corpo.value.params) {
                        if (valor.type === 'Identifier') {
                            resultado += `${valor.name}, `;
                        }
                    }
                    if (_corpo.value.params.length > 0) {
                        resultado = resultado.slice(0, -2);
                    }
                    resultado += ')';
                    resultado += this.logicaComumBlocoEscopo(_corpo.value);
                } else if (_corpo.kind === 'method') {
                    resultado += ' '.repeat(this.indentacao);
                    let identificador = _corpo.key as Identifier;
                    resultado += identificador.name + '(';
                    for (let valor of _corpo.value.params) {
                        if (valor.type === 'Identifier') {
                            resultado += `${valor.name}, `;
                        }
                    }
                    if (_corpo.value.params.length > 0) {
                        resultado = resultado.slice(0, -2);
                    }
                    resultado += ')';
                    resultado += this.logicaComumBlocoEscopo(_corpo.value);
                }
            } else if (corpo.constructor.name === 'PropertyDefinition') {
            } else if (corpo.constructor.name === 'StaticBlock') {
            }
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracaoRetorna(declaracao: ReturnStatement): string {
        return `retorna ${this.dicionarioConstrutos[declaracao.argument.type](declaracao.argument)}`;
    }

    traduzirDeclaracaoEnquanto(declaracao: WhileStatement): string {
        let resultado = 'enquanto(';
        resultado += this.dicionarioConstrutos[declaracao.test.type](declaracao.test);
        resultado += ')';
        resultado += this.logicaComumBlocoEscopo(declaracao);
        return resultado;
    }

    traduzirDeclaracaoFazerEnquanto(declaracao: DoWhileStatement): string {
        let resultado = 'fazer';
        resultado += this.logicaComumBlocoEscopo(declaracao);
        resultado += 'enquanto(';
        resultado += this.dicionarioConstrutos[declaracao.test.type](declaracao.test);
        resultado += ')';
        return resultado;
    }

    traduzirDeclaracaoSe(declaracao: IfStatement): string {
        let resultado = 'se (';
        resultado += this.dicionarioConstrutos[declaracao.test.type](declaracao.test);
        resultado += ')';
        resultado += this.logicaComumBlocoEscopo(declaracao.consequent);

        if(declaracao?.alternate){
            resultado += 'senao '
            if (declaracao.alternate.constructor.name === 'BlockStatement') {
                const bloco = declaracao.alternate as BlockStatement;
                resultado += this.logicaComumBlocoEscopo(bloco);
                return resultado;
            }
            const se = declaracao.alternate as IfStatement;
            resultado += this.traduzirDeclaracao(se);
        }

        return resultado;
    }

    traduzirDeclaracaoTente(declaracao: TryStatement): string {
        let resultado = 'tente ';

        resultado += this.logicaComumBlocoEscopo(declaracao.block);

        if (declaracao.handler) {
            resultado += 'pegue';
            if (declaracao.handler.param) {
                const identificador = declaracao.handler.param as Identifier;
                resultado += `(${identificador.name})`;
            }
            resultado += this.logicaComumBlocoEscopo(declaracao.block);
        }
        if (declaracao.finalizer) {
            resultado += 'finalmente';
            resultado += this.logicaComumBlocoEscopo(declaracao.finalizer);
        }

        return resultado;
    }

    traduzirDeclaracaoEscolha(declaracao: SwitchStatement): string {
        let resultado = '';
        this.indentacao += 4;

        resultado += `escolha(${this.dicionarioConstrutos[declaracao.discriminant.type](declaracao.discriminant)}) {`;
        resultado += ' '.repeat(this.indentacao);
        for(let caso of declaracao.cases){
            if(!caso.test){
                resultado += 'padrao:';
                resultado += ' '.repeat(this.indentacao + 4);
                for(let bloco of caso.consequent) {
                    if(bloco.type === 'BreakStatement') continue;
                    resultado += this.traduzirDeclaracao(bloco) + '\n'
                }
                break;
            }
            resultado += `caso ${this.dicionarioConstrutos[caso.test.type](caso.test)}:`
            resultado += ' '.repeat(this.indentacao + 4);
            for(let bloco of caso.consequent) {
                if(bloco.type === 'BreakStatement') continue;
                resultado += this.traduzirDeclaracao(bloco) + '\n'
            }
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';

        return resultado;
    }

    traduzirDeclaracao(declaracao: any): string {
        switch (declaracao.type) {
            case 'ClassDeclaration':
                return this.traduzirDeclaracaoClasse(declaracao);
            case 'DoWhileStatement':
                return this.traduzirDeclaracaoFazerEnquanto(declaracao);
            case 'ExpressionStatement':
                return this.traduzirExpressaoDeclaracao(declaracao);
            case 'ForStatement':
                return this.traduzirDeclaracaoPara(declaracao);
            case 'FunctionDeclaration':
                return this.traduzirDeclaracaoFuncao(declaracao);
            case 'IfStatement':
                return this.traduzirDeclaracaoSe(declaracao);
            case 'ReturnStatement':
                return this.traduzirDeclaracaoRetorna(declaracao);
            case 'SwitchStatement':
                return this.traduzirDeclaracaoEscolha(declaracao);
            case 'TryStatement':
                return this.traduzirDeclaracaoTente(declaracao);
            case 'VariableDeclaration':
                return this.traduzirDeclaracaoVariavel(declaracao);
            case 'WhileStatement':
                return this.traduzirDeclaracaoEnquanto(declaracao);
        }
    }

    traduzir(codigo): string {
        let resultado = '';
        const declaracoes = parseScript(codigo);

        for (let declaracao of declaracoes.body) {
            resultado += `${this.traduzirDeclaracao(declaracao)} \n`;
        }

        return resultado;
    }
}
