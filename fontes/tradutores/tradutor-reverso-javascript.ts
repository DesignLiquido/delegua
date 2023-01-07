import { parseScript } from 'esprima';

/**
 * Esse tradutor traduz de JavaScript para Delégua
 */
export class TradutorReversoJavaScript {
    indentacao: number = 0;

    constructor() {}

    traduzirSimboloOperador(operador: any) {
        switch (operador) {
            case '==':
            case '===':
                return '==';
        }
    }

    dicionarioConstrutos = {
        ArrowFunctionExpression: this.traduzirDeclaracaoFuncao.bind(this),
        // Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        // Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        BinaryExpression: this.traduzirConstrutoBinario.bind(this),
        // Chamada: this.traduzirConstrutoChamada.bind(this),
        // DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        // Isto: this.traduzirConstrutoIsto.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        // Variavel: this.traduzirConstrutoVariavel.bind(this),
    };

    dicionarioDeclaracoes = {
        ExpressionStatement: this.traduzirExpressaoDeclaracao.bind(this)
        // traduzirDeclaracaoEscreva
    }

    traduzirExpressaoDeclaracao(declaracao){
        let resultado = '';
        let informacoesExpressao = declaracao.expression.callee
        if(informacoesExpressao.type === 'MemberExpression'){
            if(informacoesExpressao?.object?.name === 'console' && informacoesExpressao?.property?.name === 'log'){
                for(let argumento of declaracao.expression.arguments){
                    resultado += `escreva(${this.dicionarioConstrutos[argumento.type](argumento)})`
                }
            }
        }
        return resultado;
    }

    traduzirDeclaracaoFuncao(funcao: any) {
        console.log(funcao)
    }

    traduzirConstrutoLiteral(literal: any){
        let resultado = '';
        if (typeof literal.value === 'string')
            resultado += `'${literal.value}'`;
        else
            resultado += `${literal.value}`;
        
        return resultado;
    }

    traduzirConstrutoBinario(binario: any){
        let resultado = '';
        let direita = typeof binario.right.value === 'string' ? `'${binario.right.value}'` : binario.right.value;
        let esquerda = typeof binario.left.value === 'string' ? `'${binario.left.value}'` : binario.left.value;
        resultado += `${esquerda} ${this.traduzirSimboloOperador(binario.operator)} ${direita}`
        return resultado;
    }

    traduzirDeclaracaoDeVariavel(declaracao: any) {
        let informacoesDaVariavel = declaracao.declarations[0];
        let resultado = `var ${informacoesDaVariavel.id.name} = ${this.dicionarioConstrutos[informacoesDaVariavel.init.type](informacoesDaVariavel.init)}`;

        return resultado;
    }

    logicaComumBlocoEscopo(declaracoes: any) {
        let resultado = '{\n';
        this.indentacao += 4;

        // if (typeof declaracoes[Symbol.iterator] === 'function') {
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
        // }

        this.indentacao -= 4;
        resultado += ' '.repeat(this.indentacao) + '}\n';
        return resultado;
    }

    traduzirDeclaracaoDeFuncao(declaracao: any) {
        let resultado = '';
        resultado += `funcao ${declaracao.id.name}(`

        for(let parametro of declaracao.params){
            resultado += parametro.name + ', '
        }
        if (declaracao.params.length > 0) {
            resultado = resultado.slice(0, -2);
        }
        resultado += ') '
        resultado += this.logicaComumBlocoEscopo(declaracao)
        return resultado;
    }

    traduzirClasseDeclaracao(declaracao: any){
        let resultado = ''
        
        console.log(declaracao)
    }

    traduzirDeclaracao(declaracao: any) {
        switch (declaracao.type) {
            case 'ClassDeclaration':
                return this.traduzirClasseDeclaracao(declaracao);
            case 'ExpressionStatement':
                return this.traduzirExpressaoDeclaracao(declaracao);
            case 'FunctionDeclaration':
                return this.traduzirDeclaracaoDeFuncao(declaracao);
            case 'VariableDeclaration':
                return this.traduzirDeclaracaoDeVariavel(declaracao);
        }
    }

    traduzir(codigo) {
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