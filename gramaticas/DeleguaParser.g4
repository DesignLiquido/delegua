/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2023-hoje Design Líquido por Leonel Sanches da Silva
 *
 * Permissão concedida, gratuitamente, a qualquer pessoa que obtenha uma cópia
 * deste software e arquivos de documentação associados (o "Software"), para lidar
 * com o Software sem restrições, incluindo, sem limitação, os direitos de
 * usar, copiar, modificar, fundir, publicar, distribuir, sublicenciar e/ou vender
 * cópias do Software e para permitir que as pessoas a quem o Software é
 * munidos para o efeito, nas seguintes condições:
 * 
 * O aviso de direitos autorais acima e este aviso de permissão devem ser incluídos em todos os
 * cópias ou partes substanciais do Software.
 * 
 * O SOFTWARE É FORNECIDO "COMO ESTÁ", SEM GARANTIA DE QUALQUER TIPO, EXPRESSA OU
 * IMPLÍCITAS, INCLUINDO, SEM LIMITAÇÃO, AS GARANTIAS DE COMERCIALIZAÇÃO,
 * ADEQUAÇÃO PARA UM FIM ESPECÍFICO E NÃO VIOLAÇÃO. EM NENHUM CASO O
 * OS AUTORES OU DETENTORES DOS DIREITOS AUTORAIS SERÃO RESPONSÁVEIS POR QUALQUER REIVINDICAÇÃO, DANOS OU OUTROS
 * RESPONSABILIDADE, SEJA EM UMA AÇÃO DE CONTRATO, ILÍCITO OU DE OUTRA FORMA, DECORRENTE DE,
 * FORA DE OU EM CONEXÃO COM O SOFTWARE OU O USO OU OUTROS NEGÓCIOS NO
 * PROGRAMAS.
 * ---
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
parser grammar DeleguaParser;

// Insira aqui um @header para o avaliador sintático em C++.

options {
    tokenVocab=DeleguaLexer;
    superClass=DeleguaParserBase;
}

programa
    : HashBangLinha? elementosFonte? EOF
    ;

elementosFonte
    : elementoFonte+
    ;

elementoFonte
    : comando
    ;

comando
    : bloco
    | comandoVariavel
    | comandoImportar
//    | comandoExportar
    | comandoVazio_
    | declaracaoClasse
    | declaracaoInterface
    | declaracaoExtensao
    | expressaoComando
    | comandoSe
    | comandoIteracao
    | comandoContinue
    | comandoSustar
    | comandoRetorna
//    | comandoAcumular
//    | comandoCom
    | comandoParaPropriedade
    | comandoEscolha
    | comandoFalhar
    | comandoTente
    | comandoTendoComo
    | comandoAssercao
    | comandoAjuda
//    | comandoDebugger
    | declaracaoFuncao
    ;

bloco
    : '{' listaComandos? '}'
    ;

listaComandos
    : comando+
    ;

comandoVariavel
    : variavelDeclaracaoList fimDoComando
    ;

comandoImportar
    : Importar importarDeBloco
    ;

importarDeBloco
    : importPadrao? (importEspacoNomes | moduleItems) importDe fimDoComando
    | Tudo Como identificadorNome fimDoComando
    | LiteralTexto fimDoComando
    ;

moduleItems
    : '{' (aliasNome ',')* (aliasNome ','?)? '}'
    ;

importPadrao
    : aliasNome ','
    ;

importEspacoNomes
    : ('*' | identificadorNome) (Como identificadorNome)?
    ;

importDe
    : De LiteralTexto
    ;

aliasNome
    : identificadorNome (Como identificadorNome)?
    ;

/* comandoExportar
    : Exportar (exportDeBlock | declaracao) fimDoComando    # ExportarDeclaracao
    | Exportar Padrao expressaoUnica fimDoComando           # ExportarPadraoDeclaracao
    ; */

exportDeBlock
    : importEspacoNomes importDe fimDoComando
    | moduleItems importDe? fimDoComando
    ;

declaracao
    : comandoVariavel
    | declaracaoClasse
    | declaracaoInterface
    | declaracaoExtensao
    | declaracaoFuncao
    ;

variavelDeclaracaoList
    : varModificador variavelDeclaracao (',' variavelDeclaracao)*
    ;

variavelDeclaracao
    : designavel (':' identificadorNome)? ('=' expressaoUnica)? // Suporte a anotação de tipo: var x: texto = "oi"
    ;

comandoVazio_
    : PontoEVirgula
    ;

expressaoComando
    : {this.notAbreChaveAndNotFunction()}? expressaoSequencia fimDoComando
    ;

comandoSe
    : Se '(' expressaoSequencia ')' comando (Senao comando)?
    ;


comandoIteracao
    : Do comando Enquanto '(' expressaoSequencia ')' fimDoComando                                                               # DoComando
    | Enquanto '(' expressaoSequencia ')' comando                                                                               # EnquantoComando
    | Para '(' (expressaoSequencia | variavelDeclaracaoList)? ';' expressaoSequencia? ';' expressaoSequencia? ')' comando       # ParaComando
    | Para '(' (expressaoUnica | variavelDeclaracaoList) Em expressaoSequencia ')' comando                                      # ParaEmComando
    | Para Aguardar? '(' (expressaoUnica | variavelDeclaracaoList) identificador{this.p("of")}? expressaoSequencia ')' comando  # ParaOfComando
    | Para Cada alvoParaCada (Em | De) expressaoSequencia comando                                                                # ParaCadaComando
    ;

alvoParaCada
    : identificador
    | '{' identificador (',' identificador)? '}'
    ;

varModificador  // let, const - ECMAScript 6
    : Var
//    | let_
    | Const
    ;

comandoContinue
    : Continue ({this.notLinhaTerminador()}? identificador)? fimDoComando
    ;

comandoSustar
    : Sustar ({this.notLinhaTerminador()}? identificador)? fimDoComando
    ;

comandoRetorna
    : Retorna ({this.notLinhaTerminador()}? expressaoSequencia)? fimDoComando
    ;

comandoEscolha
    : Escolha '(' expressaoSequencia ')' blocoDeCaso
    ;

blocoDeCaso
    : '{' clausulasCaso? (clausulaPadrao clausulasCaso?)? '}'
    ;

clausulasCaso
    : caseClausula+
    ;

caseClausula
    : Caso expressaoSequencia ':' listaComandos?
    ;

clausulaPadrao
    : Padrao ':' listaComandos?
    ;

comandoParaPropriedade
    : identificador ':' comando
    ;

comandoFalhar
    : Falhar {this.notLinhaTerminador()}? expressaoSequencia fimDoComando
    ;

comandoTente
    : Tente bloco (blocoPegue blocoFinalmente? | blocoFinalmente)
    ;

blocoPegue
    : Pegue ('(' designavel? ')')? bloco
    ;

blocoFinalmente
    : Finalmente bloco
    ;

comandoAssercao
    : Assercao '(' expressaoUnica (',' expressaoUnica)? ')' fimDoComando
    | Assercao expressaoUnica fimDoComando
    ;

comandoAjuda
    : Ajuda ('(' expressaoUnica? ')')? fimDoComando
    ;

comandoTendoComo
    : Tendo expressaoSequencia Como identificador bloco
    ;

declaracaoFuncao
    : Assincrono? decorador* Funcao_ '*'? identificador '(' listaFormalParametros? ')' (':' identificadorNome)? corpoFuncao
    ;

decorador
    : Arroba identificadorNome argumentos?
    ;

declaracaoClasse
    : Arroba* Classe modificadoresClasse? identificador fimDaClasse
    ;

modificadoresClasse
    : Abstrato Estrangeira? Estatico?
    | Estrangeira Abstrato? Estatico?
    | Estatico
    ;

declaracaoInterface
    : Interface identificador '{' interfaceElemento* '}'
    ;

declaracaoExtensao
    : Extensao De identificadorNome '{' extensaoElemento* '}'
    ;

fimDaClasse
    : (classeHeranca classeImplementacoes? classeMesclas? | classeImplementacoes classeHeranca? classeMesclas?)? '{' classElement* '}'
    ;

classeHeranca
    : Herda expressaoUnica (',' expressaoUnica)*
    ;

classeImplementacoes
    : Implementa identificador (',' identificador)*
    ;

classeMesclas
    : Mescla identificador (',' identificador)*
    ;

classElement
    : (Publico | Privado | Protegido | Estatico | {this.n("static")}? identificador | Assincrono)* (definicaoMetodo | designavel '=' objetoLiteral ';')
    | blocoModificadorAcesso
    | blocoModificadorEstatico
    | blocoModificadorAbstrato
    | sobrecarregaOperador
    | comandoVazio_
    | '#'? nomePropriedade '=' expressaoUnica
    ;

blocoModificadorAcesso
    : (Privado | Protegido) '{' classElement* '}'
    ;

blocoModificadorEstatico
    : Estatico '{' classElement* '}'
    ;

blocoModificadorAbstrato
    : Abstrato '{' classElement* '}'
    ;

sobrecarregaOperador
    : Operador operadorSobrecarga '(' listaFormalParametros? ')' corpoFuncao
    ;

operadorSobrecarga
    : Mais | Menos | Multiplicacao | Divisao | DivisaoInteira | Modulo | Potencia
    | MenosQue | MaiorQue | MenosQueIgual | MaiorQueIgual | Igual_ | NaoIgual
    | And | Or | Not
    ;

interfaceElemento
    : identificador '(' listaFormalParametros? ')' (':' identificadorNome)? PontoEVirgula?
    | identificador ':' identificadorNome PontoEVirgula?
    ;

extensaoElemento
    : identificador '(' listaFormalParametros? ')' (':' identificadorNome)? corpoFuncao
    ;

definicaoMetodo
    : '*'? '#'? nomeMetodo '(' listaFormalParametros? ')' (':' identificadorNome)? corpoFuncao?
    | '*'? '#'? obtenedor '(' ')' corpoFuncao
    | '*'? '#'? definidor '(' listaFormalParametros? ')' corpoFuncao
    ;

nomeMetodo
    : nomePropriedade
    | Construtor
    ;

listaFormalParametros
    : parametroArgumentoFormal (',' parametroArgumentoFormal)* (',' ultimoArgumentoParametroFormal)?
    | ultimoArgumentoParametroFormal
    ;

parametroArgumentoFormal
    : designavel (':' identificadorNome)? ('=' expressaoUnica)?      // Tipos opcionais, valor padrão opcional
    ;

ultimoArgumentoParametroFormal              // ECMAScript 6: Rest Parameter
    : (TresPontos | '*') expressaoUnica
    ;

corpoFuncao
    : '{' elementosFonte? '}'
    ;

vetorLiteral
    : ('[' listaDeElementos ']')
    ;

listaDeElementos
    : ','* elementoVetor? (','+ elementoVetor)* ','* // Yes, everything is optional
    ;

elementoVetor
    : TresPontos? expressaoUnica
    ;

propertyAtribuicao
    : nomePropriedade ':' expressaoUnica                                             # PropertyExpressaoAtribuicao
    | '[' expressaoUnica ']' ':' expressaoUnica                                      # ComputedPropertyExpressaoAtribuicao
    | Assincrono? '*'? nomePropriedade '(' listaFormalParametros?  ')'  corpoFuncao  # FunctionProperty
    | obtenedor '(' ')' corpoFuncao                                                  # PropertyObtenedor
    | definidor '(' parametroArgumentoFormal ')' corpoFuncao                         # PropertyDefinidor
    | TresPontos? expressaoUnica                                                     # PropertyShorthand
    ;

nomePropriedade
    : identificadorNome
    | LiteralTexto
    | numericoLiteral
    | '[' expressaoUnica ']'
    ;

argumentos
    : '('(argumento (',' argumento)* ','?)?')'
    ;

argumento
    : TresPontos? (expressaoUnica | identificador)
    ;

expressaoSequencia
    : expressaoUnica (',' expressaoUnica)*
    ;

expressaoUnica
    : funcaoAnonima                                                     # FunctionExpressao
    | Classe identificador? fimDaClasse                                 # ClasseExpressao
    | Para Cada alvoParaCada (Em | De) expressaoSequencia bloco         # ParaCadaExpressao
    | expressaoUnica '?.' expressaoUnica                                # OptionalChainExpressao
    | expressaoUnica '?.'? '[' expressaoSequencia ']'                   # MemberEmdexExpressao
    | expressaoUnica '?'? '.' '#'? identificadorNome                    # MemberDotExpressao
    // Split to try `new Date()` first, then `new Date`.
    | Novo expressaoUnica argumentos                                    # NovoExpressao
    | Novo expressaoUnica                                               # NovoExpressao
    | expressaoUnica argumentos                                         # ArgumentsExpressao
    | Novo '.' identificador                                            # MetaExpressao // new.target
    | expressaoUnica {this.notLinhaTerminador()}? '++'                  # PostEmcrementExpressao
    | expressaoUnica {this.notLinhaTerminador()}? '--'                  # PostDecreaseExpressao
    | Excluir expressaoUnica                                            # ExcluirExpressao
    | Vazio expressaoUnica                                              # VazioExpressao
    | Tipo De expressaoUnica                                            # TipoDeExpressao
    | '++' expressaoUnica                                               # PreEmcrementExpressao
    | '--' expressaoUnica                                               # PreDecreaseExpressao
    | '+' expressaoUnica                                                # UnaryMaisExpressao
    | '-' expressaoUnica                                                # UnaryMenosExpressao
    | '~' expressaoUnica                                                # BitNotExpressao
    | Not expressaoUnica                                                # NotExpressao
    | Aguardar expressaoUnica                                           # AguardarExpressao
    | <assoc=right> expressaoNaoUnaria '**' expressaoUnica              # PotenciaExpressao
    | expressaoUnica ('*' | '/' | '%') expressaoUnica                   # MultiplicativeExpressao
    | expressaoUnica ('+' | '-') expressaoUnica                         # AdditiveExpressao
    | expressaoUnica '?:' expressaoUnica                                # CoalesceExpressao
    | expressaoUnica ('<<' | '>>' | '>>>') expressaoUnica               # BitShiftExpressao
    | expressaoUnica ('<' | '>' | '<=' | '>=') expressaoUnica           # RelationalExpressao
    | expressaoUnica Contem expressaoUnica                              # ContemExpressao
    | expressaoUnica Not Contem expressaoUnica                          # NaoContemExpressao
    | expressaoUnica Em expressaoUnica                                  # EmExpressao
    | expressaoUnica ('==' | '!=') expressaoUnica                       # EqualityExpressao
    | expressaoUnica '&' expressaoUnica                                 # BitAndExpressao
    | expressaoUnica '^' expressaoUnica                                 # BitXOrExpressao
    | expressaoUnica '|' expressaoUnica                                 # BitOrExpressao
    | expressaoUnica And expressaoUnica                                 # LogicalAndExpressao
    | expressaoUnica Or expressaoUnica                                  # LogicalOrExpressao
    | expressaoUnica '?' expressaoUnica ':' expressaoUnica              # TernaryExpressao
    | <assoc=right> expressaoUnica '=' expressaoUnica                   # AtribuicaoExpressao
    | <assoc=right> expressaoUnica operadorAtribuicao expressaoUnica    # AtribuicaoOperadorExpressao
    | Importar '(' expressaoUnica ')'                                   # ImportarExpressao
    | expressaoUnica templateLiteralTexto                               # TemplateStringExpressao  // ECMAScript 6
    | Isto                                                              # IstoExpressao
    | identificador                                                     # IdentificadorExpressao
    | Super                                                             # SuperExpressao
    | literal                                                           # LiteralExpressao
    | vetorLiteral                                                      # ArrayLiteralExpressao
    | objetoLiteral                                                     # ObjectLiteralExpressao
    | '(' expressaoSequencia ')'                                        # ParenthesizedExpressao
    ;

// Expressões que não iniciam com operador unário prefixado.
// Usada no lado esquerdo de '**' para garantir que '-3 ** 2' seja lido como '-(3 ** 2)'.
expressaoNaoUnaria
    : funcaoAnonima
    | Classe identificador? fimDaClasse
    | Para Cada alvoParaCada (Em | De) expressaoSequencia bloco
    | expressaoNaoUnaria '?.' expressaoUnica
    | expressaoNaoUnaria '?.'? '[' expressaoSequencia ']'
    | expressaoNaoUnaria '?'? '.' '#'? identificadorNome
    | Novo expressaoUnica argumentos
    | Novo expressaoUnica
    | expressaoNaoUnaria argumentos
    | Novo '.' identificador
    | expressaoNaoUnaria {this.notLinhaTerminador()}? '++'
    | expressaoNaoUnaria {this.notLinhaTerminador()}? '--'
    | Importar '(' expressaoUnica ')'
    | expressaoNaoUnaria templateLiteralTexto
    | Isto
    | identificador
    | Super
    | literal
    | vetorLiteral
    | objetoLiteral
    | '(' expressaoSequencia ')'
    ;

designavel
    : identificador
    | vetorLiteral
    | objetoLiteral
    ;

objetoLiteral
    : '{' (propertyAtribuicao (',' propertyAtribuicao)* ','?)? '}'
    ;

funcaoAnonima
    : declaracaoFuncao                                                       # FunctionDecl
    | Assincrono? Funcao_ '*'? '(' listaFormalParametros? ')' corpoFuncao    # AnonymousFunctionDecl
    | Assincrono? arrowFunctionParameters '=>' arrowFunctionCorpo            # ArrowFunction
    ;

arrowFunctionParameters
    : identificador
    | '(' listaFormalParametros? ')'
    ;

arrowFunctionCorpo
    : expressaoUnica
    | corpoFuncao
    ;

operadorAtribuicao
    : '*='
    | '/='
    | '%='
    | '+='
    | '-='
    | '<<='
    | '>>='
    | '>>>='
    | '&='
    | '^='
    | '|='
    | '**='
    ;

literal
    : LiteralNulo
    | LiteralLogico
    | LiteralTexto
    | templateLiteralTexto
    | ExpressaoRegularLiteral
    | numericoLiteral
    | bigintLiteral
    ;

templateLiteralTexto
    : BackTick templateStringAtom* BackTick
    ;

templateStringAtom
    : TemplateStringAtom
    | TemplateStringStartExpressao expressaoUnica TemplateFechaChave
    ;

numericoLiteral
    : DecimalLiteral
    | HexInteiroLiteral
    | OctalInteiroLiteral
    | OctalInteiroLiteral2
    | BinaryInteiroLiteral
    ;

bigintLiteral
    : BigDecimalInteiroLiteral
    | BigHexInteiroLiteral
    | BigOctalInteiroLiteral
    | BigBinaryInteiroLiteral
    ;

obtenedor
    : {this.n("get")}? identificador nomePropriedade
    ;

definidor
    : {this.n("set")}? identificador nomePropriedade
    ;

identificadorNome
    : identificador
    | palavraReservada
    ;

identificador
    : Identificador
    | NonStrictLet
    | Assincrono
    | Como
    ;

palavraReservada
    : palavraChave
    | LiteralNulo
    | LiteralLogico
    ;

palavraChave
    : Sustar
    | Do
    | Tipo
    | Caso
    | Senao
    | Novo
    | Var
    | Pegue
    | Cada
    | Contem
    | Finalmente
    | Retorna
    | Vazio
    | Continue
    | Para
    | Escolha
    | Enquanto
    | Funcao_
    | Isto
    | Com
    | Padrao
    | Se
    | Falhar
    | Excluir
    | Em
    | Tente
    | Tendo
    | Leia
    | Escreva
    | Extensao
    | Abstrato

    | Classe
    | Enum
    | Herda
    | Super
    | Const
    | Exportar
    | Importar
    | Implementa
    | let_
    | Privado
    | Publico
    | Interface
    | Pacote
    | Protegido
    | Estatico
    | Acumular
    | Assincrono
    | Aguardar
    | De
    | Como

    | Ajuda
    | Assercao
    | Construtor
    | Estrangeira
    | Mescla
    | Operador
    | Tudo
    ;

let_
    : NonStrictLet
    | StrictLet
    ;

fimDoComando
    : PontoEVirgula
    | EOF
    | {this.lineTerminadorAhead()}?
    | {this.closeChave()}?
    ;
