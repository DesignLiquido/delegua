# Interpretador

O interpretador é o componente de Delégua que efetivamente executa todo o código fornecido. Pode ser uma ou várias linhas. 

Normalmente dialetos derivam do interpretador de Delégua, e variações podem ocorrer. Por exemplo, o interpretador de VisuAlg herda o interpretador de Delégua mas executa algumas partes de forma diferente, como a instrução `escreva()`. 

A única exceção até então é o interpretador de Égua Clássico. O motivo é a forma como o interpretador original da linguagem Égua importa diferentes arquivos durante a execução, além de uma etapa de "resolução de variáveis", que os demais dialetos não possuem.

## Interpretador, Construtos e Declarações

Construtos e declarações não conhecem a implementação completa de um interpretador: apenas a interface correspondente, que expõe os métodos de visita.

Cada declaração e cada construto possuem um método de visita correspondente no interpretador. Em outras palavras, o interpretador chama o método aceitar do construto ou declaração, que aponta de volta para o interpretador qual método executar dele mesmo. 

Um exemplo de fluxo:

```js
escreva('Olá mundo')
```

A sequência algorítmica de passos para executar essa instrução é:

- Interpretador chama método `aceitar()` da declaração `Escreva`, passando a si mesmo como argumento do método;
- O método `aceitar()` da declaração `Escreva`, por sua vez, chama o método `visitarDeclaracaoEscreva()` do interpretador, passando a si mesmo como argumento do método;
- `visitarDeclaracaoEscreva()` recebe como argumento o objeto da declaração `Escreva`, com todas as informações para a execução. O método confere os argumentos (neste caso, apenas um, "Olá mundo"), formata esses argumentos como texto e os escreve na saída padrão. A saída padrão normalmente é o objeto `console` do ambiente de execução, mas pode ser outro quando configurado antes da execução.

## Interpretador com depuração

O interpretador com depuração de Delégua herda do interpretador tradicional, mas a lógica é mais complexa para suportar os comandos e funcionalidades de mecanismos de depuração, que são:

- Executar normalmente, até que um ponto de parada seja encontrado (comando "continuar");
- Executar apenas uma instrução, sem necessariamente adentrar um escopo (comando "próximo");
- Adentrar um escopo e talvez executar uma instrução (comando "adentrar escopo");
- Executar as demais instruções de um escopo e sair dele, parando na próxima instrução do escopo anterior (comando "próximo e sair").

Esse interpretador é controlado pelo servidor de depuração. A forma de manter a aplicação executando indefinidamente, esperando pelos comandos do usuário, é feita através de um _stream_ (fluxo de entrada e saída) aberto na forma de um _Socket_, um canal de comunicação por TCP/IP na porta 7777. [Mais informações podem ser encontradas no README.md correspondente](https://github.com/DesignLiquido/delegua/blob/principal/fontes/depuracao/README.md).

A implementação mais fácil de entender neste interpretador é a do comando "continuar", exatamente por ser muito parecida com a implementação do interpretador tradicional. Um laço de repetição executa todas as declarações até que um ponto de parada seja encontrado, se houver. Se não houver pontos de parada, a execução é idêntica à de uma execução trivial, com alguma redução de performance com as conferências necessárias dos pontos de parada. Se houver pontos de parada, o interpretador com depuração avisa o servidor de depuração que um ponto de parada foi encontrado, e que um dos quatro comandos são necessários para reiniciar a execução.

Já o comando "próximo" requer um fluxo separado de execução porque o interpretador com depuração precisa calcular o que precisa ser executado, e isso depende do que tem na instrução corrente. Por exemplo:

```js
escreva(2 + 2)
escreva(2 * 5)
```

Isso é um exemplo trivial. Para a primeira linha, o interpretador com depuração executa uma, e apenas uma, instrução e nada mais, pedindo em seguida ao servidor de depuração o próximo comando. Não há abertura de escopos e não há processamento de pontos de parada. Após o comando "próximo", o interpretador ficará parado na segunda instrução, até que o servidor de depuração receba o comando seguinte. 

Um primeiro exemplo não trivial para o comando "próximo" seria algo como:

```js
var a = 2;
se (a == 1) {
  escreva('correspondente 1');
} senao se (a == 2) {
  escreva('correspondente 2');
} senao {
  escreva('sem valor correspondente');
}
```

Neste código temos três aberturas de escopo, sendo uma para a condição da primeira declaração `Se` avaliada como verdadeira, uma para a condição da segunda declaração `Se` avaliada como verdadeira (após o caminho "senão"), e uma terceira abertura de escopo para o caso de as duas condições avaliadas serem falsas.

Na execução da segunda linha (`se (a == 1)`) temos o resultado `falso`, o que implica na execução da segunda condição, que tem o resultado `verdadeiro`. O interpretador, então, abre um bloco de escopo em memória com apenas uma declaração (`escreva('correspondente 2');`) mas não executa essa instrução. O controle é devolvido ao servidor de depuração para aguardar o próximo comando. 

Esta é a parte pouco intuitiva de Delégua sobre adentrar um escopo sem o uso de um comando "adentrar-escopo". Para escopos das instruções a seguir:

- `enquanto`
- `fazer ... enquanto`
- `para`
- `se ... senão`
- `tente ... pegue ... finalmente`

A execução de um comando "próximo" adentrará algum escopo, a não ser que as respectivas condições sejam falsas. 

Já para uma execução de função declarada em Delégua, como no exemplo abaixo:

```js
funcao somar(numero1, numero2) {
    retorna(numero1 + numero2)
}

escreva(somar(6, 7))
escreva("Última linha")
```

A execução da linha 5 executa a função `somar`, mas o comando não adentra o escopo: o escopo é executado completamente e a execução pára na linha 6 (`escreva("Última linha")`). 

### Persistência de Valores de Chamadas

Outro problema que uma execução cadenciada por vários comandos "próximo" possui pode ser ilustrado com o exemplo de Fibonacci:

```js
funcao fibonacci(n) {
  se (n == 0) {
    retorna(0);
  }

  se (n == 1) {
    retorna(1);
  }

  var n1 = n - 1;
  var n2 = n - 2;
  var f1 = fibonacci(n1);
  var f2 = fibonacci(n2);
  retorna(f1 + f2);
}

var a = fibonacci(0);
escreva(a);
a = fibonacci(1);
escreva(a);
a = fibonacci(2);
escreva(a);
var a = fibonacci(3);
escreva(a);
a = fibonacci(4);
escreva(a);
a = fibonacci(5);
escreva(a);
```

Suponha que um desenvolvedor coloque um ponto de parada na linha 17 (`var a = fibonacci(0);`) e outro na linha 2 (`se (n == 0)`). Ao parar na linha 17, o desenvolvedor não quer ir para a linha 18, mas sim ver o que ocorre das linhas 2 em diante. O desenvolvedor, então, envia um comando "próximo", o que cria um escopo e faz o interpretador apontar para a linha 2. Ao enviar outro comando "próximo", o interpretador abre mais um escopo (o da linha 3, ou seja, `retorna(0);`) e aponta para a linha 3. Num terceiro comando "próximo", o interpretador retorna o valor `0`, encerra o escopo aberto por `se (n == 0)` e também encerra o escopo da função, voltando a apontar para a linha 17. 

Desta vez, mesmo que o desenvolvedor peça para adentrar o escopo, o interpretador simplesmente atribui `a` com o valor `0` (o retorno da execução da função) e passa a apontar para a linha 18. Isso ocorre porque o valor da execução de `fibonacci(0)` já foi resolvido. 

Para que isso seja possível de ser implementado, o interpretador precisa designar identificadores únicos para cada construto de chamada de função ou método de classe. A forma de fazer isso é gerando GUIDs (UUIDs) para cada construto de chamada no momento da criação desses construtos. GUIDs (ou UUIDs) são estruturas de dados cujo valor tem uma chance de colisão tão baixa (ou seja, é praticamente impossível gerar dois valores iguais durante uma execução) que podemos considerar esses valores como únicos. Tendo esses identificadores, podemos guardar os resultados da execução de cada chamada de função no espaço de variáveis de [escopos de execução do interpretador](https://github.com/DesignLiquido/delegua/blob/principal/fontes/interfaces/escopo-execucao.ts). 

Por que precisamos manter isso? Porque, tecnicamente, cada execução em passo (comando "próximo", comando "adentrar-escopo") faz com que o interpretador perca boa parte do contexto de execução. Se por exemplo temos um escopo com 10 instruções e paramos a execução na terceira instrução para esperar o próximo comando do desenvolvedor, os valores que não foram definidos em variáveis simplesmente evaporam. Por isso foi criado na estrutura de espaço de variáveis um dicionário chamado `resolucoesChamadas`, em que a chave de cada entrada é o identificador único da chamada, mais os valores resolvidos de cada argumento, e o valor é o retorno já resolvido da chamada. Isso garante ao interpretador recuperar valores de chamadas feitas anteriormente, não importando quantas vezes o código parou e reiniciou. A chave de entrada contém os argumentos para evitar problemas em chamadas recursivas (o que poderia acontecer em neste algoritmo de Fibonacci).

