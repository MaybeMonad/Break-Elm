---
sidebar: auto
---

# Elm 中文文档

## 简介

**Elm 是一种可编译为 JavaScript 的函数式语言。** 作为一款创建网站和 Web 应用的工具，它与像 React 这样的项目相互竞争。Elm 非常重视简洁、易用及高质量工具。

本指南将：

+ 教授 Elm 编程的基础知识。
+ 展示如何使用 *Elm 架构* 创建交互应用。
+ 强调适用于任何编程语言的原理和模式。

最后，我希望你不仅能够用 Elm 创建出色的 Web 应用，还能理解使 Elm 易于使用的核心思想和模式。

如果你还在犹豫，我可以放心给你保证，倘若你尝试 Elm 并且将它应用在实际项目中，那么最终你将能码出更好的 JavaScript 和 React 代码。这其中的思想可以轻松移植！

### 快速示例

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

### 为什么是*函数式*语言？

忘记关于函数式编程的知识，那不过是花哨的字眼，夹杂晦涩的概念，再加上糟糕的工具...🤮

Elm 则是：

+ 在实际中没有运行时错误，没有 `null`，也不会有 `undefined is not a function` 错误。
+ 友好的报错提示助你更快速地添加功能。
+ 结构良好的代码可以随着应用的增长而依然**保持**良好的结构。
+ 对所有 Elm 包自动执行语义版本控制。

没有任何 JS 库的组合可以给你这些，而这些在 Elm 中是不受约束的，你可以轻松使用。Elm 能拥有这些吸引人的特点，是建立在 40 多年的类型化函数式语言工作的基础上，所以 Elm 是一种函数式语言，这就值得你花接下来的几个小时来阅读本指南。

我一直非常重视使 Elm 易于学习和使用，所以我期待你能尝试使用 Elm，顺便听听你的想法，希望你能感到惊喜！

## 安装

+ Mac - [安装程序](https://github.com/elm/compiler/releases/download/0.19.0/installer-for-mac.pkg)
+ Windows - [安装程序](https://github.com/elm/compiler/releases/download/0.19.0/installer-for-windows.exe)
+ 任意平台 - [直接下载](https://github.com/elm/compiler/releases/tag/0.19.0)或 [NPM](https://www.npmjs.com/package/elm)

通过以上任一方式安装 Elm 后，你就可以在终端使用 `Elm` 命令。

### 终端工具

现在我们的终端已经有了 `Elm` 命令，但它到底能做什么呢？

#### `elm repl`

`elm repl` 能让我们在终端中使用 Elm 表达式。

```bash
$ elm repl
---- Elm 0.19.0 ----------------------------------------------------------------
Read <https://elm-lang.org/0.19.0/repl> to learn more: exit, help, imports, etc.
--------------------------------------------------------------------------------
> 1 / 2
0.5 : Float
> List.length [1,2,3,4]
4 : Int
> String.reverse "stressed"
"desserts" : String
> :exit
$
```

我们将在接下来的[语言核心](/guide/#语言核心)章节使用 `elm repl`，你也可以阅读[此处](https://elm-lang.org/0.19.0/repl)了解其工作方式。

> 注意：`elm repl` 通过将代码编译成 JavaScript 起作用，请确保已安装 Node.js，我们使用它来评估代码。

#### `elm reactor`

`elm reactor` 能帮助你构建项目而不需要额外的操作，你只需要在项目根目录下依次运行如下代码：

```bash
git clone https://github.com/evancz/elm-architecture-tutorial.git
cd elm-architecture-tutorial
elm reactor
```

这将会启动服务器 `http://localhost:8000`（译者注：如果你的 8000 端口已被占用，可以使用 `elm reactor --port=8001` 启动）。现在你可以打开任一 Elm 文档，预览其页面，比如打开 `examples/01-button.elm`。

#### `elm make`

`elm make` 用于构建 Elm 项目。它可以将 Elm 代码编译为 HTML 或 JavaScript，这是编译 Elm 代码最通用的方式。若你的项目对于 `elm reactor` 来说有些吃力，那你可以直接使用 `elm make` 来构建。

假设你要将 `Main.elm` 编译为 `main.html` 的 HTML 文档，可以运行以下代码：

```bash
elm make Main.elm --output=main.html
```

#### `elm install`

Elm 包都列在 [package.elm-lang.org](https://package.elm-lang.org/) 中。

假设你环顾代码后确定需要 `elm/http` 和 `elm/json` 来发起一些 HTTP 请求，那你可以在项目中使用以下命令来设置：

```bash
elm install elm/http
elm install elm/json
```

这会将这些依赖库添加至项目的 `elm.json` 文件中，你可以在[此处](https://github.com/elm/compiler/blob/master/docs/elm.json/application.md)查看详细说明。

### 摘要

`elm` 命令可以做很多事，但你无需担心记不住这一切，你可以使用 `elm --help` 或者 `elm repl --help` 命令获取这些命令的丰富信息。

接下来，我们将会学习 Elm 的基础知识。

> #### 配置你的编辑器？
> 
> 设置其中一些编辑器可能很棘手，所以你现在可以先跳过这一步，仅用在线的编辑器你一样可以获得不错的体验。
> 
> 以下是一些 Elm 社区维护的插件：
> 
> + [Atom](https://atom.io/packages/language-elm)
> + [Brackets](https://github.com/lepinay/elm-brackets)
> + [Emacs](https://github.com/jcollard/elm-mode)
> + [IntelliJ](https://github.com/klazuka/intellij-elm)
> + [Light Table](https://github.com/rundis/elm-light)
> + [Sublime Text](https://packagecontrol.io/packages/Elm%20Language%20Support)
> + [Vim](https://github.com/ElmCast/elm-vim)
> + [VS Code](https://github.com/sbrink/vscode-elm)
> 
> 如果你还没有编辑器，Sublime Text 会是一个不错的入门选择（译者用的是 VS Code，没毛病）。
> 
> 你应该还会想要试试 [elm-format](https://github.com/avh4/elm-format)，它可以让你的代码看上去更漂亮！