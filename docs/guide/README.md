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

## 语言核心

本节将带你了解 Elm 的语言核心。

按照步骤来操作的学习效果是最好的，在完成安装后，前往终端运行 `elm repl` 命令后可以看到如下信息：

```bash
---- Elm 0.19.0 ----------------------------------------------------------------
Read <https://elm-lang.org/0.19.0/repl> to learn more: exit, help, imports, etc.
--------------------------------------------------------------------------------
>
```

REPL 会打印每个输出结果的类型，但为了逐步介绍这些概念，**我们在本节中将省略类型注释**。

我们将介绍[值](/guide/#值)、[函数](/guide/#函数)、[列表](/guide/#列表)、[元组](/guide/#元组)和[记录](/guide/#记录)。这些构建块与 JavaScript、Python 和 Java 的语言结构都非常接近。

### 值

让我们先从一些字符串开始。

```bash
> "hello"
"hello"

> "hello" ++ "world"
"helloworld"

> "hello" ++ " world"
"hello world"
```

Elm 使用 `(++)` 运算符来组合字符串。需要注意的是两个字符串组合在一起时会保留其原样，所以当我们合并 `hello` 和 `world` 时，结果中是没有空格的。

数字运算看上去也是正常的。

```bash
> 2 + 3 * 4
14

> (2 + 3) * 4
20
```

但与 JavaScript 不同的是，Elm 区分整数和浮点数。就像 Python 3 一样，既有浮点除法 `(/)`，也有整数除法 `(//)`。

### 函数

我们先从编写一个能检查数字是否小于零的 `isNegative` 函数开始，其输出结果将是 `True` 或 `False`。

```bash
> isNegative n = n < 0
<function>

> isNegative 4
False

> isNegative -7
True

> isNegative (-3 * -4)
False
```

值得注意的是这里的函数表达式与 JavaScript、Python 和 Java 之类的语言有所不同。在 Elm 中，不需要将所有参数放在括号中并使用逗号隔开，而只需用空格隔开。`(add(3,4))` 就可以写成 `(add 3 4)`，从而避免了一堆括号和逗号的使用而使代码凸显臃肿。最终，一旦你习惯了，这一切看上去就会更干净清爽，[elm/html](https://elm-lang.org/blog/blazing-fast-html-round-two) 包就是一个非常好的例子。

你也可以这样定义*匿名函数*：

```bash
> \n -> n < 0
<function>

> (\n -> n < 0) 4
False
```

此匿名函数的作用与 `isNagetive` 是一样的，只是未命名。同样，在 `(\n -> n < 0) 4` 的括号很重要，箭头之后，Elm 会继续读取代码，而括号划出了函数体的范围，即有助于 Elm 理解 `4` 是该函数的参数。

> 如果不仔细看你会觉得这反斜杠的匿名函数看起来像 lambda `λ`，但这对于形成类似 Elm 语言的思想史来说，可能是一个错误的想法。

### If 表达式

如果想在 Elm 中进行条件判断，可以使用 if-expression。

```bash
> if True then "hello" else "world"
"hello"

> if False then "hello" else "world"
"world"
```

Elm 使用关键字 `if`、`then`、`else` 来分隔条件及不同的结果，因此不需要使用括号或花括号。

Elm 中没有“真实性”的概念，如果我们尝试能将数字、字符串和列表作为布尔值，Elm 就会提示我们需要使用真实的布尔值。

现在我们来创建一个能判断数字是否超过 9000 的函数。

```bash
> over9000 powerLevel = \
|   if powerLevel > 9000 then "It's over 9000!!!" else "meh"
<function>

> over9000 42
"meh"

> over9000 100000
"It's over 9000!!!"
```

如上，在 REPL 中使用反斜杠可以将内容分割成多行。此外，将函数的主体放置于函数声明的下一行是推荐的最佳实践做法，这能让代码看上去更统一且易于阅读。

> 注意：在另起一行的函数体前要添加空格，因为 Elm 具有“语法意义的空白”，即缩进是其语法的一部分。

### 列表

列表是 Elm 中最常见的数据结构之一，可以存放一系列相关的内容，类似 JavaScript 中的数组。列表可以包含很多值，但**这些值必须具有相同的类型**。

以下是一些列表的示例：

```bash
> names = [ "Alice", "Bob", "Chuck" ]
["Alice","Bob","Chuck"]

> List.isEmpty names
False

> List.length names
3

> List.reverse names
["Chuck","Bob","Alice"]

> numbers = [1,4,3,2]
[1,4,3,2]

> List.sort numbers
[1,2,3,4]

> double n = n * 2
<function>

> List.map double numbers
[2,8,6,4]
```

重申一遍，列表中的所有元素必须是相同的类型的值。

### 元组

元组是另一个有用的数据结构。元组可以容纳固定数量的值，且每个值都可以是任意类型。一种常见的用法是当你需要从一个函数返回多个值，如以下函数中通过获取名称来给用户提供消息：

```bash
> import String

> goodName name = \
|   if String.length name <= 20 then \
|     (True, "name accepted!") \
|   else \
|     (False, "name was too long; please limit it to 20 characters")

> goodName "Tom"
(True, "name accepted!")
```

这样确实挺方便，但如果结果比较复杂，最好是使用记录而不是元组。

### 记录

[记录](https://zh.wikipedia.org/wiki/记录)是一组固定的键值对，类似于 JavaScript 和 Python 中的对象。你会发现记录在 Elm 是非常普遍且实用的！

让我们来看一些例子：

```bash
> point = { x = 3, y = 4 }
{ x = 3, y = 4 }

> point.x
3

> bill = { name = "Gates", age = 62 }
{ age = 62, name = "Gates" }

> bill.name
"Gates"
```

如上，我们可以使用花括号来创建记录，并使用点访问字段。Elm 还有一个类似函数的方法访问字段，通过在字段前添加点，即告诉 Elm，请使用以下字段名称访问该记录，也就意味着 `.name` 函数可以读取带有 `name` 字段的记录。

```bash
> .name bill
"Gates"

> List.map .name [bill,bill,bill]
["Gates","Gates","Gates"]
```

在使用记录创建函数时，你可以先进行模式匹配（译者注：类似于 JavaScript 中的参数解构）让代码更简洁。

```bash
> under70 {age} = age < 70
<function>

> under70 bill
True

> under70 { species = "Triceratops", age = 68000000 }
False
```

因此，我们可以传递任何包含有 `age` 字段且对应数字值的记录。

更新记录中的值通常很有用。

```bash
> { bill | name = "Nye" }
{ age = 62, name = "Nye" }

> { bill | age = 22 }
{ age = 22, name = "Gates" }
```

**值得注意的是**，我们没有进行*破坏性*的更新。当我们更新某些字段时，`bill` 实际上是新创建的记录，而非覆盖原有记录。Elm 是通过共享尽可能多的内容来提高效率。如果你更新十个字段中的一个，则新记录会共享九个不变的值。

> #### 记录与对象
> 
> Elm 中的记录类似于 JavaScript 中的对象，但有一些重要的区别。对于记录而言：
> 
> + 你无法获取一个不存在的字段
> + 没有字段会是 `undefined` 或 `null`
> + 不能使用 `this` 或 `self` 关键字创建递归记录
> 
> Elm 鼓励严格分离数据和逻辑，而 `this` 的使用是破坏这种分离的主要原因。这是 Elm 特意避免的在面向对象语言的存在的系统性问题。
> 
> 记录还支持[结构化类型](https://en.wikipedia.org/wiki/Structural_type_system)（译者注：类似 Golang 中的 Struct），这意味着只要存在必要的字段，Elm 中的记录就可以在任何情况下使用。这为我们提供了灵活性又不失可靠性。
