# 错误处理

Elm 能保证的是你不会在实践过程中遇到运行时错误，这其中部分原因是 **Elm 将错误视为数据**。相对于程序崩溃，我们可以用自定义类型来对潜在的错误进行显式建模。例如，假设你想将用户输入变成年龄，你可以这样创建一个自定义类型：

```elm
type MaybeAge
  = Age Int
  | InvalidInput

toAge : String -> MaybeAge
toAge userInput =
  ...

-- toAge "24" == Age 24
-- toAge "99" == Age 99
-- toAge "ZZ" == InvalidInput
```

相比于因无效输入而崩溃，我们可以确信能得到 `Age 24` 或者 `InvalidInput`。无论我们输入什么，都会得到这两种结果之一。由此，我们就可以通过模式匹配来确保精确处理这两者情况，而不会导致崩溃！

这种事时常发生，比如，当你想将用户输入的内容转换为 `Post` 与他人共享，但却忘记输入标题或内容，该怎么办？我们可以对这些情况显式建模：

```elm
type MaybePost
  = Post { title : String, content : String }
  | NoTitle
  | NoContent

toPost : String -> String -> MaybePost
toPost title content =
  ...

-- toPost "hi" "sup?" == Post { title = "hi", content = "sup?" }
-- toPost ""   ""     == NoTitle
-- toPost "hi" ""     == NoContent
```

我们不仅描述了“输入无效”，还描述了可能出错的每种情况。如果我们有一个 `viewPreview : MaybePost -> Html msg` 函数来预览有效的 posts，那么当出现问题时，我们可以在预览区域中提供更具体的错误消息！

这些情况都是非常普遍的，而根据实际情况创建自定义类型通常都是非常有效的，但在某些简单的情况下，可以直接改用现有的类型。因此，本章接下来将探讨 `Maybe` 和 `Result` 类型，并展示它们是如何将你的错误当做数据来处理。

## `Maybe`

随着你深入使用 Elm，你总会看到 [`Maybe`](https://package.elm-lang.org/packages/elm-lang/core/latest/Maybe#Maybe) 这样的类型，比如：

```elm
type Maybe a
  = Just a
  | Nothing

-- Just 3.14 : Maybe Float
-- Just "hi" : Maybe String
-- Just True : Maybe Bool
-- Nothing   : Maybe a
```

该类型有两个不定类型，`Nothing` 或者 `Just`，类型变量可根据特定的值而确定是 `Maybe Float` 还是 `Maybe String`。

这在偏函数（partial functions）和可选字段（optional fields）两种情况下使用起来很方便。

### 偏函数

有时你想要一个可以为某些输入提供答​​案的函数，而对于其他输入则没有答案。`String.toFloat` 尝试将用户输入的内容转换为数字时，很多人会遇到这种情况：

```elm
> String.toFloat
<function> : String -> Maybe Float

> String.toFloat "3.1415"
Just 3.1415 : Maybe Float

> String.toFloat "abc"
Nothing : Maybe Float
```

尝试输入其他字符串来调用 `String.toFloat` 看看结果如何。

不是所有字符串都能被当做数字处理，所以该函数对其做了显式建模。字符串能变成浮点数吗？也许！从而我们可以对不同结果进行模式匹配，然后继续操作。

> **练习**：我在[这里](https://ellie-app.com/3P9hcDhdsc5a1)编写了一个简短的程序，可以将摄氏温度转换为华氏温度。请尝试以不同方式重构 `view`。你能给无效输入加上红色边框吗？你能添加其他的转换吗？比如将华氏温度转换为摄氏温度或者将英寸转换到米？

### 可选字段

另一个你能经常看到 `Maybe` 的地方是带有可选字段的 Record。

例如，假设我们正在运行一个社交网站，可以连接人们，建立友谊等，你能知道谁是间谍！洋葱网概述了我们在 2011 年的真实目标：[为CIA挖掘尽可能多的数据](https://www.theonion.com/cias-facebook-program-dramatically-cut-agencys-costs-1819594988)。如果我们想获得用户的所有数据，就得让用户对平台放心，可以稍后添加其他信息。同时，增加能够让他们随着时间推移分享更多信息的功能。

因此，我们从一个简单的用户模型开始。他们必须得有个名字，但我们可以把年龄设为可选项。

```elm
type alias User =
  { name : String
  , age : Maybe Int
  }
```

假如现在 Sue 要创建一个账号，但不打算添加年龄：

```elm
sue : User
sue =
  { name = "Sue", age = Nothing }
```

Sue 的朋友就不能在平台上祝她生日快乐，但我不知道她的朋友是否真的关心她...后来 Tom 也创建了一个账户并提供了年龄：

```elm
tom : User
tom =
  { name = "Tom", age = Just 24 }
```

太棒了，等到他生日那天一定会不一样！但更重要的是，Tom 属于有价值的人物画像，广告商们很喜欢！

OK，现在我们已经有了一些用户，那如何在不违法的情况下向他们出手酒类？如果我们向 21 岁以下的人推销，大众是会愤怒的，所以我们先检查一下：

```elm
canBuyAlcohol : User -> Bool
canBuyAlcohol user =
  case user.age of
    Nothing ->
      False

    Just age ->
      age >= 21
```

请注意，该 `Maybe` 类型会强制我们根据用户年龄进行模式匹配。实际上你是无法在用户没有年龄的前提下编码的，但 Elm 能让你做到！现在我们就可以放心宣传酒精饮料而不用担心会影响未成年！

### 避免过度使用

这种 `Maybe` 类型非常有用，但也有局限性。初学者很容易对其特性感到兴奋并到处使用，实际上很多时候用自定义类型更合适。

例如，假设我们有一个健身应用程序，可以与朋友 PK。你可以从朋友的姓名列表开始，以后再添加他们的其他健身信息，而你可能会这么建模：

```elm
type alias Friend =
  { name : String
  , age : Maybe Int
  , height : Maybe Float
  , weight : Maybe Float
  }
```

所有信息都在那儿了，但你没有真正为你的应用程序建立专门的数据模型，像这样建模会更清晰：

```elm
type Friend
  = Less String
  | More String Info

type alias Info =
  { age : Int
  , height : Float
  , weight : Float
  }
```

新的数据模型能获得更多关于你的应用程序的信息。这里有两种情况，一是你只拥有姓名，二是同时拥有姓名和更多信息。在你的 `view` 中，你只需考虑是显示 `Less` 还是 `More`，而不用担心诸如“如果我有一个 `age` 而不是一个 `weight` 该怎么办？”之类的问题，这对于精确的类型是不存在的。

> **注**：`null` 引用的相关信息
> `null` 引用的发明者 Tony Hoare 将其描述为：
>
> > *我称之为我的十亿美元错误。`null` 引用是在 1965 年提出的，那时，我正在设计第一个全面的类型系统，用于面向对象语言（ALGOL W）的引用。我的目的是确保所有引用的使用都绝对安全，并由编译器自动执行检查。但是我忍不住要插入一个空引用，仅仅是因为它是如此容易实现。这导致了无数的错误、漏洞和系统崩溃，在最近四十年中可能造成十亿美元的损失。*
> 
> 这种设计会造成潜在错误。每当你认为自己有一个 `String` 时，你往往获得的是一个 `null`，那你该检查吗？给你传值的人检查了吗？也许会自己好？也许它会导致你的服务器崩溃？我想我们稍后自会明白！
> 
> Elm 通过禁用 `null` 引用来避免这些潜在问题，反之用类似 `Maybe` 这样的类型来让错误暴露。这样一来就会再有突如其来的“惊喜”了。`String` 就是 `String`，而当你看到 `Maybe String`，Elm 编译器就会保证两种不定类型都被考虑在内。这样你在获得相同灵活性的同时不必担心出现意外崩溃。

## `Result`

`Maybe` 类型可以帮助处理可能出错的函数，但无法告知错在哪里。试想如果编译器在程序出错时只说 `Nothing`，那只能祝你好运了！

而这时 `Result` 类型就派上用场了，如下：

```elm
type Result error value
  = Ok value
  | Err error
```

它的作用是在出现问题时提供额外的信息，这对于错误报告和问题修复起到了很大的帮助。

### 错误报告

假设我们有一个网站，大家可以输入自己的年龄，我们用以下函数检查年龄是否合理：

```elm
isReasonableAge : String -> Result String Int
isReasonableAge input =
  case String.toInt input of
    Nothing ->
      Err "That is not a number!"

    Just age ->
      if age < 0 then
        Err "Please try again after you are born."

      else if age > 135 then
        Err "Are you some kind of turtle?"

      else
        Ok age

-- isReasonableAge "abc" == Err ...
-- isReasonableAge "-13" == Err ...
-- isReasonableAge "24"  == Ok 24
-- isReasonableAge "150" == Err ...
```

我们不仅可以检查年龄，还可以根据输入的具体内容显示对应的错误信息，这比起 `Nothing` 可要友好多了！

### 错误恢复

`Result` 类型还可以帮助你从错误中恢复，比如当你发起 HTTP 请求时。假设我们要显示 Leo Tolstoy 的《Anna Karenina》全文，而我们的 HTTP 请求导致 `Result Error String` 捕获了一个结果，其可能是请求全文成功，也可能是以多种不同的方式失败：

```elm
type Error
  = BadUrl String
  | Timeout
  | NetworkError
  | BadStatus Int
  | BadBody String

-- Ok "All happy ..." : Result Error String
-- Err Timeout        : Result Error String
-- Err NetworkError   : Result Error String
```

从中我们就如之前讨论的那样可以显示更友好的错误信息，但我们同时可以尝试从故障中恢复！如果我们看到 `Timeout`，那就是稍等片刻再重试，而如果我们看到的是 `BadStatus 404`，则没有必要重试。

下一章我们将说明如何发出 HTTP 请求，因此我们很快就会遇到 `Maybe` 和 `Result` 类型！