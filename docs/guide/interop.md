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

## 端口

在前两节中，我们看到了启动 Elm 程序所需的 JavaScript，以及在初始化时传递标志的方法：

```elm
// initialize
var app = Elm.Main.init({
  node: document.getElementById('elm')
});

// initialize with flags
var app = Elm.Main.init({
  node: document.getElementById('elm'),
  flags: Date.now()
});
```

我们可以将信息提供给 Elm 程序，但只能在程序启动时提供，那如何在程序运行过程中也能使用 JavaScript 呢？

### 消息传递

Elm 允许你通过**端口**在 Elm 和 JavaScript 之间传递消息。与通过 HTTP 看到的请求/响应对不同，通过端口发送的消息是单向的，就像发送一封信。例如，美国的银行向我发送了数百封不请自来的信件，诱使我向银行借贷以满足消费需求，但这些信件是单向的，而不像请求/响应对那样有内在的联系。当然，**重点是 Elm 和 JavaScript 可以通过端口发送这些单向消息来通信**。

### 发出消息

假设我们要用 [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) 来缓存一些信息。解决方案是设置一个将信息发送到 JavaScript 的端口。在 Elm 端，可以这样定义 `port`：

```elm
port module Main exposing (..)

import Json.Encode as E

port cache : E.Value -> Cmd msg
```

最重要的一行是 `port` 声明，意味着已经创建了一个 `cache` 函数，我们可以创建类似 `cache (E.int 42)` 的命令将 `Json.Encode.Value` 输出给 JavaScript。

在 JavaScript 端，我们先照旧初始化程序，不同的是我们要订阅所有发出的 `cache` 消息：

```js
var app = Elm.Main.init({
  node: document.getElementById('elm')
});
app.ports.cache.subscribe(function(data) {
  localStorage.setItem('cache', JSON.stringify(data));
});
```

类似 `cache (E.int 42)` 的命令会将值发送给任何在 JavaScript 中订阅了 `cache` 端口的人。因此，JavaScript 会得到 42 并作为 data 存储在 `localStorage` 中。

在大多数想要缓存信息的程序中，你可以通过两种方式与 JavaScript 通信：

1. 你可以通过初始化时的标志传递缓存的数据。
2. 你定时向外发送数据以更新缓存。

在该通信中虽然只有向外发送消息，我也不会因为尝试最小化数据传输而小心翼翼，但尽量保持简单，只有当你在实践中觉得有必要时再加一些 hacking stuff。

> 注意 1：这不是对 `setItem` 函数的绑定！这是一种常见的误解。**重点是不要一次只覆盖 LocalStorage API 一个功能**。这只是要求一些缓存，JavaScript 代码可以决定使用 LocalStorage、IndexedDB、WebSQL 或其他任何方式。因此，我们不必考虑“每个 JavaScript 函数都要有一个端口吗？”，而是考虑“需要在 JS 中完成什么？”，我们一直在考虑缓存，就像在高档餐厅中，你可以决定你想要的，但没法精确控制它们是怎么被安排给你的。你的高级别消息（食物订单）发送到厨房，然后你收到了一堆具体的信息（饮料、开胃菜、主食、点心等）。我的意思是**精心设计的端口可以将关注点完全分开**。Elm 可以根据需要执行视图操作，JavaScript 可以根据需要进行缓存。
> 
> 注意 2：目前没有 Elm 的 LocalStorage 包，建议用我们刚刚提到的端口。有些人想知道具体支持的时间表，我尝试在[这里](https://github.com/elm/projects/blob/master/roadmap.md#where-is-the-localstorage-package)提及。
> 
> 注意 3：一旦你 `subscribe` 到端口输出的信息，你也可以 `unsubscribe`。它的作用类似 `addEventListener` 和 `removeEventListener`，还需要功能的引用对等。