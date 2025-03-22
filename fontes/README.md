# Os fontes de Delégua

Todos os fontes de Delégua utilizam o máximo de português possível. Apenas termos próprios de TypeScript são mantidos em inglês. A ideia é facilitar a compreensão de um estudante de compiladores, ou qualquer outra disciplina similar, sobre cada uma das funcionalidades implementadas na linguagem. 

Da forma como está, a linguagem funciona por si só em um ambiente de navegador de internet (JavaScript puro) ou um ambiente por linha de comando, como Node.js e Bun. No passado, haviam certas particularidades de ambiente implementadas diretamente no código, que foram pouco a pouco eliminadas quando houve a divisão deste repositório em três: este, que ainda represente o núcleo da linguagem; [`delegua-node`](https://github.com/DesignLiquido/delegua-node), que possui todas as particularidades de Node.js, como acesso a recursos de rede, sistemas de arquivos e outras funcionalidades relacionadas com o acesso direto ao sistema operacional da máquina onde executa; e, por fim, ([`delegua-web`](http://github.com/DesignLiquido/delegua-web)), que implementa outras particularidades, só que para interação com navegadores de internet.

O estudante poderá verificar que certas partes são marcadas como não implementadas, justamente por serem implementadas nesses projetos específicos. A mais emblemática é a instrução de ler dados da entrada padrão da máquina executando código, feita pela instrução `leia()`. `leia()` no interpretador base espera que uma interface de entrada e saída esteja instanciada no interpretador. Também espera que esta interface possua um método chamado `question()`, normalmente implementado em navegadores de internet. E, por fim, resolve uma `Promise` após a leitura de dados. 

## O que esperar de cada diretório

A ordem recomendada de leitura de cada diretório é:

1. `lexador`
2. `avaliador-sintatico`
3. `interpretador`
4. Demais diretórios

O conteúdo de cada diretório é listado abaixo, com os nomes de cada diretório em ordem alfabética.

* `analisador-semantico`: fontes que implementam a análise semântica de Delégua e demais dialetos contidos neste projeto. A análise semântica começa em um código sintaticamente correto, mas vai no sentido de orientar o usuário a melhorar aspectos como escolhas de tipos, resoluções de certas operações e erros semânticos bem conhecidos, como divisão por zero;
* `avaliador-sintatico`: fontes que implementam a avaliação sintática de Delégua e demais dialetos. A avaliação sintática ocorre após a lexação do código. É a etapa mais importante de todo o ciclo de operação de um código, pois várias outras operações dependem desta para poderem executar, como interpretação, tradução, compilação, e assim por diante;
* `bibliotecas`: fontes que implementam funções nativas da linguagem, como conversões de tipos, e métodos de tipos, estes chamados de "primitivas";
* `construtos`: cada fonte deste diretório representa um construto de linguagem. Um construto pode ser definido como uma microestrutura de linguagem, que por sua vez são componentes de declarações;
* `declaracoes`: cada fonte deste diretório representa uma declaração de linguagem. Uma declaração de linguagem é uma estrutura de alto nível que explica em minúcias um conjunto de instruções de média a alta complexidade. Exemplos de estruturas são atribuições (`Const` e `Var`), laços de repetição (`Para`, `ParaCada`, `Enquanto`, `Fazer`, etc.) e seus respectivos comandos de quebra de fluxo (`Retorna`, `Sustar`), condicionais (`Se`), estruturas de ciclo de vida de variáveis (`TendoComo`) e contingência (`Tente`);
* `depuracao`: fontes que possibilitam o funcionamento de uma máquina de estados para depuração de código. A depuração de código pode executar código de maneira normal ou sequenciada, de forma a explicar ao programador em detalhes o que ocorre naquele ponto do código;
* `estruturas`: fontes que implementam meta-estruturas de linguagem. Em teoria não são visíveis ao programador, mas alguns comandos de introspecção e reflexão, como a instrução `tipo de`, podem fazer uso dessas estruturas para trazer informações importantes ao programador. Devem ser migradas para construtos ou declarações, desaparecendo por completo em versões futuras de Delégua;
* `excecoes`: fontes que implementam diferentes tipos de exceções entre operações. Normalmente, cada fonte estende a classe `Error` de JavaScript, de forma a dar mais contexto sobre a exceção;
* `formatadores`: fontes que implementam formatadores de código. Um formatador de código toma código em Delégua (ou outro dialeto) como estrada, eliminando caracteres desnecessários e estruturando o código de forma visualmente agradável ao programador. Certas preferências nesta estética são configuráveis;
* `geracao-identificadores`: fontes para geração de identificadores únicos, usados para identificar certas estruturas de código em operações como uma execução de código com depuração;
* `interfaces`: fontes dos contratos entre componentes de Delégua. Para evitar problemas de dependência circular, cada componente de Delégua não referencia outro componente diretamente: componentes seguem as interfaces descritas neste diretório, e outros componentes referenciam estas interfaces;
* `interpretador`: fontes que implementam a interpretação, ou execução de código de fato;
* `lexador`: fontes que implementam a fase primordial de avaliação de código: a separação e categorização de todos os símbolos utilizados em um determinado código usado como entrada;
* `quebras`: fontes que implementam quebras. Quebras são interrupções controladas de fluxo, como um retorno de uma função, a interrupção de um laço de repetição, ou a continuação de um laço de repetição sem avaliar o restante do código em um escopo;
* `tipos-de-dados`: fontes que descrevem os tipos que Delégua e outros dialetos trabalham;
* `tipos-de-simbolos`: fontes que especificam quais são os símbolos que cada lexador pode gerar. São fundamentais para a avaliação sintática;
* `tradutores`: fontes que implementam a tradução de um código de uma linguagem para outra. Tradutores tradicionais aqui traduzem de Delégua para outras linguagens de programação de mercado. Tradutores reversos traduzem de diversas linguagens para Delégua.
