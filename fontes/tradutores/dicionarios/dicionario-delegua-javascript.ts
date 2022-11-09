import { Binario, Literal, Variavel } from "../../construtos";
import { Se } from "../../declaracoes";

const dicionarioSimbolos = {
    'IGUAL_IGUAL': '=='
}

export default {
    'Bloco': '',
    'Classe': '',
    'Continua': '',
    'Enquanto': '',
    'Escolha': '',
    'Escreva': '',
    'Expressao': '',
    'Fazer': '',
    'Funcao': '',
    'Importar': '',
    'Leia': '',
    'Para': '',
    'Sustar': '',
    'Retorna': '',
    'Se': (declaracaoSe: Se) => {
        let resultado = "if (";
        const condicao = declaracaoSe.condicao as Binario;
        if (condicao.esquerda instanceof Literal) {
            resultado += condicao.esquerda.valor;
        } else if (condicao.esquerda instanceof Variavel) {
            resultado += condicao.esquerda.simbolo.lexema;
        }

        resultado += ' ' + dicionarioSimbolos[condicao.operador.tipo] + ' ';

        if (condicao.direita instanceof Literal) {
            resultado += condicao.direita.valor;
        } else if (condicao.direita instanceof Variavel) {
            resultado += condicao.direita.simbolo.lexema;
        }

        resultado += ') ';
        resultado += "{ }";
        return resultado;
    },
    'Tente': '',
    'Var': ''
}
