import { Binario } from "../../construtos";
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
        let resultado = "se (";
        const condicao = declaracaoSe.condicao as Binario;
        resultado += condicao.esquerda.valor;
        resultado += ' ' + dicionarioSimbolos[condicao.operador.tipo] + ' ';
        resultado += condicao.direita.valor + ')';
        return resultado;
    },
    'Tente': '',
    'Var': ''
}
