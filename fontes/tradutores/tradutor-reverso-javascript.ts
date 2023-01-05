import { parseScript } from 'esprima';

/**
 * Esse tradutor traduz de JavaScript para Delégua
 */
export class TradutorReversoJavaScript {

    constructor() {}

    dicionarioConstrutos = {
        // Agrupamento: this.traduzirConstrutoAgrupamento.bind(this),
        // Atribuir: this.traduzirConstrutoAtribuir.bind(this),
        BinaryExpression: this.traduzirConstrutoBinario.bind(this),
        // Chamada: this.traduzirConstrutoChamada.bind(this),
        // DefinirValor: this.traduzirConstrutoDefinirValor.bind(this),
        // Isto: this.traduzirConstrutoIsto.bind(this),
        Literal: this.traduzirConstrutoLiteral.bind(this),
        // Variavel: this.traduzirConstrutoVariavel.bind(this),
    };

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
        resultado += `${esquerda} ${binario.operator} ${direita}`
        return resultado;
    }

    traduzirDeclaracaoDeVariavel(declaracao: any) {
        let informacoesDaVariavel = declaracao.declarations[0];
        let resultado = `var ${informacoesDaVariavel.id.name} = ${this.dicionarioConstrutos[informacoesDaVariavel.init.type](informacoesDaVariavel.init)}`;

        return resultado;
    }

    traduzirDeclaracao(declaracao: any) {
        switch (declaracao.type) {
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