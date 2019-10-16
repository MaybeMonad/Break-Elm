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

## JSON

前往[在线编辑器示例](https://elm-lang.org/examples/cat-gifs)

我们刚刚已经看了一个使用 HTTP 获取书籍内容的示例，而大部分服务器都以一种称为 JavaScript Object Notation（JSON）的特殊格式返回数据。

因此，我们的下一个示例展示了如何获取一些 JSON 数据，从而允许我们按下按钮后显示随机的喵 GIF 图。

```elm
import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode exposing (Decoder, field, string)



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
  (Loading, getRandomCatGif)



-- UPDATE


type Msg
  = MorePlease
  | GotGif (Result Http.Error String)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    MorePlease ->
      (Loading, getRandomCatGif)

    GotGif result ->
      case result of
        Ok url ->
          (Success url, Cmd.none)

        Err _ ->
          (Failure, Cmd.none)



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none



-- VIEW


view : Model -> Html Msg
view model =
  div []
    [ h2 [] [ text "Random Cats" ]
    , viewGif model
    ]


viewGif : Model -> Html Msg
viewGif model =
  case model of
    Failure ->
      div []
        [ text "I could not load a random cat for some reason. "
        , button [ onClick MorePlease ] [ text "Try Again!" ]
        ]

    Loading ->
      text "Loading..."

    Success url ->
      div []
        [ button [ onClick MorePlease, style "display" "block" ] [ text "More Please!" ]
        , img [ src url ] []
        ]



-- HTTP


getRandomCatGif : Cmd Msg
getRandomCatGif =
  Http.get
    { url = "https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat"
    , expect = Http.expectJson GotGif gifDecoder
    }


gifDecoder : Decoder String
gifDecoder =
  field "data" (field "image_url" string)
```

该示例与上一个示例非常相似：

+ `init` 从 `Loading` 状态开始，紧跟着一个获取随机 GIF 图的命令。
+ 每当 `GotGif` 有新消息，`update` 就负责处理。同时，当有人按下按钮，`update` 就会处理 `MorePlease` 消息，并发出命令获取更多喵。
+ `view` 负责向你展示喵。

主要的区别在于 `getRandomCatGif` 的定义，相比于 `Http.expectString`，我们这次改用 `Http.expectJson`，这是怎么回事呢？

### JSON

当你向 [`api.giphy.com`](https://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=cat) 请求一个随机喵的 GIF 图时，他们的服务器就会生成一个很大的 JSON 字符串，就像这样：

```json
{
  "data": {
    "type": "gif",
    "id": "l2JhxfHWMBWuDMIpi",
    "title": "cat love GIF by The Secret Life Of Pets",
    "image_url": "https://media1.giphy.com/media/l2JhxfHWMBWuDMIpi/giphy.gif",
    "caption": "",
    ...
  },
  "meta": {
    "status": 200,
    "msg": "OK",
    "response_id": "5b105e44316d3571456c18b3"
  }
}
```

我们无法保证此处提供的任何信息，因为服务器可以更改字段，并且在不同情况下这些字段可以有不同的类型，这真的是一个混乱无序的世界！

在 JavaScript 中，方法仅是将 JSON 转换为 JS 对象，并祈祷不会出错。但如果其中有一些拼写错误或意外的数据呢，你的代码可能会在某个地方出现运行时错误，然后就要去查代码是否有错？数据是否有误？

而在 Elm 中，我们先验证 JSON，然后再将其引入程序。因此，即便数据拥有意外的结构，我们也能立即获知，坏数据也无法流入导致运行时错误，而这都靠 JSON 解码器实现。

### JSON 解码器

假如我们有一些 JSON：

```json
{
  "name": "Tom",
  "age": 42
}
```

我们需要通过 `Decoder` 来运行它获取特定信息。如果想获取 `age`，我们就要通过 `Decoder Int` 来运行获取：

![int](/int.svg)

如果一切顺利，我们就能在另一端获得一个 `Int`。如果需要获取 `name`，我们可以通过 `Decoder String` 来获取：

![string](/string.svg)

同样，如果没问题，我们就会在另一端获得 `String`。

那我们如何创建像这样的解码器呢？

### 构建模块

[`elm/json`](https://package.elm-lang.org/packages/elm/json/latest/) 包为我们提供了 [`Json.Decoder`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode) 模块。它自带了很多小型解码器，我们可以充分利用它们。

因此，若要获取 `{ "name": "Tom", "age": 42 }` 中的 `"age"`，我们可以创建这样一个解码器：

```elm
import Json.Decode exposing (Decoder, field, int)

ageDecoder : Decoder Int
ageDecoder =
  field "age" int

 -- int : Decoder Int
 -- field : String -> Decoder a -> Decoder a
```

该 `field` 函数包含两个参数：

1. `String` - 字段名称。我们需要获取 `age` 的值，因此填入 `"age"`。
2. `Decoder a` - 执行下一步的解码器。如果 `age` 字段存在，就会执行该解码器。

因此，组合起来就是 `field "age" int` 请求一个 `age` 字段，如果存在，它将运行 `Decoder Int` 尝试提取一个整数。

同理我们可以提取 `name` 字段：

```elm
import Json.Decode exposing (Decoder, field, string)

nameDecoder : Decoder String
nameDecoder =
  field "name" string

-- string : Decoder String
```

### 嵌套解码器

还记得 `api.giphy.com` 的数据吗？

```json
{
  "data": {
    "type": "gif",
    "id": "l2JhxfHWMBWuDMIpi",
    "title": "cat love GIF by The Secret Life Of Pets",
    "image_url": "https://media1.giphy.com/media/l2JhxfHWMBWuDMIpi/giphy.gif",
    "caption": "",
    ...
  },
  "meta": {
    "status": 200,
    "msg": "OK",
    "response_id": "5b105e44316d3571456c18b3"
  }
}
```

现在我们要访问 `response.data.image_url` 来显示随机 GIF 就有现成的工具了。

```elm
import Json.Decode exposing (Decoder, field, string)

gifDecoder : Decoder String
gifDecoder =
  field "data" (field "image_url" string)
```

这就是我们在上面示例中 `gifDecoder` 的定义，而是否有 `data` 字段吗？该字段中是否有 `image_url` 值？该值是否为字符串类型？我们所有的期望都被明确写出，从而使我们能够安全地从 JSON 中提取 Elm 值。

### 组合解码器

这就是我们的 HTTP 示例所需要的，但是解码器还能做更多的事情！例如，如果我们需要*两个字段*怎么办？我们可以用 `map2` 组合不同的解码器：

```elm
map2 : (a -> b -> value) -> Decoder a -> Decoder b -> Decoder value
```

该函数有两个解码器，它会尝试两者并结合其结果。现在我们可以将另个解码器放在一起：

```elm
import Json.Decode exposing (Decoder, map2, field, string, int)

type alias Person =
  { name : String
  , age : Int
  }

personDecoder : Decoder Person
personDecoder =
  map2 Person
      (field "name" string)
      (field "age" int)
```

如果用 `personDecoder` 解析 `{ "name": "Tom", "age": 42 }` 就会得出 Elm 值像这样：`Person "Tom" 42`。

如果真想融入解码器的精髓，我们可以用之前的定义将 `personDecoder` 定义为 `map2 Person nameDecoder ageDecoder`，就像这样，你总能用较小的构建模块构建出你自己的解码器。

### 下一步

这里的 `Json.Decoder` 没有涉及很多重要功能：

+ [`bool`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#bool)：`Decoder Bool`
+ [`list`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#list)：`Decoder a -> Decoder (List a)`
+ [`dict`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#dict)：`Decoder a -> Decoder (Dict String a)`
+ [`oneOf`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#oneOf)：`List (Decoder a) -> Decoder a`

因此，还有很多方法可以提取各种数据结构。该 `oneOf` 函数对凌乱的 JSON 特别有用。（例如，有时你得到一个 `Int`，而其他时候你得到的是一个包含数字的 `String`，非常气人吧！）

还要 `map3`，`map4` 和其他一些用来处理超过两个字段的对象。但当你开始处理较大的 JSON 对象时，值得一试 [`NoRedInk/elm-json-decode-pipeline`](https://package.elm-lang.org/packages/NoRedInk/elm-json-decode-pipeline/latest)。那里的类型会有些不同，但人们发现它们更易于阅读和使用。

> 有趣的事实：我听过很多关于人们从 JS 切换到 Elm 时在服务器代码中发现错误的故事。人们编写的解码器最终会在验证阶段起作用，将 JSON 值中的异常捕获。因此，当 NoRedInk 从 React 切换到 Elm 时，他们发现了 Ruby 代码中的几个错误。

## 随机

到目前为止我们只见了发出 HTTP 请求的命令，但我们可以发起其他的命令，例如生成随机数！接下来让我们来做一个掷骰子的应用，可以产生一个介于 1 到 6 之间的随机数。

我们需要用到 [`elm/random`](https://package.elm-lang.org/packages/elm/random/latest) 包，主要是其中的 [`Random`](https://package.elm-lang.org/packages/elm/random/latest/Random) 模块，具体代码如下：

```elm
import Browser
import Html exposing (..)
import Html.Events exposing (..)
import Random



-- MAIN


main =
  Browser.element
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }



-- MODEL


type alias Model =
  { dieFace : Int
  }


init : () -> (Model, Cmd Msg)
init _ =
  ( Model 1
  , Cmd.none
  )



-- UPDATE


type Msg
  = Roll
  | NewFace Int


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Roll ->
      ( model
      , Random.generate NewFace (Random.int 1 6)
      )

    NewFace newFace ->
      ( Model newFace
      , Cmd.none
      )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none



-- VIEW


view : Model -> Html Msg
view model =
  div []
    [ h1 [] [ text (String.fromInt model.dieFace) ]
    , button [ onClick Roll ] [ text "Roll" ]
    ]
```

这里新增的是在 `update` 函数中发出的命令：

```elm
Random.generate NewFace (Random.int 1 6)
```

Elm 的随机数生成方式与 JavaScript，Python，Java 等语言不同，让我们来具体看一下。

### 随机生成器

核心思想是我们有一个随机的生成器，用来描述如何生成一个随机值，比如：

```elm
import Random

probability : Random.Generator Float
probability =
  Random.float 0 1

roll : Random.Generator Int
roll =
  Random.int 1 6

usuallyTrue : Random.Generator Bool
usuallyTrue =
  Random.weighted (80, True) [ (20, False) ]
```

这里面有三个随机数生成器，其中 `roll` 生成 `Int`，具体说是生成 1 到 6 之间的正整数，同样，`usuallyTrue` 会生成一个 `Bool`，80% 概率生成正确的结果。

关键我们现在还没有实际生成值，我们只是描述了如何生成它们，接下来我们可以用 [`Random.generate`](https://package.elm-lang.org/packages/elm/random/latest/Random#generate) 将其转换为命令：

```elm
generate : (a -> msg) -> Generator a -> Cmd msg
```

执行命令时，该 `Generator` 会产生一些值，然后将值转换为一条 `Msg` 传递给 `update` 函数。所以，在我们的示例中，`Generator` 产生了一个介于 1 到 6 的值，然后它变成一条类似于 `NewFace 1` 或 `NewFace 4` 的消息。这就是我们制作掷骰子所需的所有知识了，但生成器还能做更多的事情！

### 组合生成器

一旦我们有了类似 `probability` 和 `usuallyTrue` 这样的简单生成器，我们就可以用像 `map3` 这样的函数将他们组合在一起使用。假设我们要制作一个简单的老虎机，我们可以这样创建一个生成器：

```elm
import Random

type Symbol = Cherry | Seven | Bar | Grapes

symbol : Random.Generator Symbol
symbol =
  Random.uniform Cherry [ Seven, Bar, Grapes ]

type alias Spin =
  { one : Symbol
  , two : Symbol
  , three : Symbol
  }

spin : Random.Generator Spin
spin =
  Random.map3 Spin symbol symbol symbol
```

首先我们创建 `Symbol` 来描述可以出现在老虎机上的图片，然后我们创建一个随机生成器，以相等的概率生成每个符号。

接着我们用 `map3` 将它们组合成一个新的 `spin` 生成器，也就是说先生成三个 `Symbol`，然后将它们一起放入 `Spin`。

这里的重点是，我们可以使用小型的构建模块构建处理非常复杂行为的 `Generator`，而对于我们的应用来说，我们只需使用 `Random.generate NewSpin spin` 生成下一个随机值。

> 练习：以下是一些能让示例更有意思的想法。
> 
> + 与其显示数字，不如将骰子的正面显示为图像。
> + 与其显示骰子正面图像，不如自己用 [elm/svg](https://package.elm-lang.org/packages/elm/svg/latest/) 把它画出来。
> + 用 [Random.weighted](https://package.elm-lang.org/packages/elm/random/latest/Random#weighted) 创建一个加权的骰子。
> + 多加一个骰子，然后让两个骰子同时滚动。
> + 让骰子在最终值确定之前随机翻转。

## 时间

前往[在线编辑器示例](https://elm-lang.org/examples/time)

现在我们要制作一个时钟。

到目前为止我们主要讨论*命令*，在 HTTP 请求和随机数的例子中，我们命令 Elm **立即执行**特定的任务，但这对于时钟来说有点不适用，我们希望随时获得最新的时间，这也就是**订阅**存在的意义。

先浏览一遍以下的代码，稍后我们就来讨论如何使用 [`elm/time`](https://package.elm-lang.org/packages/elm/time/latest/)：

```elm
import Browser
import Html exposing (..)
import Task
import Time



-- MAIN


main =
  Browser.element
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }



-- MODEL


type alias Model =
  { zone : Time.Zone
  , time : Time.Posix
  }


init : () -> (Model, Cmd Msg)
init _ =
  ( Model Time.utc (Time.millisToPosix 0)
  , Task.perform AdjustTimeZone Time.here
  )



-- UPDATE


type Msg
  = Tick Time.Posix
  | AdjustTimeZone Time.Zone



update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Tick newTime ->
      ( { model | time = newTime }
      , Cmd.none
      )

    AdjustTimeZone newZone ->
      ( { model | zone = newZone }
      , Cmd.none
      )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
  Time.every 1000 Tick



-- VIEW


view : Model -> Html Msg
view model =
  let
    hour   = String.fromInt (Time.toHour   model.zone model.time)
    minute = String.fromInt (Time.toMinute model.zone model.time)
    second = String.fromInt (Time.toSecond model.zone model.time)
  in
  h1 [] [ text (hour ++ ":" ++ minute ++ ":" ++ second) ]
```

### `Time.Posix` 和 `Time.Zone`

要想在程序中成功使用时间，我们需要理解三个概念：

+ **人工时间** - 这是你在时钟（上午 8 点）或日历（5 月 3 日）上看到的内容。如果我的手机显示的是波士顿的早晨 8 点，那我在温哥华的朋友现在看到的是几点？如果此时东京是早上 8 点，那纽约是否在同一天？当然不是！因此，在政治边界不断变化和[夏令时](https://en.wikipedia.org/wiki/Daylight_saving_time)使用不一致的[时区](https://en.wikipedia.org/wiki/Time_zone)之间，人工时间就不应该存储在你的 `Model` 或者数据库中，仅可用于显示。
+ **POSIX 时间** - 如果使用 POSIX 时间，可以无视你住在哪里或是在一年中的某个时间，它只是从某个时刻（1970年）以来经过的秒数。因而无论你在地球上的任何地方，POSIX 时间都是相同的。
+ **时区** - “时区”就是一堆能让你将 POSIX 时间转换为人类时间的数据，这不仅仅是 `UTC-7` 或 `UTC+3`，时区可比简单的偏移复杂多了。每次[佛罗里达州永久性地转换为 DST](https://www.npr.org/sections/thetwo-way/2018/03/08/591925587/) 或[萨摩亚从 UTC-11 转换为 UTC+13](https://en.wikipedia.org/wiki/Time_in_Samoa) 时，一些倒霉的家伙就得向 [IANA 时区数据库](https://en.wikipedia.org/wiki/IANA_time_zone_database)添加注释。该数据库会被加载到每台计算机上，而借助 POSIX 时间和数据库中所有极端情况，我们可以算出人工时间！

因此，要向外界展示时间，你必须了解 `Time.Posix` 和 `Time.Zone`。而人工时间自然就不能放到 `Model` 中，而应直接显示在 `view` 中：

```elm
view : Model -> Html Msg
view model =
  let
    hour   = String.fromInt (Time.toHour   model.zone model.time)
    minute = String.fromInt (Time.toMinute model.zone model.time)
    second = String.fromInt (Time.toSecond model.zone model.time)
  in
  h1 [] [ text (hour ++ ":" ++ minute ++ ":" ++ second) ]
```

[`Time.toHour`](https://package.elm-lang.org/packages/elm/time/latest/Time#toHour) 函数接收 `Time.Posix` 和 `Time.Zone` 两个参数，然后返回一个 0 到 23 之间的整数，表明你所在时区的小时。

[`elm/time`](https://package.elm-lang.org/packages/elm/time/latest/) 的说明文档中还有很多关于如何处理时间的信息，务必在其他“时间操作”前先阅读一遍！尤其当你要使用计划表、日历等时。

### `subscriptions`

那我们如何获得 `Time.Posix`？用**订阅**！

```elm
subscriptions : Model -> Sub Msg
subscriptions model =
  Time.every 1000 Tick
```

这里我们用到了 [`Time.every`](https://package.elm-lang.org/packages/elm/time/latest/Time#every) 函数：

```elm
every : Float -> (Time.Posix -> msg) -> Sub msg
```

它接收两个参数：

1. 时间间隔（以毫秒为单位）。我们所说的 1000 就是 1 秒，所以可以用 60 * 1000 表示 1 分钟或以 5 * 60 * 1000 表示 5 分钟。
2. 将当前时间转换为一个 `Msg`。因此，当前时间每一秒都会变成 `Tick <time>`，然后传给 `update`。

这就是订阅的基本模式。

### `Task.perform`

获取 `Time.Zone` 有点棘手，我们可以使用以下的命令创建一个命令：

```elm
Task.perform AdjustTimeZone Time.here
```

前往阅读 [`Task`](https://package.elm-lang.org/packages/elm/core/latest/Task) 来理解这一行的意思，在这里我们只需理解运行它会给我们时区就可以了。

> 练习：
> 
> + 给时钟增加一个暂停按钮，可以将 `Time.every` 订阅关闭。
> + 让数字时钟看起来更好看，可以尝试添加一些 `style` 属性。
> + 使用 [`elm/svg`](https://package.elm-lang.org/packages/elm/svg/latest/) 使模拟时钟能有一个红色指针。