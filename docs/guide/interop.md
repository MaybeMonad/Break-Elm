# JavaScript 交互

到现在为止，我们已经接触了 Elm 架构、类型、命令和订阅，但当你需要操作 JavaScript 时该怎么办？也许有个你必需的 JavaScript 库？也许你想将 Elm 嵌入现有的 JavaScript 应用中？本章将概述所有可能的选项：标志（Flags）、端口（Ports）和自定义元素。

但无论使用哪种方法，第一步都是先初始化 Elm 程序。

### 初始化 Elm 程序

运行 `elm make` 默认会生成 HTML 文件，因此你可以：

```sh
elm make src/Main.elm
```

它会生成一个 `index.html` 文件，你可以直接打开并开始操作。而要想与 JavaScript 交互，你需要生成 JavaScript 文件：

```sh
elm make src/Main.elm --output=main.js
```

这会生成一个公开 `Elm.Main.init` 函数的 JavaScript 文件，所以一旦有了 `main.js`，你就可以根据自己想要的结果编写自己的 HTML 文件，比如：

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
  <div id="elm"></div>
  <script>
  var app = Elm.Main.init({
    node: document.getElementById('elm')
  });
  </script>
</body>
</html>
```

这里有几行需要注意一下。

首先，在文档的 `<head>` 中，你可以加载所需的任何内容！在我们的示例中，我们加载了一个 CSS 文件，名为 `whatever-you-want.css`：

```html
<link rel="stylesheet" href="whatever-you-want.css">
```

不管你是手写的 CSS，还是某种方式生成的，你都可以加载并使用它。（Elm 中也有一些很棒的实现能让你在 Elm 中写 CSS，但这是另一个话题了！）

第二，我们有一行用来加载编译的 Elm 代码：

```html
<script src="main.js"></script>
```

这样就可以使用一个叫 `Elm` 的全局对象，所以若你编译了一个叫 `Main` 的 Elm 模块，你就可以在 JavaScript 中使用 `Elm.Main`。

第三，在文档的 `<body>` 中，我们运行一小段 JavaScript 代码来初始化我们的 Elm 程序：

```html
<div id="elm"></div>
<script>
var app = Elm.Main.init({
  node: document.getElementById('elm')
});
</script>
```

我们创建了一个空的 `<div>`，因为我们希望 Elm 完全接管这个节点。那如果它是包含在一个更大的应用中，周围有很多别的东西呢？也是完全 OK 的。

`<script>` 标签中的代码会初始化我们的 Elm 程序，其中我们获取需要接管的目标节点，然后将它传给 `Elm.Main.init` 来启动我们的程序。

现在我们可以将 Elm 程序嵌入 HTML 文档中，这时我们也可以开始探索开头提到的三种交互方式：标志（Flags）、端口（Ports）和 Web 组件。

## 标识

上一节展示了启动 Elm 程序所需的 JavaScript 代码：

```js
var app = Elm.Main.init({
  node: document.getElementById('elm')
});
```

我们也可以传入其他的数据，比如，要传入当前的时间，我们可以：

```js
var app = Elm.Main.init({
  node: document.getElementById('elm'),
  flags: Date.now()
});
```

我们把这些额外的数据称为 `flags`。这使你能使用任何数据来自定义你的 Elm 程序。

> 注意：此附加数据称为“标志”，因为它类似命令行标志。你可以调用 `elm make src/Main.elm`，但你可以使用一些类似 `--optimize` 和 `--output=main.js` 来自定义其编译行为，诸如此类。

### 处理标志

仅传递 JavaScript 是不够的，我们需要在 Elm 中处理！[`Browser.element`](https://package.elm-lang.org/packages/elm/browser/latest/Browser#element) 函数提供了一个 `init` 来处理标志：

```elm
element :
  { init : flags -> ( model, Cmd msg )
  , update : msg -> model -> ( model, Cmd msg )
  , subscriptions : model -> Subs msg
  , view : model -> Html msg
  }
  -> Program flags model msg
```

请注意，其中 `init` 有一个名为 `flags` 的参数，假设我们要传递当前时间，可以这样来编写 `init` 函数

```elm
init : Int -> ( Model, Cmd Msg )
init currentTime =
  ...
```

这意味着 Elm 代码可以立即访问你从 JavaScript 传入的标志。随之，你可以往数据模型传值或者运行一些命令。

### 验证标志

但是，如果 `init` 需要一个 `Int` 标志，但有人想要用 `Elm.Main.init({ flags: "haha, what now?" })` 来初始化？

Elm 会检查确保这些标志符合你的预期，如果没有检查，你可能会传入错误值而导致 Elm 的运行时错误！

可以将多种类型定义为标志：

+ `Bool`
+ `Int`
+ `Float`
+ `String`
+ `Maybe`
+ `List`
+ `Array`
+ tuples
+ records
+ [`Json.Decode.Value`](https://package.elm-lang.org/packages/elm/json/latest/Json-Decode#Value)

许多人总会使用 `Json.Decode.Value`，因为它可以提供精确控制。他们可以编写对应的解码器来处理 Elm 中的各种场景，并以一种友好的方式从意外数据中恢复。

其他受支持的类型实际上来自我们想出一种执行 JSON 解码器的方法之前，如果选择使用它们，则需要注意一些细节。以下示例显示了所需的标志类型，然后子点显示了几个不同的 JS 值会发生的情况：

+ `init : Int -> ...`
  + `0` => `0`
  + `7` => `7`
  + `3.14` => error
  + `6.12` => error
+ `init : Maybe Int -> ...`
  + `null` => `Nothing`
  + `42` => `Just 42`
  + `"hi"` => error
+ `init : { x : Float, y : Float } -> ...`
  + `{ x: 3, y: 4, z: 50 }` => `{ x = 3, y = 4 }`
  + `{ x: 3, name: "tom" }` => error
  + `{ x: 360, y: "why?" }` => error
+ `init : (String, Int) -> ...`
  + `['tom',42]` => `("Tom", 42)`
  + `["sue",33]` => `("Sue", 33)`
  + `["bob","4"]` => error
  + `['joe',9,9]` => error

请注意，当其中一种转换出错时，**你就会在 JS 端遇到错误**！我们采用“快速失败”的策略，即应尽快报告它，而不是通过 Elm 代码出错。这是人们喜欢使用 `Json.Decode.Value` 标志的另一个原因。可疑的值通过解码器传递，从而保证了你实现某种后备行为，而不是在 JS 中出错。