# 摸鱼派 API 文档

## 注意事项

* 请一定要在请求时带上 UA，推荐使用 Chrome 的 UA，空 UA 将返回 500 状态码
* 对单个接口的访问频率必须控制在最低1次/30秒，否则IP可能进入小黑屋（WebSocket、发送消息接口除外）
* 所有WebSocket频道设计时必须有断开自动重连机制

## 鉴权

摸鱼派社区 API 引入了 `apiKey` 的概念，对 API 的请求不需要提供 Cookie，只需要在参数中带上申请的 `apiKey` 即可。

> 注意：凡是 POST 请求，请求体必须是 JSON 格式，例如：`{ "nameOrEmail":"","userPassword":"" }`

### 获取 apiKey

`POST` `/api/getKey`

用于 API 获取摸鱼派的通用密钥，`Key` 即身份，`Key` 长期有效，如果服务器重启，则需要重新获取，建议配合 `/api/user` 接口定期检测 `Key` 是否有效。

请求:

| Key          | 说明                               | 示例                             |
| ------------ | ---------------------------------- | -------------------------------- |
| nameOrEmail  | 用户名或邮箱地址                   | username                         |
| userPassword | 使用 MD5 加密后的密码*             | e10adc3949ba59abbe56e057f20f883e |
| mfaCode      | 两步认证一次性密码（如未设置留空） | 123456                           |

请求示例：

```bash
curl --location --request POST 'https://fishpi.cn/api/getKey' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36' \
--data-raw '{
 "nameOrEmail":"username",
 "userPassword":"e10adc3949ba59abbe56e057f20f883e",
 "mfaCode":"123456"
}'
```

> <sup>*</sup> 注意：这里不支持直接传递明文，必须是32位小写MD5加密后的密码

响应：

| Key  | 说明                           | 示例                             |
| ---- | ------------------------------ | -------------------------------- |
| Key  | API 通用密钥，用于用户身份识别 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| msg  | 错误信息                       | 密码错误                         |
| code | 0 为请求成功，-1 失败          | -1                               |

### 查询用户信息

`GET` `/api/user?apiKey=<Key>`

通过指定的 API Key 查询用户信息（可以用来定期验证 API Key 是否有效）

请求:

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例：

```bash
curl --location --request GET 'https://fishpi.cn/api/user?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS'
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36' \
```

响应：

| Key                  | 说明                                                                  | 示例                                              |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| code                 | 为0则密钥有效，为-1则密钥无效                                         | 0                                                 |
| msg                  | 错误信息                                                              | Invalid Api Key.                                  |
| data*                | 对应用户详细信息                                                      | `{ ... }`                                         |
| - oId                | Id                                                                    | 1630512345670                                     |
| - userNo             | 用户序号                                                              | 26                                                |
| - userName           | 用户名                                                                | imlinhanchao                                      |
| - userRole           | 用户组                                                                | OP                                                |
| - userNickname       | 昵称                                                                  | 我是跳跳吧                                        |
| - userAvatarURL      | 头像地址                                                              | https://...                                       |
| - userCity           | 最近所在城市，根据用户 IP 确定                                        | 深圳                                              |
| - userOnlineFlag     | 是否在线                                                              | true                                              |
| - onlineMinute       | 在线时长，单位分钟                                                    | 85467                                             |
| - userPoint          | 积分                                                                  | 183939                                            |
| - userAppRole        | 角色                                                                  | 0 = 黑客，1 = 画家                                |
| - userIntro          | 签名                                                                  | 人生而自由，卻無往不在枷鎖之中。                  |
| - userURL            | URL                                                                   | https://...                                       |
| - cardBg             | 卡片背景                                                              | https://...                                       |
| - followingUserCount | 关注用户                                                              | 5                                                 |
| - sysMetal           | 徽章列表, JSON**字符串**                                              | `{ ... }`                                         |
| -- list              | 徽章列表数据                                                          | `[ ... ]`                                         |
| --- attr             | 徽章数据，包含徽章图地址`url`, 背景色 `backcolor`, 前景色 `fontcolor` | url=https://...&backcolor=b91c22&fontcolor=ffffff |
| --- name             | 徽章名称                                                              | Operator                                          |
| --- description      | 徽章描述                                                              | 摸鱼派官方开发组成员                              |
| --- data             | 徽章数据                                                              | 无                                                |

> <sup>*</sup> 注意：若密钥无效，无 `data` 项目

### 注册用户

以下关于注册用户接口的内容我以提供注册思路为导向进行编写，方便大家对接。

**第一步** 获取一个图形验证码，要求用户识别并填写，带入到第二步的请求中

获取图形验证码可访问 `GET /captcha`

**第二步** 向摸鱼派请求获取短信验证码

`POST /register`

请求:

| Key        | 说明                                                                                                                                             | 示例        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| userName   | 用户名                                                                                                                                           | adlered     |
| userPhone  | 手机号                                                                                                                                           | 13261327290 |
| invitecode | 邀请码（选填，无则留空，必须提供让用户填写邀请人的输入框，如果用户留空，可以将作者作为邀请人，但如果用户主动填写了邀请人，则必须按用户输入请求） | 000000      |
| captcha    | 第一步的验证码（大小写不敏感）                                                                                                                   | abcd        |

**第三步** 验证短信验证码是否正确

`GET /verify?code=<code>`

请求：

| Key  | 说明       | 示例   |
| ---- | ---------- | ------ |
| code | 短信验证码 | 123456 |

返回结果后请验证返回 JSON 中 code 的值是否为 0，如为 0 则验证码正确，**并记录下返回的userId**。

**第四步** 设定密码和邮箱

`POST /register2?r=<r>`

**请注意！请将密码在本地MD5加密后再放到 userPassword 中！不接受明文密码！**

| Key          | 说明                                   | 示例                             |
| ------------ | -------------------------------------- | -------------------------------- |
| userAppRole  | 角色（0为黑客，1为画家）               | 0                                |
| userPassword | 使用 MD5 加密后的密码 *                | e10adc3949ba59abbe56e057f20f883e |
| userId       | 请填写第三步返回的userId               | 1652062402334                    |
| r            | 邀请人的用户名（选填，无邀请人则留空） | csfwff                           |

code 返回 0 则注册成功！

## 通用

### 通过API累计用户的在线时间

`wss://fishpi.cn/user-channel?apiKey=<Key>`

客户端开发者请注意，如果想让用户在使用客户端时也能累计在线时间，请将客户端在后台长期连接到此Websocket。此Websocket不会给你发送任何消息，你也不用给他发送任何消息，只需要挂着这个连接就可以了。

此Websocket在 `首次连接`时开始累计在线时间，直到 `最后一个该用户的user-channel会话断开`才会结算。期间如果你获取在线时间是不会动态变化的，你可以在客户端的前端做一个60秒的循环，每60秒把在线时间+1，这样在用户观感上在线时间就是动态的了。

注意：为确保计算准确，必须**有**断开自动重连机制，但请**不要**发送心跳包，Websocket会每15分钟断开一次。

### 查询成员信息

`GET` `/user/<username>?apiKey=<Key>`

查询某个成员的信息

请求:

| Key      | 说明      | 示例                             |
| -------- | --------- | -------------------------------- |
| username | 用户名    | taozhiyu                         |
| apiKey   | 通用密钥* | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

> <sup>*</sup> 选填，填写后 `canFollow` 返回值可以显示是否已经关注该用户

请求示例：

```bash
curl --location --request GET 'https://fishpi.cn/user/taozhiyu?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS'\
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36' \
```

响应：

| Key                | 说明                                                                  | 示例                                              |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------- |
| oId                | Id                                                                    | 1630512345670                                     |
| userNo             | 用户序号                                                              | 26                                                |
| userName           | 用户名                                                                | imlinhanchao                                      |
| userRole           | 用户组                                                                | OP                                                |
| userNickname       | 昵称                                                                  | 我是跳跳吧                                        |
| userAvatarURL      | 头像地址                                                              | https://...                                       |
| userCity           | 最近所在城市，根据用户 IP 确定                                        | 深圳                                              |
| userOnlineFlag     | 是否在线                                                              | true                                              |
| onlineMinute       | 在线时长，单位分钟                                                    | 85467                                             |
| userPoint          | 积分                                                                  | 183939                                            |
| canFollow          | 是否可以关注                                                          | no/yes/hide                                       |
| userAppRole        | 角色                                                                  | 0 = 黑客，1 = 画家                                |
| userIntro          | 签名                                                                  | 人生而自由，卻無往不在枷鎖之中。                  |
| userURL            | URL                                                                   | https://...                                       |
| cardBg             | 卡片背景                                                              | https://...                                       |
| followingUserCount | 关注用户                                                              | 5                                                 |
| sysMetal           | 徽章列表, JSON**字符串**                                              | `{ ... }`                                         |
| - list             | 徽章列表数据                                                          | `[ ... ]`                                         |
| -- attr            | 徽章数据，包含徽章图地址`url`, 背景色 `backcolor`, 前景色 `fontcolor` | url=https://...&backcolor=b91c22&fontcolor=ffffff |
| -- name            | 徽章名称                                                              | Operator                                          |
| -- description     | 徽章描述                                                              | 摸鱼派官方开发组成员                              |
| -- data            | 徽章数据                                                              | 无                                                |

### 用户名联想

`POST /users/names`

通过现有的字符串推断完整的用户名（列表）

请求:

| Key  | 说明           | 示例 |
| ---- | -------------- | ---- |
| name | 不完整的用户名 | ad   |

请求示例：

```bash
curl --location --request POST 'https://fishpi.cn/users/names' \
--header 'Content-Type: application/json' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36' \
--data-raw '{
 "name":"ad"
}'
```

响应：

| Key             | 说明                          | 示例        |
| --------------- | ----------------------------- | ----------- |
| code            | 为0则密钥有效，为-1则密钥无效 | 0           |
| msg             | 错误信息                      |             |
| data            | 用户列表                      | `[ ... ]`   |
| - userAvatarURL | 头像                          | https://... |
| - userName      | 用户名                        | adlered     |

### 用户常用表情

`GET /users/emotions?apiKey=<Key>`

获取用户常用表情

请求:

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例：

```bash
curl --location --request GET 'https://fishpi.cn/users/emotions?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
```

响应：

| Key              | 说明                              | 示例              |
| ---------------- | --------------------------------- | ----------------- |
| code             | 为0则密钥有效，为-1则密钥无效     | 0                 |
| msg              | 错误信息                          |                   |
| data             | 表情列表                          | `[ ... ]`         |
| -`<<`emoji name> | Key 为 emoji 代码，值为对应 emoji | "smile":":smile:" |

### 获取活跃度

`GET /user/liveness?apiKey=<Key>`

获取用户活跃度

> **警告:warning:️️️️️️️️️️️️️️️️️️**:
> 本接口负载较大，请至少将请求间隔延长至**10 分钟**，如间隔小于 10 分钟，接口将会返回 500！

请求：

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例：

```bash
curl --location --request GET 'https://fishpi.cn/user/liveness?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
```

响应：

| Key      | 说明   | 示例  |
| -------- | ------ | ----- |
| liveness | 活跃度 | 80.20 |

### 获取签到状态

`GET /user/checkedIn?apiKey=<Key>`

获取用户是否签到

请求:

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例:

```bash
curl --location --request GET 'https://fishpi.cn/user/checkedIn?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
```

响应：

| Key       | 说明     | 示例 |
| --------- | -------- | ---- |
| checkedIn | 是否签到 | true |

### 领取昨日活跃奖励

`GET /activity/yesterday-liveness-reward-api?apiKey=<Key>`

领取昨日活跃奖励

请求示例:

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例:

```bash
curl --location --request GET 'https://fishpi.cn/activity/yesterday-liveness-reward-api?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
```

响应：

| Key | 说明                        | 示例 |
| --- | --------------------------- | ---- |
| sum | 领取到的积分，-1 表示已领取 | 300  |

### 查询昨日奖励领取状态

`GET /api/activity/is-collected-liveness`

查询昨日活跃奖励是否已被领取

请求示例:

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例:

```bash
curl --location --request GET 'https://fishpi.cn/api/activity/is-collected-liveness?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
```

响应：

| Key                                | 说明            | 示例 |
| ---------------------------------- | --------------- | ---- |
| isCollectedYesterdayLivenessReward | true 表示已领取 | true |

### 举报

`POST /report`

举报内容接口
**请注意！** 该接口为复用接口，请确保 `Content-Type` 为 `application/x-www-form-urlencoded` 而非JSON，否则将无法请求成功

请求：

| Key            | 说明         | 示例                                                                                              |
| -------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| apiKey         | 通用密钥     | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS                                                                  |
| reportDataId   | 举报 Id      | 1651126540998                                                                                     |
| reportDataType | 举报数据类型 | 0:文章,1:评论,2:用户,3:聊天消息                                                                   |
| reportType     | 举报类型     | 0:垃圾广告,1: H,2:违规,3:侵权,4:人身攻击,5:冒充他人账号,6:垃圾广告账号,7:违规泄露个人信息,49:其他 |
| reportMemo     | 举报理由     | 该用户涉嫌发送违规内容                                                                            |

请求示例：

```bash
curl --location --request POST 'https://fishpi.cn/report' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36' \
--header 'Content-Type: application/json' \
--data-raw '{
 "apiKey":"oXTQTD4ljryXoIxa1lySgEl6aObrIhSS",
 "reportDataId":"1651126540998",
 "reportDataType":3,
 "reportType":49,
 "reportMemo":""，
}'
```

响应：

| Key  | 说明                              | 示例 |
| ---- | --------------------------------- | ---- |
| code | 为 0 则密钥有效，为 -1 则密钥无效 | 0    |
| msg  | 错误消息                          |      |

### 查询最近注册的20个用户

`GET /api/user/recentReg`

### 转账

`POST /point/transfer`

请求：

| Key      | 说明     | 示例                             |
| -------- | -------- | -------------------------------- |
| apiKey   | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| userName | 收款人   | adlered                          |
| amount   | 转账金额 | 100                              |
| memo     | 转账备注 | hello                            |

### 关注用户

`POST /follow/user`

请求：

| Key         | 说明          | 示例                             |
| ----------- | ------------- | -------------------------------- |
| apiKey      | 通用密钥      | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| followingId | 关注对象的oId | 1659430635383                    |

### 取关用户

`POST /unfollow/user`

请求：

| Key         | 说明          | 示例                             |
| ----------- | ------------- | -------------------------------- |
| apiKey      | 通用密钥      | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| followingId | 关注对象的oId | 1659430635383                    |

### 修改用户信息

`POST /api/settings/profiles`

请求：

| Key          | 说明                             | 示例                             |
| ------------ | -------------------------------- | -------------------------------- |
| apiKey       | 通用密钥                         | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| userNickname | 用户昵称                         | 阿达                             |
| userTags     | 用户标签，多个标签用英文逗号分隔 | 标签1,标签2                      |
| userURL      | 用户URL                          | https://xxx.com                  |
| userIntro    | 个性签名                         | 这个人很懒，没有个性签名         |
| mbti         | 用户的MBTI                       | ENFJ-A                           |

### 修改用户头像

`POST /api/settings/avatar`

请求：

| Key           | 说明        | 示例                                   |
| ------------- | ----------- | -------------------------------------- |
| apiKey        | 通用密钥    | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS       |
| userAvatarURL | 用户头像URL | https://file.fishpi.cn/2025/12/xxx.png |

### 查询用户积分余额

`GET /user/{用户名}/point`

### 查询积分记录

`GET /api/user/points`

分页查询当前用户积分记录。管理员可通过 `userId` 查询指定用户。

请求：

| Key    | 说明                    | 示例                             |
| ------ | ----------------------- | -------------------------------- |
| apiKey | 通用密钥                | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| p      | 页码，默认 1            | 1                                |
| size   | 每页数量，默认 20，最大 200 | 20                               |
| userId | 用户 oId，仅管理员可用  | 1659430635383                    |

请求示例：

```bash
curl --location --request GET 'https://fishpi.cn/api/user/points?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS&p=1&size=20' \
--header 'User-Agent: Mozilla/5.0'
```

响应：

| Key                              | 说明                 | 示例          |
| -------------------------------- | -------------------- | ------------- |
| code                             | 0 为成功，-1 为失败  | 0             |
| msg                              | 错误消息             |               |
| data                             | 响应数据             |               |
| - userId                         | 用户 oId             | 1659430635383 |
| - records                        | 积分记录列表         |               |
| -- oId                           | 记录 oId             | 1760000000000 |
| -- fromId                        | 支出用户 oId         | 1659430635383 |
| -- toId                          | 收入用户 oId         | sys           |
| -- sum                           | 积分数量             | 20            |
| -- type                          | 记录类型             | 8             |
| -- time                          | 记录时间             | 1760000000000 |
| -- dataId                        | 关联数据             | 1760000000000 |
| -- memo                          | 备注                 | hello         |
| -- operation                     | 收支方向             | +             |
| -- balance                       | 操作后余额           | 183939        |
| -- displayType                   | 类型名称             | 活动收益      |
| -- description                   | 记录描述             | 签到奖励      |
| - pagination                     | 分页信息             |               |
| -- paginationCurrentPageNum      | 当前页               | 1             |
| -- paginationPageSize            | 每页数量             | 20            |
| -- paginationRecordCount         | 总记录数             | 100           |
| -- paginationPageCount           | 总页数               | 5             |
| -- paginationPageNums            | 页码列表             | [1,2,3,4,5]   |

### 查询用户勋章

`GET /user/{用户名}/medal`

## 通知

### 通知计数

`GET /notifications/unread/count`

获取用户未阅读的通知计数

请求：

| Key    | 说明     | 示例                             |
| ------ | -------- | -------------------------------- |
| apiKey | 通用密钥 | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |

请求示例:

```bash
curl --location --request GET 'https://fishpi.cn/notifications/unread/count?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
```

响应：

| Key                              | 说明                              | 示例 |
| -------------------------------- | --------------------------------- | ---- |
| code                             | 为 0 则密钥有效，为 -1 则密钥无效 | 0    |
| userNotifyStatus                 | 是否启用 Web 通知                 | 0    |
| unreadNotificationCnt            | 未读通知数                        | 0    |
| unreadReplyNotificationCnt       | 未读回复通知数                    | 0    |
| unreadPointNotificationCnt       | 未读积分通知数                    | 0    |
| unreadAtNotificationCnt          | 未读 @ 通知数                     | 0    |
| unreadBroadcastNotificationCnt   | 未读同城通知数                    | 0    |
| unreadSysAnnounceNotificationCnt | 未读系统通知数                    | 0    |
| unreadNewFollowerNotificationCnt | 未读关注者通知数                  | 0    |
| unreadFollowingNotificationCnt   | 未读关注通知数                    | 0    |
| unreadCommentedNotificationCnt   | 未读评论通知数                    | 0    |

### 通知详情

`GET /api/getNotifications?apiKey=<Key>&type=<type>[&page=<page>]`

获取详细通知列表

请求：

| Key    | 说明              | 示例                             |
| ------ | ----------------- | -------------------------------- |
| apiKey | 通用密钥          | oXTQTD4ljryXoIxa1lySgEl6aObrIhSS |
| type   | 要获取的通知类型  | point                            |
| p      | 页数可选，默认为1 | 1                                |

通知类型：

| Type         | 说明       |
| ------------ | ---------- |
| point        | 积分       |
| commented    | 收到的回帖 |
| reply        | 收到的回复 |
| at           | 提及我的   |
| following    | 我关注的   |
| broadcast    | 同城       |
| sys-announce | 系统       |

请求示例:

```bash
curl --location --request GET 'https://fishpi.cn/api/getNotifications?apiKey=oXTQTD4ljryXoIxa1lySgEl6aObrIhSS&type=point' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
