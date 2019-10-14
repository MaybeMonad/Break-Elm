# 命令和订阅

在 [Elm 核心架构](/guide/core-language.md)章节中我们见了如何处理键鼠的事件，但如何与服务器交互呢？产生随机数？

回答这些问题有助于理解 Elm 的底层思想，这也将解释为什么 Elm 与 JavaScript、Python 等语言的工作方式有所不同。

### `sandbox`

在这方面我还没有做太多，到目前为止，我们所有的程序都是用 [`Browser.sandbox`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#sandbox) 创建的。我们提供了一个初始的 `Model` 并描述了如何使用 `update` 和 `view`。

你可以将 `Browser.sandbox` 想象为是建立了如下的一个系统：

![sandbox](/sandbox.svg)

我们将待在 Elm 的世界里编写函数、转换数据，这与 Elm 的**运行时系统**相关。运行时系统会计算出如何有效渲染 `Html`，有什么变化吗？最小的 DOM 修改需要什么？它还可以确定何时有人单击按钮或输入文本框，然后转换为一个个 `Msg` 传入你的 Elm 代码中。

通过彻底分离所有 DOM 操作，可以应用更有效的优化方案，这也是 Elm 能成为[现有最快的方案之一](https://elm-lang.org/blog/blazing-fast-html-round-two)的重要原因。

### `element`

在接下来的几个示例里，我们将使用 [`Browser.element`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#element) 来创建程序。这里会介绍**命令**和**订阅**的思想，它们使我们能与外界互动。

你可以将 `Browser.element` 视为：

![element](/element.svg)

除了产生 `Html` 外，我们还将传入 `Cmd` 和 `Sub`。在这里，我们的程序可以**命令**运行时系统发起 HTTP 请求或者生成一个随机数。同时，它们也可以**订阅**当前的时间。

我认为看例子更有助于你理解命令和订阅的概念，那就让我们开始吧。

> 注 1：一些读者可能会担心资产大小，“运行时系统？听上去不错”，实际上，与流行的替代品相比，[Elm 的资产特别少](https://elm-lang.org/blog/small-assets-without-the-headache)。
> 
> 注 2：再接下去的例子中，我们将会使用来自 [`package.elm-lang.org`](https://package.elm-lang.org/) 的包。实际上我们已经用过一些了：
> 
> + [elm/core](https://package.elm-lang.org/packages/elm/core/latest/)
> + [elm/html](https://package.elm-lang.org/packages/elm/html/latest/)
> 
> 但接下去我们会讨论一些更棒的：
> 
> + [elm/http](https://package.elm-lang.org/packages/elm/http/latest/)
> + [elm/json](https://package.elm-lang.org/packages/elm/json/latest/)
> + [elm/random](https://package.elm-lang.org/packages/elm/random/latest/)
> + [elm/time](https://package.elm-lang.org/packages/elm/time/latest/)
> 
> 当然，还有很多其他的包，因此，当你在本地制作自己的 Elm 程序时，可能会用到以下的命令：
> 
> ```sh
> elm init
> elm install elm/http
> elm install elm/random
> ```
> 
> 这样会建立一个依赖于 `elm/http` 和 `elm/random` 的 `elm.json`。
> 
> 我会在接下去的例子中提及我们正在使用的包，因此我希望这能给你提供一些背景知识。

## HTTP

前往[在线编辑器示例](https://elm-lang.org/examples/book)

从互联网上的其他地方获取信息通常都很有帮助。

例如，假设我们要加载 Walter Lippmann 的《舆论》全文。这本书于 1992 年出版，提供了有关大众媒体兴起及其对民主影响的历史观点。而对于我们来说，我们将重点介绍如何使用 `elm/http` 包将这本书纳入我们的应用程序中！

让我们先过一遍代码，有一些新东西，但不用担心，我们会逐一解释。

```elm
import Browser
import Html exposing (Html, text, pre)
import Http



-- MAIN


main =
  Browser.element
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }



-- MODEL


type Model
  = Failure
  | Loading
  | Success String


init : () -> (Model, Cmd Msg)
init _ =
  ( Loading
  , Http.get
      { url = "https://elm-lang.org/assets/public-opinion.txt"
      , expect = Http.expectString GotText
      }
  )



-- UPDATE


type Msg
  = GotText (Result Http.Error String)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotText result ->
      case result of
        Ok fullText ->
          (Success fullText, Cmd.none)

        Err _ ->
          (Failure, Cmd.none)



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none



-- VIEW


view : Model -> Html Msg
view model =
  case model of
    Failure ->
      text "I was unable to load your book."

    Loading ->
      text "Loading..."

    Success fullText ->
      pre [] [ text fullText ]
```

这其中的部分代码与之前 Elm 核心架构中所见的一致，有 `Model`、`update` 和 `view`，而新增的部分对 `init` 和 `update` 进行了更改，同时增加了 `subscription`。

### `init`

`init` 函数描述了我们如何初始化程序：

```elm
init : () -> (Model, Cmd Msg)
init _ =
  ( Loading
  , Http.get
      { url = "https://elm-lang.org/assets/public-opinion.txt"
      , expect = Http.expectString GotText
      }
  )
```

按照惯例，我们需要初始化一个 `Model`，但我们现在同时初始化了需要**立即执行的命令**。该命令最终会生成一个 `Msg` 然后传入 `update` 函数中。

我们的请求从 `loading` 状态开始，用 `Http.get` 发起 GET 请求，其中指定了获取数据的 `url` 和期望获取的数据 `expect`。因此，在我们的案例中，`url` 指向 Elm 网站，`expect` 的是我们期望显示在屏幕上的一大串字符串。

`Http.expectString GotText` 这一行不只是简单的获得字符串，它指的是当我们收到 `response` 时，该回复将转换为一条 `GotText` 的 `Msg`：

```elm
type Msg
  = GotText (Result Http.Error String)

-- GotText (Ok "The Project Gutenberg EBook of ...")
-- GotText (Err Http.NetworkError)
-- GotText (Err (Http.BadStatus 404))
```

请注意，我们正在使用之前提到的 `Result` 类型，这能让我们充分考虑 `update` 中的错误，说到 `update` 函数...

> 注：如果你在疑惑为什么 `init` 是一个函数（以及为何我们没有填写参数），我们会在接下去的 JavaScript 互操作章节中会讨论这点！（预告：参数可以让我们在初始化时从 JS 获取信息）

### `update`

我们的 `update` 函数也返回了一些信息：

```elm
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotText result ->
      case result of
        Ok fullText ->
          (Success fullText, Cmd.none)

        Err _ ->
          (Failure, Cmd.none)
```

注意一下类型签名，我们可以看出我们不止返回一个更新后的 `Model`，我们还生成了一个要让 Elm 执行的**命令**。

继续执行，像往常一样匹配处理不同的结果。当一个 `GotText` 消息传入，我们检查 HTTP 请求的结果并根据结果是否成功来更新数据模型，其中新增了一个命令。

因此，在这个案例中，如果我们成功获得了全文，我们就说 `Cmd.none` 来表明无需多余操作。而如果这其中发生了错误，我们也只说了 `Cmd.none`，那书本的文字就无法正常载入。如果想让它显示的更优雅，我们可以匹配 `Http.Error`，然后根据是否遇到超时或其他问题来尝试重新请求。

重点是无论我们是否决定更新模型，我们都能发布新命令，比如我需要更多的数据或随机数！

### `subscription`

程序中的另一个新家伙就是 `subscription` 函数，它能让你查看 `Model` 并确定是否需要订阅某些信息。在我们的示例中，我们说的 `Cmd.none` 是表明我们不需要订阅任何东西，但我们很快就会看到一个要订阅当前时间的时钟示例。

### 摘要

当我们使用 `Browser.element` 创建程序时，我们会建立如下的系统：

![element](/element.svg)

我们可以从 `init` 和 `update` 函数发布**命令**，这使我们能在需要时执行诸如发起 HTTP 请求的操作。我们还可以**订阅**有趣的信息（稍后我们将看到一个订阅示例）。