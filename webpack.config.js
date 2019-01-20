const path = require("path");
const fs = require("fs");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// We need Nodes fs module to read directory contents

const extractSass = new ExtractTextPlugin({
  filename: "styles.css"
});

// Our function that generates our html plugins
function generateHtmlPlugins(templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => {
    // Split names and extension
    const parts = item.split(".");
    const name = parts[0];
    const extension = parts[1];
    // Create new HTMLWebpackPlugin with options
    return new HTMLWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`)
    });
  });
}

// Call our function on our views directory.
const htmlPlugins = generateHtmlPlugins("./src/templates/");

module.exports = {
  entry: "./src/scripts/scripts.js",
  output: {
    path: path.resolve(__dirname, "dist"), // Output folder
    filename: "js/app.js" // JS output path
  },
  module: {
    rules: [
      // Include pug-loader to process the pug files
      {
        test: /\.pug$/,
        use: "pug-loader"
      },
      {
        test: /\.m?js$/,
        exclude: [/node_modules/],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            {
              loader: "css-loader"
            },
            {
              loader: "sass-loader"
            }
          ]
        })
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        // Match woff2 and patterns like .woff?v=1.1.1.
        test: /\.(|woff|woff2|eot|ttf|)(\?.*$|$)/,
        use: {
          loader: "url-loader",
          options: {
            limit: 50000,
            mimetype: "application/font-woff",
            name: "./fonts/[name].[ext]", // Output below ./fonts
            publicPath: "../" // Take the directory into account
          }
        }
      },

      {
        //IMAGE LOADER
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: "file-loader",
        options: {
          name: "./images/[name].[ext]" // Output below ./fonts
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              attrs: ["img:src", "source:srcset"]
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Extract our css to a separate css file
    extractSass,
    new ExtractTextPlugin("css/styles.css")
  ]
    // We join our htmlPlugin array to the end
    // of our webpack plugins array.
    .concat(htmlPlugins)
};
