# Elm 架构

Elm 架构是一种用于构建 Web 应用的简易范式，它非常适合模块化、代码复用和代码测试。最终，它能使**创建易重构、易扩展、复杂而又稳定的 Web 应用**变得更容易。

Elm 的这种架构像是自然而然出现的。早期的 Elm 开发人员不是在“发明”它，而是一直在他们的代码中找寻共同拥有的最简范式。后来开发团队发现这些对于新手特别友好，能使代码结构更加合理。这一切听上去就跟见鬼了似的。

这在 Elm 中如鱼得水般的核心架构，对其他任何前端项目都是有用的。实际上，像 Redux 这样的项目都是受到了 Elm 架构的启发，因此你可能已经看到过这种范式的衍生。当然，重点是，即使最终你不会在工作中使用 Elm，你还是能通过尝试 Elm 和吸收其设计思想来获得诸多好处。

### 基本范式

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

### Elm 架构 + 用户输入

你的 Web 应用需要处理用户输入，本节将通过以下内容带你熟悉 Elm 架构：

+ 按钮
+ 文本输入框
+ 多选框
+ 单选框
+ 等等

我们将通过一些示例来逐步建立知识体系，所以请按顺序阅读！

### 继续

在上一节中，我们通过 `elm repl` 熟悉了 Elm 表达式。本节我们将创建自己的 Elm 文件，你可以通过[在线编辑器](https://elm-lang.org/try)或本机安装 Elm 来执行操作。你可以按照这个[简易说明](https://github.com/evancz/elm-architecture-tutorial#run-the-examples)在你电脑上操作。

## 按钮

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

## 文本输入框

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

## 表单

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