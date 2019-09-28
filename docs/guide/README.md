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

## Elm 架构

Elm 架构是一种用于构建 Web 应用的简易范式，它非常适合模块化、代码复用和代码测试。最终，它能使**创建易重构、易扩展、复杂而又稳定的 Web 应用**变得更容易。

Elm 的这种架构像是自然而然出现的。早期的 Elm 开发人员不是在“发明”它，而是一直在他们的代码中找寻共同拥有的最简范式。后来开发团队发现这些对于新手特别友好，能使代码结构更加合理。这一切听上去就跟见鬼了似的。

这在 Elm 中如鱼得水般的核心架构，对其他任何前端项目都是有用的。实际上，像 Redux 这样的项目都是受到了 Elm 架构的启发，因此你可能已经看到过这种范式的衍生。当然，重点是，即使最终你不会在工作中使用 Elm，你还是能通过尝试 Elm 和吸收其设计思想来获得诸多好处。

#### 基本范式

每一个 Elm 的程序逻辑都能被清晰地分解为三个部分：

+ Model - 你的程序状态（译者注：类 Redux 中的 State）
+ Update - 更新状态的方法（译者注：类 Redux 中的 Dispatch）
+ View - 以 HTML 方式查看状态

这种模式是如此可靠，以至于我总是从下面的框架开始，然后丰富细节。

```elm
import Html exposing (..)


-- MODEL

type alias Model = { ... }


-- UPDATE

type Msg = Reset | ...

update : Msg -> Model -> Model
update msg model =
  case msg of
    Reset -> ...
    ...


-- VIEW

view : Model -> Html Msg
view model =
  ...
```

这就是 Elm 架构的精髓！我们将用更多有趣的逻辑去丰满这个骨架。

#### Elm 架构 + 用户输入

你的 Web 应用需要处理用户输入，本节将通过以下内容带你熟悉 Elm 架构：

+ 按钮
+ 文本输入框
+ 多选框
+ 单选框
+ 等等

我们将通过一些示例来逐步建立知识体系，所以请按顺序阅读！

#### 继续

在上一节中，我们通过 `elm repl` 熟悉了 Elm 表达式。本节我们将创建自己的 Elm 文件，你可以通过[在线编辑器](https://elm-lang.org/try)或本机安装 Elm 来执行操作。你可以按照这个[简易说明](https://github.com/evancz/elm-architecture-tutorial#run-the-examples)在你电脑上操作。

### 按钮

前往[在线编辑器示例](https://elm-lang.org/examples/buttons)

我们的第一个示例是一个可以加减数字的计数器。把整个程序放在同一个地方真的太方便了（译者注：就跟 Vue 一样，无需额外 js、css 等，没有不停切换于不同文档间的烦恼）。接下来我们开始分解程序。

```elm
import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)


main =
  Browser.sandbox { init = init, update = update, view = view }


-- MODEL

type alias Model = Int

init : Model
init =
  0


-- UPDATE

type Msg = Increment | Decrement

update : Msg -> Model -> Model
update msg model =
  case msg of
    Increment ->
      model + 1

    Decrement ->
      model - 1


-- VIEW

view : Model -> Html Msg
view model =
  div []
    [ button [ onClick Decrement ] [ text "-" ]
    , div [] [ text (String.fromInt model) ]
    , button [ onClick Increment ] [ text "+" ]
    ]
```

这就是所有代码！

> 注意：代码中有出现 `type` 和 `type alias` 的声明，你可以在后面关于*类型*的部分了解这些内容。你现在还不需要深入了解这些内容，除非你觉得有必要。

从头开始编写该程序时，我通常会先估计 Model 所包含的内容。要进行计数，我们至少需要一个能加减的数字，所以我们就可以声明如下：

```elm
type alias Model = Int
```

现在我们定义好了 Model，接着我们需要定义它的更新规则，通常我会定义一组能通过 UI 层传递的消息来描述更新方式：

```elm
type Msg = Increment | Decrement  -- 译者注：Msg 可以等同于 Redux 中的 Action
```

我能肯定用户是需要操作计数器的加减，而 Msg 将加减功能描述为*数据*，这很关键！至此，`update` 方法只需根据接收到的不同消息来定义不同的更新。

```elm
update : Msg -> Model -> Model
update msg model =
  case msg of
    Increment ->
      model + 1

    Decrement ->
      model - 1
```

如果接收到 `Increment` 消息，则执行递增状态值，反之递减，非常清晰明了。

Okay，这一切看上去很完美，但我们如何添加 HTML ？Elm 有一个库叫 `elm/html`，可以完整实现 HTML5。

```elm
view : Model -> Html Msg
view model =
  div []
    [ button [ onClick Decrement ] [ text "-" ]
    , div [] [ text (String.fromInt model) ]
    , button [ onClick Increment ] [ text "+" ]
    ]
```

需要注意的是，我们的 `view` 方法会生成一个 `Html Msg` 的值，这就意味着它是能生成 `Msg` 的 HTML 块。当你看具体的定义时会发现，`onClick` 被赋值为 Increment 和 Decrement，而这些都会直接传递给 `update` 方法来实现更新。

另外需要注意的是 `div` 和 `button` 只是普通的 Elm 函数。这些函数是由属性树和子节点树组成，只是语法略有不同的 HTML。相对于 HTML 中随处可见的 `<>`，在 Elm 中用 `[]` 代替，熟悉 HTML 的人可以轻松上手。那为什么不做的和 HTML 完全一致呢？**因为在 Elm 中函数比比皆是，我们完全可以利用这一语言特性来实现视图层**！我们可以将重复的代码重构为函数，再将这些辅助函数放入模块中，然后就可以像引入其他代码一样引入它们。我们还可以使用与其他 Elm 代码相同的测试框架和库。Elm 的这些优秀特性可以 100% 支撑起你对视图构建的需求，你无需使用所谓的模板语言。

更深层地看，**视图代码完全是声明性的**，我们接收 `Model` 进而生成 `Html`。换句话说，我们无需手动更改 DOM，Elm 在底层接管处理，而这也给了 Elm 更多的空间去优化结构并最终使渲染速度*更快*。因此，你编写的代码更少，运行更快，这就是最好的抽象！

以上所展示的范式就是 Elm 架构的精髓，接下去我们看到的每个例子都只是这个基本范式（`Model`、`update` 和 `view`）的衍生。

> **练习**：Elm 架构的一个优秀之处在于随着产品需求的变化，我们可以轻易扩展程序。假设你的产品经理提出了这个神奇的“重置”功能，即用一个按钮实现计数器清零。
> 
> 为了添加这个功能，我们要先回到 Msg 添加新可能，比如 `Reset`，然后前往 `update` 方法描述接收该消息时的更新行为，最后在视图中添加一个按钮。
> 
> 看看你能否实现这个“重置”功能。

### 文本输入框

前往[在线编辑器示例](https://elm-lang.org/examples/text-fields)

我们将创建一个简单的应用程序来实现文本输入内容的反转。

同样，我们可将这个简易程序包含在一个文档内，先略读一遍，理清结构，然后我们开始深入剖析！

```elm
import Browser
import Html exposing (Html, Attribute, div, input, text)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)



-- MAIN


main =
  Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
  { content : String
  }


init : Model
init =
  { content = "" }



-- UPDATE


type Msg
  = Change String


update : Msg -> Model -> Model
update msg model =
  case msg of
    Change newContent ->
      { model | content = newContent }



-- VIEW


view : Model -> Html Msg
view model =
  div []
    [ input [ placeholder "Text to reverse", value model.content, onInput Change ] []
    , div [] [ text (String.reverse model.content) ]
    ]
```

可以看出来，该代码与上一节的计数器代码很接近，一样都定义了 Model、Msg、update 和 view，差别只是在于如何填充这一框架，那让我们逐步开始说明。

通常一开始你还是要先估计 Model 会包含哪些状态值，在这个案例中，我们清楚知道需要追踪用户在文本框中输入的内容，因为我们需要拿到这些文本内容来呈现反向的文本。

```elm
type alias Model =
  { content : String
  }
```

这次我们将 Model 定义为一个记录，你可以在[此处](https://guide.elm-lang.org/core_language.html#records)和[此处](https://elm-lang.org/docs/records)阅读有关**记录**的更多信息。该记录表示将用户输入内容存储在 `content` 字段中。

> 注意：你可能会问，只是保存单个值，何必用记录呢？直接用字符串不行吗？当然可以！但随着应用的变得越来越复杂，用记录可以轻松添加新字段，比如我们需要两个输入框时，我们就可以减少不必要的操作。

Okay，我们有了 Model，接着我们就需要定义消息类型，这里只需要一种，即用户更改文本的字段。

```elm
type Msg
  = Change String
```

这意味着我们的更新函数只需要处理这种情况：

```elm
update : Msg -> Model -> Model
update msg model =
  case msg of
    Change newContent ->
      { model | content = newContent }
```

当接收到新内容时，我们使用记录的更新语法来更新 `content`。

最后看一下该程序的视图。

```elm
view : Model -> Html Msg
view model =
  div []
    [ input [ placeholder "Text to reverse", value model.content, onInput Change ] []
    , div [] [ text (String.reverse model.content) ]
    ]
```

我们创建的 `div` 有两个子节点，其中有趣的是 `input` 子节点，除了 `placeholder` 和 `value` 属性外，还声明了 `onInput` 来描述当用户输入时执行的消息传递。

此 `onInput` 函数有趣的地方在于它接收的这个 `Change` 函数在我们定义 `Msg` 类型时就创建了。

```elm
Change : String -> Msg
```

该函数用于标记当前存在于文本输入框中的内容。假设现在文本输入框中已有 `glad`，然后当用户输入字母 e，就会触发 `input` 事件，于是我们就会在 `update` 中接收到一个承载 `Change "glade"` 的新消息。

现在我们已经实现了对单个文本输入框的操作，不错！接下来我们组合多个文本输入框来实现更常见的表单形式。

### 表单

前往[在线编辑器示例](https://elm-lang.org/examples/forms)

现在我们要做一个包含 name、password 和 passwordAgain 三个字段的基础表单，需要校验两个密码是否一致，放心，这对 Elm 来说很简单。

这次的代码会更长更复杂些，建议先通览一遍再阅读剖析。

```elm
import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)



-- MAIN


main =
  Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
  { name : String
  , password : String
  , passwordAgain : String
  }


init : Model
init =
  Model "" "" ""



-- UPDATE


type Msg
  = Name String
  | Password String
  | PasswordAgain String


update : Msg -> Model -> Model
update msg model =
  case msg of
    Name name ->
      { model | name = name }

    Password password ->
      { model | password = password }

    PasswordAgain password ->
      { model | passwordAgain = password }



-- VIEW


view : Model -> Html Msg
view model =
  div []
    [ viewInput "text" "Name" model.name Name
    , viewInput "password" "Password" model.password Password
    , viewInput "password" "Re-enter Password" model.passwordAgain PasswordAgain
    , viewValidation model
    ]


viewInput : String -> String -> String -> (String -> msg) -> Html msg
viewInput t p v toMsg =
  input [ type_ t, placeholder p, value v, onInput toMsg ] []


viewValidation : Model -> Html msg
viewValidation model =
  if model.password == model.passwordAgain then
    div [ style "color" "green" ] [ text "OK" ]
  else
    div [ style "color" "red" ] [ text "Passwords do not match!" ]
```

与之前[文本输入框](/guide/#文本输入框)中的代码很接近，只是多了几个字段，让我们来看看它是如何构建的。

同样，我们先预估 Model 中包含的状态值，之前我们也提了有三个字段：

```elm
type alias Model =
  { name : String
  , password : String
  , passwordAgain : String
  }
```

看上去不错，这三个字段都可以更改，因此我们可以定义消息种类为：

```elm
type Msg
  = Name String
  | Password String
  | PasswordAgain String
```

很明显，`update` 函数只需要机械处理每一种消息对应的情况：

```elm
update : Msg -> Model -> Model
update msg model =
  case msg of
    Name name ->
      { model | name = name }

    Password password ->
      { model | password = password }

    PasswordAgain password ->
      { model | passwordAgain = password }
```

再看看这次的 `view` 好像比之前的要高级些：

```elm
view : Model -> Html Msg
view model =
  div []
    [ viewInput "text" "Name" model.name Name
    , viewInput "password" "Password" model.password Password
    , viewInput "password" "Re-enter Password" model.passwordAgain PasswordAgain
    , viewValidation model
    ]
```

首先，我们创建一个带了四个子节点的 `div`，但相比于之前那样直接调用 `elm/html` 中的函数，我们构建一个 `viewInput` 函数来让代码看上去更简洁：

```elm
viewInput : String -> String -> String -> (String -> msg) -> Html msg
viewInput t p v toMsg =
  input [ type_ t, placeholder p, value v, onInput toMsg ] []
```

`viewInput "text" "Name" model.name Name` （译者注：这个结构让我想起了 Pug 中的 Mixin）会创建一个类似 `<input type="text" placeholder="Name" value="Bill">` 的节点，同时会根据用户输入发送类似 `Name "Billy"` 的消息给 `update` 函数。

最有意思的是第四个子节点，它对应的是 `viewValidation`：

```elm
viewValidation : Model -> Html msg
viewValidation model =
  if model.password == model.passwordAgain then
    div [ style "color" "green" ] [ text "OK" ]
  else
    div [ style "color" "red" ] [ text "Passwords do not match!" ]
```

它首先会比较两个密码，如果匹配，就会显示绿色的正确提示，反之则显示红色的错误提示。

这些辅助函数已经开始显现出将 HTML 转化为 Elm 编码的好处。我们当然可以将所有代码都放入 `view` 中，但在 Elm 中，构建辅助函数是再正常不过。有点感觉到困惑？也许我可

> **练习**：`viewValidation` 的优势在于它很容易扩展，当你在阅读本文档过程中开始尝试这些代码时（你就应该这么做），可以：
> 
> + 检查密码长度是否大于 8 个字符
> + 确保密码包含大写，小写和数字字符
> + 添加一个额外的字段比如 age 并检查其是否为数字
> + 添加一个提交按钮，按下后仅提示错误信息
> 
> 在你尝试以上情况时，请确保使用 [String](https://package.elm-lang.org/packages/elm/core/latest/String) 模块中的辅助函数！同样，在和服务器通信前，我们还需要了解更多信息，确保已通读 HTTP 部分，因为恰当的指导能让你少走弯路。
> 
> **注意**：花大力气构建的通用校验库似乎都不太理想。我认为问题在于，校验通常最好是使用常用的 Elm 函数，通过获取一些参数，然后输出 `Bool` 或 `Maybe`。比如，为何要使用一个库来检查两个字符串是否相同？因此，就目前所知，最精简的代码来自为特定方案编写逻辑而无需掺杂任何其他的功能。所以，当你需要更复杂的库或代码前，先动手尝试一下最基本的方法。