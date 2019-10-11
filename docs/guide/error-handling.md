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

例如，假设我们正在运行一个社交网站，可以连接人们，建立友谊等。

## `Result`
