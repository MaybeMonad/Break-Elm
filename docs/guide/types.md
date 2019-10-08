# 类型

Elm 的主要好处之一是**用户在程序运行时不会遇到运行时错误**，这要得益于 Elm 编译器能快速分析源代码得到程序中*值的流向*。假如你没有正确使用某个值，Elm 编译器会通过友好的错误提示信息告诉你该值的信息，即**类型推断**。Elm 编译器能确定出入函数的值的类型。

### 类型推断示例

以下代码定义了一个提取全名为字符串的函数 `toFullName`：

```elm
toFullName person =
  person.firstName ++ " " ++ person.lastName

fullName =
  toFullName { fistName = "Hermann", lastName = "Hesse" }
```

就像在 JavaScript 和 Python 中一样，我们写完这样的代码是没有问题的，但你发现错误了吗？

在 JavaScript 中，等效代码会输出 `undefined Hesse`，甚至没有错误！你只能希望某个用户发现它时顺便能告诉你，相反，Elm 编译器仅查看源代码就能告诉你：

```sh
-- TYPE MISMATCH ---------------------------------------------------------------

The argument to function `toFullName` is causing a mismatch.

6│   toFullName { fistName = "Hermann", lastName = "Hesse" }
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Function `toFullName` is expecting the argument to be:

    { …, firstName : … }

But it is:

    { …, fistName : … }

Hint: I compared the record fields and found some potential typos.

    firstName <-> fistName
```

Elm 发现 `toFullName` 接收的参数类型是错误的，就如错误提示信息所言，应该是有人将 `first` 错写成了 `fist`。

拥有这样的错误提示助手是一件很棒的事，尤其当你需要和一群协作者共同处理数百个文档时，其价值不言而喻。不论程序变得如何复杂，Elm 编译器都能根据源代码检查代码是否正确。

当你越了解类型，就越会觉得编译器的错误提示功能真的太好用了！那么，让我们更进一步吧。

## 解读类型

在[语言核心](/guide/core-language)章节中，我们已经通过一些示例初步了解了 Elm，接下来我们重新来看看，但这次要带上一个新问题：这都是**什么类型**的值？

```sh
> "hello"
"hello" : String

> not True
False : Bool

> round 3.1415
3 : Int
```

你可以尝试在 `repl` 中输入 `3.1415` 然后回车，打印结果会是 `3.1415 : Float`。

那么，这代表什么意思？每个输入的输出结果都会跟上它对应的类型，就等效于：

+ `"hello"` 是 `String`
+ `False` 是 `Bool`
+ `3` 是 `Int`
+ `3.1415` 是 `Float`

Elm 能确定你输入的任何值的类型！让我们再看看输入列表会发生什么：

```sh
> [ "Alice", "Bob" ]
["Alice","Bob"] : List String

> [ 1.0, 8.6, 42.1 ]
[1.0,8.6,42.1] : List Float
```

你可以理解这些类型为：

+ 我们有一个充满 `String` 值的列表
+ 我们有一个充满 `Float` 值的列表

这里的**类型**只是对我们所关注的值的大致描述。

### 函数

让我们来看一眼函数的类型显示：

```sh
> String.length
<function> : String -> Int
```

你可以尝试在 `repl` 中输入 `round` 和 `sqrt` 来查看其类型。

从上述代码可以看出 `String.length` 函数具有 `String -> Int` 的类型，即意味着它**必须**接收一个字符串参数，并且*肯定*会返回一个整数，让我们尝试给它一个参数：

```sh
> String.length "Supercalifragilisticexpialidocious"
34 : Int
```

我们输入了一个字符串 `Supercalifragilisticexpialidocious`，而结果就是整数 `34`。

那如果我们不传入字符串会发生什么？尝试输入 `String.length [1,2,3]` 和 `String.length True`。

你会发现 Elm 编译器给了你错误信息，提示你该函数接收的函数必须是字符串。

> 注意：接收多个参数的函数会拥有多个箭头，参数越多，箭头也越多，例如以下接收两个参数的函数：
> ```sh
> > String.repeat
> <function> : Int -> String -> String
> ```
> 我们输入 `String.repeat 3 "ha"` 就会输出 `"hahaha"`，它会让你以为用 `->` 分离参数是一种怪异的用法，我在[这里](https://guide.elm-lang.org/appendix/function_types.html)详细解释了原理，非常清晰！

### 类型注释

到目前为止，我们只是让 Elm 自己去弄清楚类型，而它也允许我们在定义行的上一行编写**类型注释**，因此，在编写代码时可以：

```elm
half : Float -> Float
half n =
  n / 2

-- half 256 == 128
-- half "3" -- error!

hypotenuse : Float -> Float -> Float
hypotenuse a b =
  sqrt (a^2 + b^2)

-- hypotenuse 3 4  == 5
-- hypotenuse 5 12 == 13

checkPower : Int -> String
checkPower powerLevel =
  if powerLevel > 9000 then "It's over 9000!!!" else "Meh"

-- checkPower 9001 == "It's over 9000!!!"
-- checkPower True -- error!
```

类型注释不是强制性的，但我非常之建议你能将它加上，其好处包括：

1. **错误信息的质量** - 当你添加类型注释，它就等于告诉编译器你想做的事情。你的代码实现可能会出现错误，而现在 Elm 编译器可以比对你的注释声明，如：“You said argument `powerLevel` was an `Int`, but it is getting used as a `String`!”
2. **说明文档** - 当你再次查看该代码（或同事第一次查看）时，可以准确知道函数进出而无需仔细阅读实现文档。

人们可能会在类型注释上犯错误，那如果注释和实现不匹配怎么办？Elm 编译器会自行找出所有类型，并检查注释和实际是否匹配。换句话说，编译器始终会验证添加的注释是否正确。因此，你可以获得更好的错误消息和最新的文档说明。

### 类型变量

当你浏览 `elm/core` 中的函数时，你会看到一些带小写字母 `a` 的类型签名，比如在 `repl` 中输入：

```sh
> List.length
<function> : List a -> Int
```

这里的 `a` 就是所谓的**类型变量**，它可根据 `List.length` 使用方式而有所不同：

```sh
> List.length [1,1,2,3,5,8]
6 : Int

> List.length [ "a", "b", "c" ]
3 : Int

> List.length [ True, False ]
2 : Int
```

我们只需要长度，所以列表中的内容并不重要，而类型变量 `a` 意指我们可以匹配任何类型。让我们看另一个常见的例子：

```sh
> List.reverse
<function> : List a -> List a

> List.reverse [ "a", "b", "c" ]
["c","b","a"] : List String

> List.reverse [ True, False ]
[False, True] : List Bool
```

同样，类型变量 `a` 可以根据 [`String.reverse`](https://package.elm-lang.org/packages/elm/core/latest/List#reverse) 的使用方式而变化。但在上面这种情况中，`a` 在参数和结果中都有，这便意味着，如果你输入一个 `List Int`，那你必须得到一个 `List Int`。换句话说，一旦我们确定了 `a` 的类型，那它就是那个类型。

> 注意：类型变量必须以小写字母开头，可以是完整的单词。如我们可以将 `List.length` 的类型写成 `List value -> Int`，或者将 `List.reverse` 的类型写成 `List element -> List element`，所以只要是小写开头即可。在很多地方，类型变量 `a` 和 `b` 都已经被用成惯例了，但某些类型注释还是写具体些更好。

### 约束类型变量

有一些“约束”类型的变量，最常见的可能是 `number`，函数 `negate` 会用到它：

```sh
> negate
<function> : number -> number
```

在 `repl` 中试试 `negate 3.1415`、`negate (round 3.1415)` 和 `negate "hi"`。

通常，类型变量可以指代任何值，但 `number` 只能指代 `Int` 和 `Float`，它限制了可能性。

约束类型变量的完整列表：

+ `number` 允许 `Int` 和 `Float`
+ `appendable` 允许 `String` 和 `List a`
+ `comparable` 允许 `Int`、`Float`、`Char`、`String` 和由以上类型组合的列表或元组
+ `compappend` 允许 `String` 和 `List comparable`

这些约束类型变量的存在使得像 `(+)` 和 `(<)` 这样的运算符在使用上更灵活了。