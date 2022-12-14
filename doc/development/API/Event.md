# Event.md

清单应用中，代办事项的数据结构。

## 代办事项类

- 下面为前端代码中存储代办事项的结构。

```javascript
{
    "id": String, // 事件的 uuid
    "brief": String, // 事件简介，若未提供则为「空」或「详细信息中的前若干个字」
    "description": String, // 事件详细内容
    "finished": Boolean, // 事件是否已经完成
    "importance": Level, // 事件的重要程度，Level 定义见后文。
    "time": Time, // 事件的时间，Time 定义见后文。
    // ...
}
```

## 事件的重要程度

- 按照「紧急」/「不紧急」，「重要」/「不重要」分为四类。
- `Level` 定义如下：（前端）
  ```javascript
  {
    "important": Boolean, // 是否重要
    "urgent": Boolean, // 是否紧急
  }
  ```

## 事件的时间

- 基本信息：
  - 发生时间，或起始/结束时间
  - 是否重复，及重复的具体信息
- `Time` 定义如下：（前端）
  ```javascript
  {
    "beginTime": {
      "date": Date, // 只有年月日数据有效，必需
      "time": Date, // 只有时分秒数据有效，非必需
    }, // 非必需，但如果存在则一定有 date 属性
    "endTime": {
      "date": Date, // 只有年月日数据有效，必需
      "time": Date, // 只有时分秒数据有效，非必需
    }, // 非必需，但如果存在则一定有 date 属性
    "repetition": {
        "enabled": Boolean, // 是否重复
        "deltaBase": String, // 「间隔」的时间单位
        "delta": Number, // 与 deltaBase 相乘，得到真正的间隔
    }
  }
  ```