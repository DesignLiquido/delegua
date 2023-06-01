# Avaliador Sintático para dialeto Potigol

Aqui temos toda a implementação da avaliação sintática para Potigol separada em dois elementos:

- `AvaliadorSintaticoPotigol`: O avaliador sintático em si;
- `MicroAvaliadorSintaticoPotigol`: O micro avaliador sintático, usado para inferência de parâmetros e pequenas operações de expressões.

## Características de Potigol

### Tipos e Objetos

Cada tipo em Potigol implementa um construtor implícito: cada propriedade anotada com tipo e sem valor é entendida como parte do construtor. Por exemplo;

```
tipo Quadrado
  lado: Inteiro
  area() = lado * lado
  perimetro() = 4 * lado
fim
```

`lado: Inteiro` irá gerar um construtor com um parâmetro inteiro:

```
q1 = Quadrado(10)
```

A ordem das propriedades é importante para a definição do construtor.