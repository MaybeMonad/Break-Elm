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