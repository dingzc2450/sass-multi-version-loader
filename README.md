# sass-multi-version-loader

Compiles sass to css  using non-node-sass  and support webpack 2.x
This loader can only use **dart-sass** as the compiler and it supports **webpack 2.x**.

## Installation

```bash
npm install sass-multi-version-loader --save-dev
```

## Usage

```javascript
module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-multi-version-loader'
        ]
      }
    ]
  }
```

## Options
