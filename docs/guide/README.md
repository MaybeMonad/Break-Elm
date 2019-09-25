---
sidebar: auto
---

# 简介

**Elm 是一种可编译为 JavaScript 的函数式语言。** 作为一款创建网站和 Web 应用的工具，它与像 React 这样的项目相互竞争。Elm 非常重视简洁、易用及高质量工具。

本指南将：

+ 教授 Elm 编程的基础知识。
+ 展示如何使用 *Elm 架构* 创建交互应用。
+ 强调适用于任何编程语言的原理和模式。

最后，我希望你不仅能够用 Elm 创建出色的 Web 应用，还能理解使 Elm 易于使用的核心思想和模式。

如果你还在犹豫，我可以放心给你保证，倘若你尝试 Elm 并且将它应用在实际项目中，那么最终你将能码出更好的 JavaScript 和 React 代码。这其中的思想可以轻松移植！

## 快速示例

当然，我认为 Elm 很不错，所以也请你来看看。

这是一个简单的[计数器](https://elm-lang.org/examples/buttons)，看下代码你就能知道它只允许你递增或递减计数器中的数值。

```elm
import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

main =
  Browser.sandbox { init = 0, update = update, view = view }

type Msg = Increment | Decrement

update msg model =
  case msg of
    Increment ->
      model + 1

    Decrement ->
      model - 1

view model =
  div []
    [ button [ onClick Decrement ] [ text "-" ]
    , div [] [ text (String.fromInt model) ]
    , button [ onClick Increment ] [ text "+" ]
    ]
```

请注意，`update` 和 `view` 是完全解耦的。你以声明的方式来描述 HTML，而 Elm 负责处理 DOM。

## 为什么是*函数式*语言？

忘记关于函数式编程的知识，那不过是花哨的字眼，夹杂晦涩的概念，再加上糟糕的工具...🤮

Elm 则是：

+ 在实际中没有运行时错误，没有 `null`，也不会有 `undefined is not a function` 错误。
+ 友好的报错提示助你更快速地添加功能。
+ 结构良好的代码可以随着应用的增长而依然**保持**良好的结构。
+ 对所有 Elm 包自动执行语义版本控制。

没有任何 JS 库的组合可以给你这些，而这些在 Elm 中是不受约束的，你可以轻松使用。Elm 能拥有这些吸引人的特点，是建立在 40 多年的类型化函数式语言工作的基础上，所以 Elm 是一种函数式语言，这就值得你花接下来的几个小时来阅读本指南。

我一直非常重视使 Elm 易于学习和使用，所以我希望你能尝试使用 Elm，顺便听听你的想法。我希望你能感到惊喜！


# 安装

