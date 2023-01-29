import { parseScript } from 'esprima';
import {
    ArrayExpression,
    BinaryExpression,
    ClassDeclaration,
    ForStatement,
    Identifier,
    Literal,
    MethodDefinition,
    UpdateExpression,
    VariableDeclaration
} 
from 'estree';

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
            case '==':
            case '===':
                return '==';
            default:
                return operador;
        }
    }

    traduzirConstrutoVetor(vetor: ArrayExpression){
        if(!vetor.elements.length){
            return '[]'
        }

        let resultado = '['

        for(let elemento of vetor.elements){
            resultado += this.dicionarioConstrutos[elemento.constructor.name](elemento) + ', '
        }
        if (vetor.elements.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ']'
        return resultado;
    }

    traduzirIdentificador(identificador: Identifier): string {
        return identificador.name;
    }

    traduzirAtualizacaoVariavel(atualizarVariavel: UpdateExpression): string {
        let resultado = '';
        resultado += this.dicionarioConstrutos[atualizarVariavel.argument.constructor.name](atualizarVariavel.argument)
        resultado += this.traduzirSimboloOperador(atualizarVariavel.operator);
        return resultado;
    }

    dicionarioConstrutos = {
        ArrayExpression: this.traduzirConstrutoVetor.bind(this),
        ArrowFunctionExpression: this.traduzirDeclaracaoFuncao.bind(this),
        // Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        // Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        BinaryExpression: this.traduzirConstrutoBinario.bind(this),
        CallExpression: this.traduzirConstrutoChamada.bind(this),
        // DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        // Isto: this.traduzirConstrutoIsto.bind(this),
        Identifier: this.traduzirIdentificador.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        UpdateExpression: this.traduzirAtualizacaoVariavel.bind(this)
        // Variavel: this.traduzirConstrutoVariavel.bind(this),
    };

    dicionarioDeclaracoes = {
        ExpressionStatement: this.traduzirExpressaoDeclaracao.bind(this),
        // traduzirDeclaracaoEscreva
    };

    traduzirConstrutoChamada(chamada: any) { }

    traduzirExpressaoDeclaracao(declaracao): string {
        let resultado = '';
        let informacoesExpressao = declaracao.expression.callee;
        if (informacoesExpressao?.type === 'MemberExpression') {
            if (informacoesExpressao?.object?.name === 'console' && informacoesExpressao?.property?.name === 'log') {
                if(declaracao.expression.arguments.length === 0){
                    return 'console.log()'
                }
                for (let argumento of declaracao.expression.arguments) {
                    resultado += `escreva(${this.dicionarioConstrutos[argumento.type](argumento)})`;
                }
            }
        }
        if(declaracao?.expression?.type === 'AssignmentExpression'){
            let de = declaracao?.expression;
            if(de.left.object.type === 'ThisExpression')
                resultado += `isto.${de.left.property.name}`
            resultado += ' = '
            resultado += de.right.name
        }
        if(declaracao?.expression?.callee?.type === 'Identifier'){
            resultado += informacoesExpressao.name + '(';
            for (let parametro of declaracao?.expression?.arguments) {
                resultado += this.dicionarioConstrutos[parametro.type](parametro) + ', ';
            }
            if (declaracao?.expression?.arguments.length > 0) {
                resultado = resultado.slice(0, -2);
            }
            resultado += ')'
        }
        return resultado;
    }

    traduzirDeclaracaoFuncao(funcao: any): string {
        console.log(funcao);
        return '';
    }

    traduzirConstrutoLiteral(literal: Literal): string {
        let resultado = '';
        if (typeof literal.value === 'string') resultado += `'${literal.value}'`;
        else resultado += `${literal.value}`;

        return resultado;
    }

    traduzirConstrutoBinario(binario: BinaryExpression): string {
        let resultado = '';
        const direita = this.dicionarioConstrutos[binario.right.type](binario.right);
        const esquerda = this.dicionarioConstrutos[binario.left.type](binario.left);
        resultado += `${esquerda} ${this.traduzirSimboloOperador(binario.operator)} ${direita}`;
        return resultado;
    }

    traduzirDeclaracaoDeVariavel(declaracao: VariableDeclaration): string {
        let resultado = ''
        let informacoesDaVariavel = declaracao.declarations[0];
        const identificador = informacoesDaVariavel.id as Identifier;
        if(identificador){
            resultado += `var ${identificador.name} = ${this.dicionarioConstrutos[
                informacoesDaVariavel.init.type
            ](informacoesDaVariavel.init)}`;
        }

        return resultado;
    }

    logicaComumBlocoEscopo(declaracoes: any): string {
        let resultado = '{\n';
        this.indentacao += 4;

        for (const declaracaoOuConstruto of declaracoes.body.body) {
            resultado += ' '.repeat(this.indentacao);
            const nomeConstrutor = declaracaoOuConstruto.constructor.name;
            if (this.dicionarioConstrutos.hasOwnProperty(nomeConstrutor)) {
                resultado += this.dicionarioConstrutos[nomeConstrutor](declaracaoOuConstruto);
            } else {
                resultado += this.dicionarioDeclaracoes[nomeConstrutor](declaracaoOuConstruto);
            }

            resultado += '\n';
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracaoPara(declaracao: ForStatement): string{
        let resultado = ''
        resultado += 'para ('
        resultado += this.traduzirDeclaracao(declaracao.init) + '; '
        resultado += this.dicionarioConstrutos[declaracao.test.type](declaracao.test) + '; '
        resultado += this.dicionarioConstrutos[declaracao.update.type](declaracao.update) + ') '
        resultado += this.logicaComumBlocoEscopo(declaracao);

        return resultado;
    }

    traduzirDeclaracaoDeFuncao(declaracao: any): string {
        let resultado = '';
        resultado += `funcao ${declaracao.id.name}(`;

        for (let parametro of declaracao.params) {
            resultado += parametro.name + ', ';
        }
        if (declaracao.params.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ') ';
        resultado += this.logicaComumBlocoEscopo(declaracao);
        return resultado;
    }

    traduzirClasseDeclaracao(declaracao: ClassDeclaration) {
        let resultado = `classe ${declaracao.id.name} `;
        if (declaracao.superClass) {
            let identificador = declaracao.superClass as Identifier;
            resultado += `herda ${identificador.name} `;
        }
        resultado += '{\n'
        this.indentacao += 4;
        resultado += ' '.repeat(this.indentacao);

        for(let corpo of declaracao.body.body) {
            if(corpo.type === 'MethodDefinition'){
                let _corpo = corpo as MethodDefinition;
                if(_corpo.kind === 'constructor'){
                    resultado += 'construtor('
                    for (let valor of _corpo.value.params){
                        if(valor.type === 'Identifier'){
                            resultado += `${valor.name}, `
                        }
                    }
                    if (_corpo.value.params.length > 0) {
                        resultado = resultado.slice(0, -2);
                    }
                    resultado += ')'
                    resultado += this.logicaComumBlocoEscopo(_corpo.value)
                } else if (_corpo.kind === 'method'){
                    resultado += ' '.repeat(this.indentacao);
                    let identificador = _corpo.key as Identifier
                    resultado += identificador.name + '('
                    for (let valor of _corpo.value.params){
                        if(valor.type === 'Identifier'){
                            resultado += `${valor.name}, `
                        }
                    }
                    if (_corpo.value.params.length > 0) {
                        resultado = resultado.slice(0, -2);
                    }
                    resultado += ')'
                    resultado += this.logicaComumBlocoEscopo(_corpo.value)
                }
            } else if (corpo.constructor.name === 'PropertyDefinition'){

            } else if (corpo.constructor.name === 'StaticBlock') {

            }
        }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracao(declaracao: any): string {
        switch (declaracao.type) {
            case 'ClassDeclaration':
                return this.traduzirClasseDeclaracao(declaracao);
            case 'ExpressionStatement':
                return this.traduzirExpressaoDeclaracao(declaracao);
            case 'ForStatement':
                return this.traduzirDeclaracaoPara(declaracao);            
            case 'FunctionDeclaration':
                return this.traduzirDeclaracaoDeFuncao(declaracao);
            case 'VariableDeclaration':
                return this.traduzirDeclaracaoDeVariavel(declaracao);
        }
    }

    traduzir(codigo): string {
        let resultado = '';
        const declaracoes = parseScript(codigo);

        for (let declaracao of declaracoes.body) {
            resultado += `${this.traduzirDeclaracao(declaracao)} \n`;
        }
        console.log(resultado);
        return resultado;
    }
}

//cd ./fontes/tradutores
//ts-node -T tradutor-reverso-javascript.ts
// var tjs = new TradutorReversoJavaScript();
// tjs.traduzir();
