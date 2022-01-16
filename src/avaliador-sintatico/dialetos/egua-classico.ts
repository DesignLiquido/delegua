import tiposDeSimbolos from "../../tiposDeSimbolos";
import { AvaliadorSintaticoInterface, SimboloInterface } from "../../interfaces";
import {
  AssignSubscript,
  Atribuir,
  Binario,
  Call,
  Dicionario,
  Conjunto,
  Get,
  Grouping,
  Literal,
  Logical,
  Subscript,
  Super,
  Unario,
  Variavel,
  Vetor,
  Isto,
} from "../../construtos";
import {
  Block,
  Classe,
  Continua,
  Enquanto,
  Escolha,
  Escreva,
  Expressao,
  Fazer,
  Funcao,
  Importar,
  Para,
  Pausa,
  Retorna,
  Se,
  Tente,
  Var,
} from "../../declaracoes";

import {
  ErroAvaliador
} from '../parser-error';

/**
 * O avaliador sintático (Parser) é responsável por transformar os símbolos do Lexador em estruturas de alto nível.
 * Essas estruturas de alto nível são as partes que executam lógica de programação de fato.
 */
export class ParserEguaClassico implements AvaliadorSintaticoInterface {
  simbolos: SimboloInterface[];
  Delegua: any;

  atual: number;
  ciclos: number;

  constructor(Delegua: any, simbolos?: SimboloInterface[]) {
    this.simbolos = simbolos;
    this.Delegua = Delegua;

    this.atual = 0;
    this.ciclos = 0;
  }

  sincronizar(): void {
    this.avancar();

    while (!this.estaNoFinal()) {
      if (this.voltar().tipo === tiposDeSimbolos.PONTO_E_VIRGULA) return;

      switch (this.simboloAtual().tipo) {
        case tiposDeSimbolos.CLASSE:
        case tiposDeSimbolos.FUNCAO:
        case tiposDeSimbolos.VAR:
        case tiposDeSimbolos.PARA:
        case tiposDeSimbolos.SE:
        case tiposDeSimbolos.ENQUANTO:
        case tiposDeSimbolos.ESCREVA:
        case tiposDeSimbolos.RETORNA:
          return;
      }

      this.avancar();
    }
  }

  erro(simbolo: any, mensagemDeErro: any): any {
    this.Delegua.erro(simbolo, mensagemDeErro);
    return new ErroAvaliador();
  }

  consumir(tipo: any, mensagemDeErro: any): any {
    if (this.verificar(tipo)) return this.avancar();
    else throw this.erro(this.simboloAtual(), mensagemDeErro);
  }

  verificar(tipo: any): boolean {
    if (this.estaNoFinal()) return false;
    return this.simboloAtual().tipo === tipo;
  }

  verificarProximo(tipo: any): boolean {
    if (this.estaNoFinal()) return false;
    return this.simbolos[this.atual + 1].tipo === tipo;
  }

  simboloAtual(): any {
    return this.simbolos[this.atual];
  }

  voltar(): any {
    return this.simbolos[this.atual - 1];
  }

  seek(posicao: number): any {
    return this.simbolos[this.atual + posicao];
  }

  estaNoFinal(): boolean {
    return this.simboloAtual().tipo === tiposDeSimbolos.EOF;
  }

  avancar(): any {
    if (!this.estaNoFinal()) this.atual += 1;
    return this.voltar();
  }

  verificarSeSimboloAtualEIgualA(...argumentos: any[]): boolean {
    for (let i = 0; i < argumentos.length; i++) {
      const tipoAtual = argumentos[i];
      if (this.verificar(tipoAtual)) {
        this.avancar();
        return true;
      }
    }

    return false;
  }

  primario(): any {
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUPER)) {
      const palavraChave = this.voltar();
      this.consumir(tiposDeSimbolos.DOT, "Esperado '.' após 'super'.");
      const metodo = this.consumir(
        tiposDeSimbolos.IDENTIFICADOR,
        "Esperado nome do método da SuperClasse."
      );
      return new Super(palavraChave, metodo);
    }
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
      const valores = [];
      if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
        return new Vetor([]);
      }
      while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_DIREITO)) {
        const valor = this.atribuir();
        valores.push(valor);
        if (this.simboloAtual().tipo !== tiposDeSimbolos.COLCHETE_DIREITO) {
          this.consumir(
            tiposDeSimbolos.COMMA,
            "Esperado vírgula antes da próxima expressão."
          );
        }
      }
      return new Vetor(valores);
    }
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA)) {
      const chaves = [];
      const valores = [];
      if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
        return new Dicionario([], []);
      }
      while (!this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA)) {
        let chave = this.atribuir();
        this.consumir(
          tiposDeSimbolos.DOIS_PONTOS,
          "Esperado ':' entre chave e valor."
        );
        let valor = this.atribuir();

        chaves.push(chave);
        valores.push(valor);

        if (this.simboloAtual().tipo !== tiposDeSimbolos.CHAVE_DIREITA) {
          this.consumir(
            tiposDeSimbolos.COMMA,
            "Esperado vírgula antes da próxima expressão."
          );
        }
      }
      return new Dicionario(chaves, valores);
    }
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FUNCAO)) return this.corpoDaFuncao("funcao");
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FALSO)) return new Literal(false);
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VERDADEIRO)) return new Literal(true);
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NULO)) return new Literal(null);
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ISTO)) return new Isto(this.voltar());
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.NUMERO, tiposDeSimbolos.TEXTO)) {
      return new Literal(this.voltar().literal);
    }
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IDENTIFICADOR)) {
      return new Variavel(this.voltar());
    }
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
      let expr = this.expressao();
      this.consumir(
        tiposDeSimbolos.PARENTESE_DIREITO,
        "Esperado ')' após a expressão."
      );
      return new Grouping(expr);
    }
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IMPORTAR)) return this.declaracaoImportar();

    throw this.erro(this.simboloAtual(), "Esperado expressão.");
  }

  finalizarChamada(callee: any): any {
    const argumentos = [];
    if (!this.verificar(tiposDeSimbolos.PARENTESE_DIREITO)) {
      do {
        if (argumentos.length >= 255) {
          throw this.erro(
            this.simboloAtual(),
            "Não pode haver mais de 255 argumentos."
          );
        }
        argumentos.push(this.expressao());
      } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COMMA));
    }

    const parenteseDireito = this.consumir(
      tiposDeSimbolos.PARENTESE_DIREITO,
      "Esperado ')' após os argumentos."
    );

    return new Call(callee, parenteseDireito, argumentos);
  }

  chamar(): any {
    let expr = this.primario();

    while (true) {
      if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARENTESE_ESQUERDO)) {
        expr = this.finalizarChamada(expr);
      } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DOT)) {
        let nome = this.consumir(
          tiposDeSimbolos.IDENTIFICADOR,
          "Esperado nome do método após '.'."
        );
        expr = new Get(expr, nome);
      } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COLCHETE_ESQUERDO)) {
        const indice = this.expressao();
        let closeBracket = this.consumir(
          tiposDeSimbolos.COLCHETE_DIREITO,
          "Esperado ']' após escrita do indice."
        );
        expr = new Subscript(expr, indice, closeBracket);
      } else {
        break;
      }
    }

    return expr;
  }

  unario(): any {
    if (
      this.verificarSeSimboloAtualEIgualA(
        tiposDeSimbolos.NEGACAO,
        tiposDeSimbolos.SUBTRACAO,
        tiposDeSimbolos.BIT_NOT
      )
    ) {
      const operador = this.voltar();
      const direito = this.unario();
      return new Unario(operador, direito);
    }

    return this.chamar();
  }

  exponenciacao(): any {
    let expr = this.unario();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EXPONENCIACAO)) {
      const operador = this.voltar();
      const direito = this.unario();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  multiplicar(): any {
    let expr = this.exponenciacao();

    while (
      this.verificarSeSimboloAtualEIgualA(
        tiposDeSimbolos.DIVISAO,
        tiposDeSimbolos.MULTIPLICACAO,
        tiposDeSimbolos.MODULO
      )
    ) {
      const operador = this.voltar();
      const direito = this.exponenciacao();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  adicionar(): any {
    let expr = this.multiplicar();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SUBTRACAO, tiposDeSimbolos.ADICAO)) {
      const operador = this.voltar();
      const direito = this.multiplicar();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  bitFill(): any {
    let expr = this.adicionar();

    while (
      this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MENOR_MENOR, tiposDeSimbolos.MAIOR_MAIOR)
    ) {
      const operador = this.voltar();
      const direito = this.adicionar();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  bitE(): any {
    let expr = this.bitFill();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_AND)) {
      const operador = this.voltar();
      const direito = this.bitFill();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  bitOu(): any {
    let expr = this.bitE();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.BIT_OR, tiposDeSimbolos.BIT_XOR)) {
      const operador = this.voltar();
      const direito = this.bitE();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  comparar(): any {
    let expr = this.bitOu();

    while (
      this.verificarSeSimboloAtualEIgualA(
        tiposDeSimbolos.MAIOR,
        tiposDeSimbolos.MAIOR_IGUAL,
        tiposDeSimbolos.MENOR,
        tiposDeSimbolos.MENOR_IGUAL
      )
    ) {
      const operador = this.voltar();
      const direito = this.bitOu();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  comparacaoIgualdade(): any {
    let expr = this.comparar();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.DIFERENTE, tiposDeSimbolos.IGUAL_IGUAL)) {
      const operador = this.voltar();
      const direito = this.comparar();
      expr = new Binario(expr, operador, direito);
    }

    return expr;
  }

  em(): any {
    let expr = this.comparacaoIgualdade();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.EM)) {
      const operador = this.voltar();
      const direito = this.comparacaoIgualdade();
      expr = new Logical(expr, operador, direito);
    }

    return expr;
  }

  e(): any {
    let expr = this.em();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.E)) {
      const operador = this.voltar();
      const direito = this.em();
      expr = new Logical(expr, operador, direito);
    }

    return expr;
  }

  ou(): any {
    let expr = this.e();

    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.OU)) {
      const operador = this.voltar();
      const direito = this.e();
      expr = new Logical(expr, operador, direito);
    }

    return expr;
  }

  atribuir(): any {
    const expr = this.ou();

    if (
      this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
      this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
    ) {
      const igual = this.voltar();
      const valor = this.atribuir();

      if (expr instanceof Variavel) {
        const nome = expr.nome;
        return new Atribuir(nome, valor);
      } else if (expr instanceof Get) {
        const get = expr;
        return new Conjunto(get.objeto, get.nome, valor);
      } else if (expr instanceof Subscript) {
        return new AssignSubscript(expr.callee, expr.indice, valor);
      }
      this.erro(igual, "Tarefa de atribuição inválida");
    }

    return expr;
  }

  expressao(): any {
    return this.atribuir();
  }

  declaracaoMostrar(): any {
    this.consumir(
      tiposDeSimbolos.PARENTESE_ESQUERDO,
      "Esperado '(' antes dos valores em escreva."
    );

    const valor = this.expressao();

    this.consumir(
      tiposDeSimbolos.PARENTESE_DIREITO,
      "Esperado ')' após os valores em escreva."
    );

    this.consumir(
      tiposDeSimbolos.PONTO_E_VIRGULA,
      "Esperado ';' após o valor."
    );

    return new Escreva(valor);
  }

  declaracaoExpressao(): any {
    const expr = this.expressao();
    this.consumir(
      tiposDeSimbolos.PONTO_E_VIRGULA,
      "Esperado ';' após expressão."
    );
    return new Expressao(expr);
  }

  blocoEscopo(): any {
    const declaracoes = [];

    while (
      !this.verificar(tiposDeSimbolos.CHAVE_DIREITA) &&
      !this.estaNoFinal()
    ) {
      declaracoes.push(this.declaracao());
    }

    this.consumir(tiposDeSimbolos.CHAVE_DIREITA, "Esperado '}' após o bloco.");
    return declaracoes;
  }

  declaracaoSe(): any {
    this.consumir(
      tiposDeSimbolos.PARENTESE_ESQUERDO,
      "Esperado '(' após 'se'."
    );
    const condicao = this.expressao();
    this.consumir(
      tiposDeSimbolos.PARENTESE_DIREITO,
      "Esperado ')' após condição do se."
    );

    const thenBranch = this.resolverDeclaracao();

    const elifBranches = [];
    while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAOSE)) {
      this.consumir(
        tiposDeSimbolos.PARENTESE_ESQUERDO,
        "Esperado '(' após 'senaose'."
      );
      let elifCondition = this.expressao();
      this.consumir(
        tiposDeSimbolos.PARENTESE_DIREITO,
        "Esperado ')' apóes codição do 'senaose."
      );

      const branch = this.resolverDeclaracao();

      elifBranches.push({
        condition: elifCondition,
        branch,
      });
    }

    let elseBranch = null;
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
      elseBranch = this.resolverDeclaracao();
    }

    return new Se(condicao, thenBranch, elifBranches, elseBranch);
  }

  declaracaoEnquanto(): any {
    try {
      this.ciclos += 1;

      this.consumir(
        tiposDeSimbolos.PARENTESE_ESQUERDO,
        "Esperado '(' após 'enquanto'."
      );
      const condicao = this.expressao();
      this.consumir(
        tiposDeSimbolos.PARENTESE_DIREITO,
        "Esperado ')' após condicional."
      );
      const corpo = this.resolverDeclaracao();

      return new Enquanto(condicao, corpo);
    } finally {
      this.ciclos -= 1;
    }
  }

  declaracaoPara(): any {
    try {
      this.ciclos += 1;

      this.consumir(
        tiposDeSimbolos.PARENTESE_ESQUERDO,
        "Esperado '(' após 'para'."
      );

      let inicializador;
      if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PONTO_E_VIRGULA)) {
        inicializador = null;
      } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VAR)) {
        inicializador = this.declaracaoDeVariavel();
      } else {
        inicializador = this.declaracaoExpressao();
      }

      let condicao = null;
      if (!this.verificar(tiposDeSimbolos.PONTO_E_VIRGULA)) {
        condicao = this.expressao();
      }

      this.consumir(
        tiposDeSimbolos.PONTO_E_VIRGULA,
        "Esperado ';' após valores da condicional"
      );

      let incrementar = null;
      if (!this.verificar(tiposDeSimbolos.PARENTESE_DIREITO)) {
        incrementar = this.expressao();
      }

      this.consumir(
        tiposDeSimbolos.PARENTESE_DIREITO,
        "Esperado ')' após cláusulas"
      );

      const corpo = this.resolverDeclaracao();

      return new Para(inicializador, condicao, incrementar, corpo);
    } finally {
      this.ciclos -= 1;
    }
  }

  breakStatement(): any {
    if (this.ciclos < 1) {
      this.erro(this.voltar(), "'pausa' deve estar dentro de um loop.");
    }

    this.consumir(
      tiposDeSimbolos.PONTO_E_VIRGULA,
      "Esperado ';' após 'pausa'."
    );
    return new Pausa();
  }

  declaracaoContinua(): any {
    if (this.ciclos < 1) {
      this.erro(
        this.voltar(),
        "'continua' precisa estar em um laço de repetição."
      );
    }

    this.consumir(
      tiposDeSimbolos.PONTO_E_VIRGULA,
      "Esperado ';' após 'continua'."
    );
    return new Continua();
  }

  declaracaoRetorna(): any {
    const palavraChave = this.voltar();
    let valor = null;

    if (!this.verificar(tiposDeSimbolos.PONTO_E_VIRGULA)) {
      valor = this.expressao();
    }

    this.consumir(
      tiposDeSimbolos.PONTO_E_VIRGULA,
      "Esperado ';' após o retorno."
    );
    return new Retorna(palavraChave, valor);
  }

  declaracaoEscolha(): any {
    try {
      this.ciclos += 1;

      this.consumir(
        tiposDeSimbolos.PARENTESE_ESQUERDO,
        "Esperado '{' após 'escolha'."
      );
      const condicao = this.expressao();
      this.consumir(
        tiposDeSimbolos.PARENTESE_DIREITO,
        "Esperado '}' após a condição de 'escolha'."
      );
      this.consumir(
        tiposDeSimbolos.CHAVE_ESQUERDA,
        "Esperado '{' antes do escopo do 'escolha'."
      );

      const branches = [];
      let defaultBranch = null;
      while (
        !this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_DIREITA) &&
        !this.estaNoFinal()
      ) {
        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CASO)) {
          let branchConditions = [this.expressao()];
          this.consumir(
            tiposDeSimbolos.DOIS_PONTOS,
            "Esperado ':' após o 'caso'."
          );

          while (this.verificar(tiposDeSimbolos.CASO)) {
            this.consumir(tiposDeSimbolos.CASO, null);
            branchConditions.push(this.expressao());
            this.consumir(
              tiposDeSimbolos.DOIS_PONTOS,
              "Esperado ':' após declaração do 'caso'."
            );
          }

          const stmts = [];
          do {
            stmts.push(this.resolverDeclaracao());
          } while (
            !this.verificar(tiposDeSimbolos.CASO) &&
            !this.verificar(tiposDeSimbolos.PADRAO) &&
            !this.verificar(tiposDeSimbolos.CHAVE_DIREITA)
          );

          branches.push({
            conditions: branchConditions,
            stmts,
          });
        } else if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PADRAO)) {
          if (defaultBranch !== null)
            throw new ErroAvaliador(
              "Você só pode ter um 'padrao' em cada declaração de 'escolha'."
            );

          this.consumir(
            tiposDeSimbolos.DOIS_PONTOS,
            "Esperado ':' após declaração do 'padrao'."
          );

          const stmts = [];
          do {
            stmts.push(this.resolverDeclaracao());
          } while (
            !this.verificar(tiposDeSimbolos.CASO) &&
            !this.verificar(tiposDeSimbolos.PADRAO) &&
            !this.verificar(tiposDeSimbolos.CHAVE_DIREITA)
          );

          defaultBranch = {
            stmts,
          };
        }
      }

      return new Escolha(condicao, branches, defaultBranch);
    } finally {
      this.ciclos -= 1;
    }
  }

  declaracaoImportar(): any {
    this.consumir(
      tiposDeSimbolos.PARENTESE_ESQUERDO,
      "Esperado '(' após declaração."
    );

    const caminho = this.expressao();

    let closeBracket = this.consumir(
      tiposDeSimbolos.PARENTESE_DIREITO,
      "Esperado ')' após declaração."
    );

    return new Importar(caminho, closeBracket);
  }

  declaracaoTentar(): any {
    this.consumir(
      tiposDeSimbolos.CHAVE_ESQUERDA,
      "Esperado '{' após a declaração 'tente'."
    );

    let tryBlock = this.blocoEscopo();

    let catchBlock = null;
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PEGUE)) {
      this.consumir(
        tiposDeSimbolos.CHAVE_ESQUERDA,
        "Esperado '{' após a declaração 'pegue'."
      );

      catchBlock = this.blocoEscopo();
    }

    let elseBlock = null;
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SENAO)) {
      this.consumir(
        tiposDeSimbolos.CHAVE_ESQUERDA,
        "Esperado '{' após a declaração 'pegue'."
      );

      elseBlock = this.blocoEscopo();
    }

    let finallyBlock = null;
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FINALMENTE)) {
      this.consumir(
        tiposDeSimbolos.CHAVE_ESQUERDA,
        "Esperado '{' após a declaração 'pegue'."
      );

      finallyBlock = this.blocoEscopo();
    }

    return new Tente(tryBlock, catchBlock, elseBlock, finallyBlock);
  }

  declaracaoFazer(): any {
    try {
      this.ciclos += 1;

      const doBranch = this.resolverDeclaracao();

      this.consumir(
        tiposDeSimbolos.ENQUANTO,
        "Esperado declaração do 'enquanto' após o escopo do 'fazer'."
      );
      this.consumir(
        tiposDeSimbolos.PARENTESE_ESQUERDO,
        "Esperado '(' após declaração 'enquanto'."
      );

      const whileCondition = this.expressao();

      this.consumir(
        tiposDeSimbolos.PARENTESE_DIREITO,
        "Esperado ')' após declaração do 'enquanto'."
      );

      return new Fazer(doBranch, whileCondition);
    } finally {
      this.ciclos -= 1;
    }
  }

  resolverDeclaracao() {
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.FAZER)) return this.declaracaoFazer();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.TENTE)) return this.declaracaoTentar();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCOLHA)) return this.declaracaoEscolha();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.RETORNA)) return this.declaracaoRetorna();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CONTINUA)) return this.declaracaoContinua();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PAUSA)) return this.breakStatement();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.PARA)) return this.declaracaoPara();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ENQUANTO)) return this.declaracaoEnquanto();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.SE)) return this.declaracaoSe();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.ESCREVA)) return this.declaracaoMostrar();
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CHAVE_ESQUERDA))
      return new Block(this.blocoEscopo());

    return this.declaracaoExpressao();
  }

  declaracaoDeVariavel(): any {
    const nome = this.consumir(
      tiposDeSimbolos.IDENTIFICADOR,
      "Esperado nome de variável."
    );
    let inicializador = null;
    if (
      this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL) ||
      this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.MAIS_IGUAL)
    ) {
      inicializador = this.expressao();
    }

    this.consumir(
      tiposDeSimbolos.PONTO_E_VIRGULA,
      "Esperado ';' após a declaração da variável."
    );

    return new Var(nome, inicializador);
  }

  funcao(kind: any): any {
    const nome = this.consumir(
      tiposDeSimbolos.IDENTIFICADOR,
      `Esperado nome ${kind}.`
    );
    return new Funcao(nome, this.corpoDaFuncao(kind));
  }

  corpoDaFuncao(kind: any): any {
    this.consumir(
      tiposDeSimbolos.PARENTESE_ESQUERDO,
      `Esperado '(' após o nome ${kind}.`
    );

    let parametros = [];
    if (!this.verificar(tiposDeSimbolos.PARENTESE_DIREITO)) {
      do {
        if (parametros.length >= 255) {
          this.erro(this.simboloAtual(), "Não pode haver mais de 255 parâmetros");
        }

        let paramObj = {};

        if (this.simboloAtual().tipo === tiposDeSimbolos.MULTIPLICACAO) {
          this.consumir(tiposDeSimbolos.MULTIPLICACAO, null);
          paramObj["tipo"] = "wildcard";
        } else {
          paramObj["tipo"] = "standard";
        }

        paramObj["nome"] = this.consumir(
          tiposDeSimbolos.IDENTIFICADOR,
          "Esperado nome do parâmetro."
        );

        if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.IGUAL)) {
          paramObj["default"] = this.primario();
        }

        parametros.push(paramObj);

        if (paramObj["tipo"] === "wildcard") break;
      } while (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.COMMA));
    }

    this.consumir(
      tiposDeSimbolos.PARENTESE_DIREITO,
      "Esperado ')' após parâmetros."
    );
    this.consumir(
      tiposDeSimbolos.CHAVE_ESQUERDA,
      `Esperado '{' antes do escopo do ${kind}.`
    );

    const corpo = this.blocoEscopo();

    return new Funcao(parametros, corpo);
  }

  declaracaoDeClasse(): any {
    const nome = this.consumir(
      tiposDeSimbolos.IDENTIFICADOR,
      "Esperado nome da classe."
    );

    let superClasse = null;
    if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.HERDA)) {
      this.consumir(
        tiposDeSimbolos.IDENTIFICADOR,
        "Esperado nome da SuperClasse."
      );
      superClasse = new Variavel(this.voltar());
    }

    this.consumir(
      tiposDeSimbolos.CHAVE_ESQUERDA,
      "Esperado '{' antes do escopo da classe."
    );

    const metodos = [];
    while (
      !this.verificar(tiposDeSimbolos.CHAVE_DIREITA) &&
      !this.estaNoFinal()
    ) {
      metodos.push(this.funcao("método"));
    }

    this.consumir(
      tiposDeSimbolos.CHAVE_DIREITA,
      "Esperado '}' após o escopo da classe."
    );
    return new Classe(nome, superClasse, metodos);
  }

  declaracao(): any {
    try {
      if (
        this.verificar(tiposDeSimbolos.FUNCAO) &&
        this.verificarProximo(tiposDeSimbolos.IDENTIFICADOR)
      ) {
        this.consumir(tiposDeSimbolos.FUNCAO, null);
        return this.funcao("funcao");
      }
      if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.VAR)) return this.declaracaoDeVariavel();
      if (this.verificarSeSimboloAtualEIgualA(tiposDeSimbolos.CLASSE)) return this.declaracaoDeClasse();

      return this.resolverDeclaracao();
    } catch (erro) {
      this.sincronizar();
      return null;
    }
  }

  analisar(simbolos?: SimboloInterface[]): any {
    this.atual = 0;
    this.ciclos = 0;
    
    if (simbolos) {
      this.simbolos = simbolos;
    }
    
    const declaracoes = [];
    while (!this.estaNoFinal()) {
      declaracoes.push(this.declaracao());
    }

    return declaracoes;
  }
}
