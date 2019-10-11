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

## 类型别名

Elm 允许你创建**类型别名**，别名是其他一些类型的简称，就像下面：

```elm
type alias User =
  { name : String
  , age : Int
  }
```

这样一来，我们就不必一直输入这个 record 类型，我们可以用 `User` 代替。比如，你可以简写类型注释：

```elm
isOldEnoughToVote : User -> Bool
isOldEnoughToVote user =
  user.age >= 18

-- The following type annotations are equivalent:
--
--     isOldEnoughToVote : User -> Bool
--     isOldEnoughToVote : { name : String, age : Int } -> Bool
--
```

我们做的就是给一个较长的类型创建别名，类型别名有助于我们编写更短、更清晰的类型注释。随着应用程序的迭代发展，这一点变得更加重要。假设我们有一个 `celebrateBirthday` 函数：

```elm
celebrateBirthday : User -> User
celebrateBirthday user =
  { user | age = user.age + 1 }

-- The following type annotations are equivalent:
--
--     celebrateBirthday : User -> User
--     celebrateBirthday : { name : String, age : Int } -> { name : String, age : Int }
--
```

使用类型别名后阅读起来更清晰，但这只是包含两个字段的 record，试想如果随着程序迭代，我们需要添加更多字段时，我们可以在 `User` 中添加 10 或者 100 个字段，而无需对 `celebrateBirthday` 函数进行任何更改，很棒对吧！

### Record 构造函数

当你创建专门用于 record 的类型别名时，它还会生成一个 **record 构造函数**，因此当我们定义一个 `User` 类型别名时，就可以像下面这样更改 record：

```sh
> type alias User = { name : String, age : Int }

> User
<function> : String -> Int -> User

> User "Sue" 58
{ name = "Sue", age = 58 } : User

> User "Tom" 31
{ name = "Tom", age = 31 } : User
```

现在你可以尝试创建一个自己的类型别名了！

记住，record 构造函数的参数顺序与类型别名的字段顺序必须保持一致！

另外，这仅限 record，为其他类型创建别名时不会生成构造函数。

## 自定义类型

::: tip
注意：自定义类型以往在 Elm 中成为“联合类型”，来自其他社区的名称包括 [tagged union](https://en.wikipedia.org/wiki/Tagged_union) 和 [ADTs](https://en.wikipedia.org/wiki/Algebraic_data_type)
:::

到目前为止，我们已经见了不少类型，如 `Bool`、`Int` 和 `String`，那么如何自定义我们自己的类型呢？

假如我们要编写一个聊天室程序，那每个人就需要一个名字，但有的用户可能没有注册永久账号，他们只在每次出现时给出一个名字。

我们可以通过定义一个 `UserStatus` 类型并列出所有可能的情况来描述即可：

```elm
type UserStatus = Regular | Visitor
```

`UserStatus` 有两个不定类型（Variant），即某人可能是 `Regular` 或 `Visitor`。我们可以用 record 来表示用户：

```elm
type UserStatus
  = Regular
  | Visitor

type alias User =
  { status : UserStatus
  , name : String
  }

thomas = { status = Regular, name = "Thomas" }
kate95 = { status = Visitor, name = "kate95" }
```

现在我们就可以追溯一个人是注册账户（Regular）还是访问账户（Visitor），这看上去不难，但我们可以让它更简单些。

除了创建自定义类型和类型别名外，我们还可以只用一个自定义类型来表示。因为 `Regular` 和 `Visitor` 两个不定类型都有对应的数据，而恰好对应的都是一个字符串：

```elm
type User
  = Regular String
  | Visitor String

thomas = Regular "Thomas"
kate95 = Visitor "kate95"
```

现在数据直接赋值给了 Variant，因此不再需要 Record。

这种方法的另一个好处是每个变量都可以拥有不同的数据。假设 `Regular` 用户注册时给出了年龄，我们没有很好的办法用 Record 去记录，但用自定义类型就没问题，现在让我们来给 `Regular` 添加一些数据：

```sh
> type User
|   = Regular String Int
|   | Visitor String
| 

> Regular
<function> : String -> Int -> User

> Visitor
<function> : String -> User

> Regular "Thomas" 44
Regular "Thomas" 44 : User

> Visitor "kate95"
Visitor "Thomas" : User
```

你可以尝试用名字和年龄创建一个 `Regular` 用户。

我们现在还只是添加了一个年龄的变量，而一个不定类型的变量可以有很大的不同。例如，当我们想为 `Regular` 用户添加位置，以便于建立局域聊天室，只需添加更多关联数据！或者当我们想拥有匿名用户，只需添加第三个变量 `Anonymous`，最后我们就会得到：

```elm
type User
  = Regular String Int Location
  | Visitor String
  | Anonymous
```

看上去不错！我们再来看看别的示例。

### Message 消息

在 [Elm 架构](/guide/the-elm-architecture)部分，我们看到一些例子中定义了 `Msg` 类型。这种类型在 Elm 中极为常见，比如在聊天室程序中，我们可以这么定义：

```elm
type Msg
  = PressedEnter
  | ChangedDraft String
  | ReceivedMessage { user : User, message : String }
  | ClickedExit
```

这里的 `Msg` 对应四个不同的不定类型，其中一些没有关联数据，另一些则有很多。注意 `ReceivedMessage` 用了一个 Record 作为关联数据，这没问题，任何类型都能作为关联数据。这样，你就可以非常准确地描述应用程序中的交互逻辑。

### 建模

当你能对不同情况准确建模时，自定义类型将变得非常强大。例如，当你在等待数据加载时，则可以用以下自定义类型来描述：

```elm
type Profile
  = Failure
  | Loading
  | Success { name : String, description : String }
```

这样，你可以从 `Loading` 状态开始，然后根据不同情况过渡到 `Failure` 或 `Success`。这使得编写一个在数据加载时始终显示合理内容的 `view` 函数非常容易。

现在我们知道了如何创建自定义类型，下一节我们将展示如何使用它们！

::: tip
<b>注意：自定义类型是 Elm 中最重要的功能。</b>它们很多深入的使用，尤其当你习惯了对场景精细化建模时。我尝试在附录的“以集合理解类型”和“以位理解类型”中分享了一些深度知识，希望能帮助你理解。
:::

## 模式匹配

在上一节中，我们学习了用 `type` 关键字创建自定义类型。我们的主要示例是聊天室中的 `User`：

```elm
type User
  = Regular String Int
  | Visitor String
```

即注册用户有名字和年龄，而访客只有名字，那实际上我们该如何使用这个自定义类型呢？

### `Case`

假设我们要用一个 `toName` 函数来显示 `User` 的名字，可以用以下的 `case` 表达式：

```elm
toName : User -> String
toName user =
  case user of
    Regular name age ->
      name

    Visitor name ->
      name

-- toName (Regular "Thomas" 44) == "Thomas"
-- toName (Visitor "kate95")    == "kate95"
```

该 `case` 表达式使我们能根据具体情况来分支处理，因而无论遇到的是 Thomas 还是 Kate，我们始终能知道如何显示其名字。

另外，如果我们使用像 `toName (Visitor "kate95" 44)`（译者注：该出的原文是 `toName (Visitor "kate95")`，是有效的）或者 `toName Anonymous` 这样的无效参数，编译器会立刻告诉我们。这也就意味着简单的错误可以在几秒钟内解决，而不会等到暴露在用户面前而花大量时间去修复。

### 通配符

我们刚定义的 `toName` 函数很好用，但你有没有注意到我们没用到 `age` 这个参数？当某些关联数据未使用时，通常使用“通配符”而无需为其具名：

```elm
toName : User -> String
toName user =
  case user of
    Regular name _ ->
      name

    Visitor name ->
      name
```

`_` 告诉我们这里存在有数据但未使用。