# Grep for JSON 

## Why this?
This CLI utility helps you digging into particular JSON value slot, it's useful when processing logs contains JSON or just checking against restful API response, it works in a way that processor will skip any non-JSON text so you don't have to rely on totally valid JSON output for this to work.      

## Usage

Run `npm install -g jsongrep` to install, then you can pipe any output lines that contains JSON pieces to this CLI command with a JSON path expression as argument, you can find [the full list of xpath](http://goessner.net/articles/JsonPath/) expression you can use. 

```!bash
cf env your-app | jsongrep credentials.uri
cf env your-app | jsongrep space_id
cf env your-app | jsongrep predix-uaa[0]..uri
```