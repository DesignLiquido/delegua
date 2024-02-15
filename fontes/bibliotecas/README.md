# Bibliotecas

As bibliotecas de Delégua que não possuem dependência com o Node.js ficam aqui. As demais bibliotecas são pacotes independentes, agregados em outro pacote chamado [`delegua-node`](https://github.com/DesignLiquido/delegua-node). 

São divididas em duas categorias: bibliotecas de métodos tradicionais e bibliotecas de primitivas. 

Bibliotecas de métodos tradicionais são métodos independentes que normalmente trabalham com variáveis e constantes de diferentes tipos. Por exemplo, o método `tamanho()` trabalha com tuplas, dicionários, textos e vetores.

Bibliotecas de primitivas são métodos que pertencem a estruturas de dados elementares da linguagem. Por exemplo:

```js
escreva("1 2 3".dividir(' ')) // Imprime um vetor, [1, 2, 3]
```

Neste caso, `"1 2 3"` é um literal de texto. Como Delégua tenta ser puramente orientada a objetos, estruturas de dados elementares são, a rigor, classes, e suas variáveis, constantes e literais são objetos dessas classes.