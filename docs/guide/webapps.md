# 网络应用

到目前为止，我们已经使用 `Browser.element` 来创建 Elm 程序，能让我们在一个大型应用程序中接管其中的单个节点，这对于引入 Elm 到现有工作中是非常棒的（就像[这里](https://elm-lang.org/blog/how-to-use-elm-at-work)所说）。但之后呢？我们如何能够更广泛地使用 Elm？

本章节我们会学习如何创建一个的“网络应用”，它将拥有多个不同但彼此完美集成的页面，但我们得从单个页面开始。

### 控制文档

第一步是使用 [`Browser.document`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#document) 来启动程序：

```elm
document :
  { init : flags -> ( model, Cmd msg )
  , view : model -> Document msg
  , update : msg -> model -> ( model, Cmd msg )
  , subscriptions : model -> Sub msg
  }
  -> Program flags model msg
```

除了 `view` 函数，其他参数与 `Browser.element` 一致，但返回的不是 `Html` 值，而是 [`Document`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#Document)：

```elm
type alias Document msg =
  { title : String
  , body : List (Html msg)
  }
```

这样你就可以控制文档的 `<title>` 和 `<body>` 标签，也许你的程序会下载一些数据，从而帮你确定更具体的标题，但现在你只需在 `view` 函数中修改即可。

### 页面服务

默认情况下，编译器生成 HTML，因此你可以在命令行中这样编写：

```sh
elm make src/Main.elm
```

这将输出一个名为 `index.html` 的文档，你可以像使用其他 HTML 文档一样使用它。若你想获得更大的灵活性，可以（1）将 Elm 编译为 JavaScript、（2）创建自定义 HTML 文档。如果你想那么做，可以这么写：

```sh
elm make src/Main.elm --output=main.js
```

这将生成一个 `main.js`，你可以在自定义的 HTML 文档中引入使用：

```html
<!DOCTYPE HTML>
<html>
<head>
  <meta charset="UTF-8">
  <title>Main</title>
  <link rel="stylesheet" href="whatever-you-want.css">
  <script src="main.js"></script>
</head>
<body>
  <script>var app = Elm.Main.init();</script>
</body>
</html>
```

这个 HTML 很简单，你可以在 `<head>` 中加载任何所需的内容，同时你在 `<body>` 中初始化 Elm 程序，Elm 就会从那里开始运行并渲染所有内容。

无论用哪种方式，你现在已经可以将一些 HTML 发送给浏览器了。你可以将这些 HTML 免费部署到 [GitHub Pages](https://pages.github.com/) 或 [Netlify](https://www.netlify.com/)。

> **注意**：若要使用 CSS 自定义样式，你可以在 Elm 中使用 [`rtfeldman/elm-css`](https://package.elm-lang.org/packages/rtfeldman/elm-css/latest/)，但如果你在一个团队中工作，也许正在用着 CSS 预处理器，那你就只能在 HTML 中加载最终的 CSS 文档。

## 导航

之前我们都只讨论单个网页，但如果我们想要建立像 `package.elm-lang.org` 这样包含 [search](https://package.elm-lang.org/)、[README](https://package.elm-lang.org/packages/elm/core/latest/)、[docs](https://package.elm-lang.org/packages/elm/core/latest/Maybe) 等页面的网站，该如何做到呢？

### 多页

最简单的方法是创建不同的 HTML，即通过跳转不同路径渲染不同 HTML 页面。在 Elm 0.19 之前的 Elm 包管理网站就是这么做的，但它有一些缺点：

1. **空白屏** - 每次在加载新的 HTML 时，屏幕都会变白，我们是否能做个更好的过渡？
2. **冗余请求** - 每个软件包都有一个 docs.json 文件，在每次访问诸如 `String` 或模块时就会被加载，我们是否能以某种方式让这些数据在页面间共享？
3. **冗余代码** - 主页和文档页用到了很多相同函数，如 `Html.text` 和 `Html.div`，我们是否能让这些代码在页面间共享？

方法很简单，就是只加载一次 HTML，只是在处理 URL 更改时有些棘手。

### 单页

除了使用 `Browser.element` 或 `Browser.document` 创建程序外，我们还可以创建一个 [`Browser.application`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#application) 来避免 URL 更改时加载新的 HTML：

```elm
application :
  { init : flags -> Url -> Key -> ( model, Cmd msg )
  , view : model -> Document msg
  , update : msg -> model -> ( model, Cmd msg )
  , subscriptions : model -> Sub msg
  , onUrlRequest : UrlRequest -> msg
  , onUrlChange : Url -> msg
  }
  -> Program flags model msg
```

它能在三个重要的场景下扩展 `Browser.document` 的功能。

**当程序启动时**，`init` 会从浏览器导航栏获取当前 `Url`，这能让你根据不同的 `Url` 显示不同的内容。

**当某人单击某个链接时**，例如 `<a href="/home">Home</a>`，该链接会被拦截为 `UrlRequest`。因此，相对于加载新的 HTML，`onUrlRequest` 会创建一条消息并传递给 `update`，然后你就可以自行决定下一步要做什么。你可以保存当前滚动位置，保留相关数据，甚至更改 URL 等。

**网址更改后**，新的 `Url` 会传递给 `onUrlChange`，结果消息会进入 `update`，然后你就可以决定如何显示新页面。

因此，这三个添加项可以使你完全控制 URL 的更改，而不再是加载新的 HTML，接下来让我们看个示例。

### 示例

我们从 `Browser.application` 基础程序开始，它仅用于跟踪当前 URL。快速浏览一遍代码你就会发现有意思的部分都在 `update` 中，之后我们会详细讲解这些细节：

```elm
import Browser
import Browser.Navigation as Nav
import Html exposing (..)
import Html.Attributes exposing (..)
import Url



-- MAIN


main : Program () Model Msg
main =
  Browser.application
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    , onUrlChange = UrlChanged
    , onUrlRequest = LinkClicked
    }



-- MODEL


type alias Model =
  { key : Nav.Key
  , url : Url.Url
  }


init : () -> Url.Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
  ( Model key url, Cmd.none )



-- UPDATE



type Msg
  = LinkClicked Browser.UrlRequest
  | UrlChanged Url.Url


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    LinkClicked urlRequest ->
      case urlRequest of
        Browser.Internal url ->
          ( model, Nav.pushUrl model.key (Url.toString url) )

        Browser.External href ->
          ( model, Nav.load href )

    UrlChanged url ->
      ( { model | url = url }
      , Cmd.none
      )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.none



-- VIEW


view : Model -> Browser.Document Msg
view model =
  { title = "URL Interceptor"
  , body =
      [ text "The current URL is: "
      , b [] [ text (Url.toString model.url) ]
      , ul []
          [ viewLink "/home"
          , viewLink "/profile"
          , viewLink "/reviews/the-century-of-the-self"
          , viewLink "/reviews/public-opinion"
          , viewLink "/reviews/shah-of-shahs"
          ]
      ]
  }


viewLink : String -> Html msg
viewLink path =
  li [] [ a [ href path ] [ text path ] ]
```

该 `update` 函数可以处理 `LinkClicked` 和 `UrlChanged` 消息，`LinkClicked` 中有很多新东西，我们先来仔细看看。

#### `UrlRequest`

每当有人点击像 `<a href="/home">/home</a>` 这样的链接时，它都会产生一个 `UrlRequest` 值：

```elm
type UrlRequest
  = Internal Url.Url
  | External String
```

该 `Internal` 适用于停留在同一域上的任何链接。所以，如果你正在浏览是 `https://example.com`，内部链接包括如 `settings#privacy`，`/home`，`https://example.com/home`，`//example.com/home` 等。

该 `External` 适用于可跳转到其他域的任何链接。像 `https://elm-lang.org/examples`，`https://static.example.com`，`http://example.com/home` 这样的链接都是指向不同域。另外需要注意的是如果把协议从 `https` 改为 `http` 也意味着不同域。

无论按下哪个链接，我们的示例程序都会创建一个 `LinkClicked` 消息并将其发送给 `update` 函数，这也是我们将要讨论的重点。

### `LinkClicked`

我们的大部分 `update` 逻辑都在决定如何处理这些 `UrlRequest` 值：

```elm
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    LinkClicked urlRequest ->
      case urlRequest of
        Browser.Internal url ->
          ( model, Nav.pushUrl model.key (Url.toString url) )

        Browser.External href ->
          ( model, Nav.load href )

    UrlChanged url ->
      ( { model | url = url }
      , Cmd.none
      )
```

这其中的 `Nav.load` 和 `Nav.pushUrl` 来自 [`Browser.Navigation`](https://package.elm-lang.org/packages/elm/browser/latest/Browser-Navigation) 模块，两者都是关于如何改变 URL，我们将经常用到这两个方法：

+ `load` 会载入所有新的 HTML，等效于在地址栏中输入 URL 后回车。所以在 `Model` 中发生的任何事都会被抛出，并加载新页面。
+ `pushUrl` 会改变 URL，但不会加载新的 HTML，

## URL 解析

在实际的 Web 应用中，我们希望针对不同 URL 显示不同内容：

+ `/search`
+ `/search?q=seiza`
+ `/settings`

那我们该怎么做呢？我们可以使用 `elm/url` 将原始字符串解析为 Elm 数据结构，接下来我们看几个示例。

### 示例 1

假设我们有一个艺术网站，其中以下地址为有效地址：

+ `/topic/architecture`
+ `/topic/painting`
+ `/topic/sculpture`
+ `/topic/42`
+ `/topic/123`
+ `/topic/451`
+ `/topic/tom`
+ `/topic/sue`
+ `/topic/sue/comment/11`
+ `/topic/sue/comment/51`

由此，我们应有话题页、博客文章页、用户信息页及查找单个用户评论的方法。我们将使用 [`Url.Parser`](https://package.elm-lang.org/packages/elm/url/latest/Url-Parser) 模块来编写如下的 URL 解析器：

```elm
import Url.Parser exposing (Parser, (</>), int, map, oneOf, s, string)

type Route
  = Topic String
  | Blog Int
  | User String
  | Comment String Int

routeParser : Parser (Route -> a) a
routeParser =
  oneOf
    [ map Topic   (s "topic" </> string)
    , map Blog    (s "blog" </> int)
    , map User    (s "user" </> string)
    , map Comment (s "user" </> string </> s "comment" </> int)
    ]

-- /topic/pottery        ==>  Just (Topic "pottery")
-- /topic/collage        ==>  Just (Topic "collage")
-- /topic/               ==>  Nothing

-- /blog/42              ==>  Just (Blog 42)
-- /blog/123             ==>  Just (Blog 123)
-- /blog/mosaic          ==>  Nothing

-- /user/tom/            ==>  Just (User "tom")
-- /user/sue/            ==>  Just (User "sue")
-- /user/bob/comment/42  ==>  Just (Comment "bob" 42)
-- /user/sam/comment/35  ==>  Just (Comment "sam" 35)
-- /user/sam/comment/    ==>  Nothing
-- /user/                ==>  Nothing
```

该 `Url.Parser` 模块非常简洁地将有效的 URL 地址转换为 Elm 数据！

### 示例 2

假设我们现在有一个个人博客，其中以下网址是为有效：

+ `/blog/12/the-history-of-chairs`
+ `/blog/13/the-endless-september`
+ `/blog/14/whale-facts`
+ `/blog/`
+ `/blog?q=whales`
+ `/blog?q=seiza`

在这种情况下，我们要有单独的博客文章页和带有可查询参数的博客概述列表页，这次我们需要添加 [`Url.Parser.Query`](https://package.elm-lang.org/packages/elm/url/latest/Url-Parser-Query) 模块来编写我们的解析器：

```elm
import Url.Parser exposing (Parser, (</>), (<?>), int, map, oneOf, s, string)
import Url.Parser.Query as Query

type Route
  = BlogPost Int String
  | BlogQuery (Maybe String)

routeParser : Parser (Route -> a) a
routeParser =
  oneOf
    [ map BlogPost  (s "blog" </> int </> string)
    , map BlogQuery (s "blog" <?> Query.string "q")
    ]

-- /blog/14/whale-facts  ==>  Just (BlogPost 14 "whale-facts")
-- /blog/14              ==>  Nothing
-- /blog/whale-facts     ==>  Nothing
-- /blog/                ==>  Just (BlogQuery Nothing)
-- /blog                 ==>  Just (BlogQuery Nothing)
-- /blog?q=chabudai      ==>  Just (BlogQuery (Just "chabudai"))
-- /blog/?q=whales       ==>  Just (BlogQuery (Just "whales"))
-- /blog/?query=whales   ==>  Just (BlogQuery Nothing)
```

运算符 `</>` 和 `<?>` 让我们能像编写真实 URL 地址那样编写解析器，而通过添加 `Url.Parser.Query` 可以处理类似 `?q=seiza` 的查询参数。

### 示例 3

OK，我们现在有一个说明文档网站，它包含以下地址：

+ `/Basics`
+ `/Maybe`
+ `/List`
+ `/List#map`
+ `/List#filter`
+ `/List#foldl`

我们可以使用 `Url.Parser` 中的 [`fragment`](https://package.elm-lang.org/packages/elm/url/latest/Url-Parser#fragment) 来处理这些地址，如下：

```elm
type alias Docs =
  (String, Maybe String)

docsParser : Parser (Docs -> a) a
docsParser =
  map Tuple.pair (string </> fragment identity)

-- /Basics     ==>  Just ("Basics", Nothing)
-- /Maybe      ==>  Just ("Maybe", Nothing)
-- /List       ==>  Just ("List", Nothing)
-- /List#map   ==>  Just ("List", Just "map")
-- /List#      ==>  Just ("List", Just "")
-- /List/map   ==>  Nothing
-- /           ==>  Nothing
```

所以现在我们就可以处理 URL 片段了。

### 综述

现在我们已经见过了一些解析器，接下来我们看看如何将其融入 `Browser.application` 程序中。除了像之前那样仅是保存网址外，我们是否可以将其解析为有用的数据并将它展示出来呢？

```
TODO
```

主要的新内容：

1. 当我们接收到一个新的 `UrlChanged` 消息，`update` 函数就解析 URL 地址。
2. `view` 函数针对不同地址展示不容内容。

所以也没什么特别的！

但如果你拥有 10 个、20 个，甚至 100 个不同的页面时，会发生什么？所有内容都在这一个 `view` 中吗？当然不！那该怎么区分？下一节我们继续讨论这个问题。

## 模块

Elm 提供了一些**模块**来帮助你更好地扩展代码库。模块能让你以最小单位将代码分成多个文件。

### 定义模块

最佳实践是围绕核心类型定义 Elm 模块，就像 `List` 模块与 `List` 类型有关。因此，假设我们要围绕博客网站的 `Post` 类型构建一个模块，可以这样创建：

```elm
module Post exposing (Post, estimatedReadTime, encode, decoder)

import Json.Decode as D
import Json.Encode as E


-- POST

type alias Post =
  { title : String
  , author : String
  , content : String
  }


-- READ TIME

estimatedReadTime : Post -> Float
estimatedReadTime post =
  toFloat (wordCount post) / 220

wordCount : Post -> Int
wordCount post =
  List.length (String.words post.content)


-- JSON

encode : Post -> E.Value
encode post =
  E.object
    [ ("title", E.string post.title)
    , ("author", E.string post.author)
    , ("content", E.string post.content)
    ]

decoder : D.Decoder Post
decoder =
  D.map3 Post
    (D.field "title" D.string)
    (D.field "author" D.string)
    (D.field "content" D.string)
```

此处唯一的新语法是顶行的 `module Post exposing (..)`，意思是称为 `Post` 的模块只提供部分值供外界使用。也就是说，`wordCount` 函数只在 `Post` 模块里使用。像这样隐藏函数的功能是 Elm 中最重要的技术之一。

> 注意：如果你忘记添加模块声明，Elm 会使用以下替代：
> ```elm
> module Main exposing (..)
> ```
> 这对初学者非常友好，毕竟没必要一开始就面对模块系统！

### 模块扩展

当你的应用程序变得越来越复杂，你最终会选择使用模块。就像我在 [《The Life of a File》](https://youtu.be/XpDsk374LDE) 所述，Elm 模块通常在 400 到 1000 行内，但如果你有多个模块，如何决定在哪里添加新代码？

我会采用以下的探索法：

+ **独有的** - 如果逻辑只出现在一个地方，我会尽可能分解顶层辅助函数来匹配使用，也可能使用类似 `-- POST PREVIEW` 的注释头来表明以下定义与预览博文有关。
+ **相似** - 假设我们要在首页和作者页显示博文预览，其中在主页上，我们要强调有趣的内容，因此我们需要更长的片段，而在作者页面上，我们要强调内容的广度，因此我们更多体现标题。这些情况是相似的，但不是相同的，所以我们回到刚才**独有的**探索法，只需单独编写逻辑。
+ **相同** - 