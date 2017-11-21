# babel-plugin-replace-imports
Replaces import statements.

## Installation
```bash
npm install --save-dev babel-plugin-replace-imports
```

## Usage
> **WARNING**: this plugin is used only with options.

### Via `.babelrc`
Add the following line to your `.babelrc` file:
```javascript
{
  "plugins": [
    ["babel-plugin-replace-imports", {
      "test": /\/?regexp\//i,
      "replacer": "string"
    }]
  ]
}
```

### Using in conjunction with the `babel-loader`
You can pass options to the babel loader by using the options property (see the babel [options](https://webpack.js.org/configuration/module/#rule-options-rule-query)):
```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      use: {
        loader: "babel-loader",
        options: {
          plugins: ["babel-plugin-replace-imports", {
            "test": /\/?regexp\//i,
            "replacer": "string"
          }]
        }
      }
    }
  ]
}
```

## Options
Name     | Type               | Description |
-------- | ------------------ | --- |
test     | `RegExp`           | Regular expression is tested with the import instance. |
replacer | `String\|Function` | A string that replaces the substring specified by the specified `test` parameter. A number of special replacement patterns are supported (see [`String.prototype.replace()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)). <br/> A function to be invoked to create the new substring to be used to replace the matches to the given regexp of the `test` parameter. The arguments supplied to this function are described in the [`String.prototype.replace()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter). |

## Examples
### Example 1.
**Options**:
```javascript
{
  "plugins": [
    ["babel-plugin-replace-imports", {
      "test": /\.styl$/i,
      "replacer": "$&?theme-red"
    }]
  ]
}
```
**In**:
```javascript
import 'reset.styl';
import 'reset';
import './views';
import '../styles.styl';
import styl from '../stylus/common.styl';
```
**Out**:
```javascript
import 'reset.styl?theme-red';
import 'reset';
import './views';
import '../styles.styl?theme-red';
import styl from '../stylus/common.styl?theme-red';
```
### Example 2.
**Options**:
```javascript
{
  "plugins": [
    ["babel-plugin-replace-imports", {
      "test": /\.styl$/i,
      "replacer": [
        "$&?theme-red",
        "$&?theme-green",
        "$&?theme-blue"
      ]
    }]
  ]
}
```
**In**:
```javascript
import 'reset.styl';
import 'reset';
import './views';
import '../styles.styl';
import styl from '../stylus/common.styl';
```
**Out**:
```javascript
import 'reset.styl?theme-red';
import 'reset.styl?theme-green';
import 'reset.styl?theme-blue';
import 'reset';
import './views';
import '../styles.styl?theme-red';
import '../styles.styl?theme-green';
import '../styles.styl?theme-blue';
import styl from '../stylus/common.styl?theme-red';
import styl from '../stylus/common.styl?theme-green';
import styl from '../stylus/common.styl?theme-blue';
```
### Example 3.
> **WARNING**: only one replacement rule is processed. It depends on order of the option list.

**Options**:
```javascript
{
  "plugins": [
    ["babel-plugin-replace-imports", [
      {
        "test": /\/stylus\//,
        "replacer": "/sass/"
      }, {
        "test": /\.styl$/i,
        "replacer": "$&?theme-red"
      }
    ]]
  ]
}
```
**In**:
```javascript
import 'reset.styl';
import 'reset';
import './views';
import '../styles.styl';
import styl from '../stylus/common.styl';
```
**Out**:
For each import statement was done only one replacement rule.
```javascript
import 'reset.styl?theme-red';
import 'reset';
import './views';
import '../styles.styl?theme-red';
import styl from '../sass/common.styl';
```
