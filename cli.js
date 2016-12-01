#!/usr/bin/env node

const JSONPath = require('jsonpath-plus');
const tokenizer = require('json-tokenizer');
let query = process.argv[2] || '$';
const byline = require('byline');

// Alias to
if (!/^\$/.test(query)) {
  query = '$..' + query;
}

let t;
// looking for object or array
const OPEN_REGEX = /^begin-(object|array)$/;

let rl = byline(process.stdin);
rl.setEncoding('utf8');
rl.on('readable', function() {

  (function create_tokenizer() {
    t = tokenizer();
    t.obj_count = 0;
    t.open_type = t.close_type = null;
    t.json_buffer = [];

    t.on('data', function(token) {
      // check for JSON start
      if (!t.open_type && OPEN_REGEX.test(token.type)) {
        t.open_type = token.type;
        t.close_type = token.type.replace(/^begin/, 'end');
      }

      if (t.open_type === token.type) {
        t.obj_count++;
      }

      if (t.obj_count) {
        t.json_buffer.push('' + token);
      }

      // JSON end
      if (t.close_type === token.type) {
        t.obj_count--;
        if (!t.obj_count) {
          // Parse JSON fragment, silent skip any error
          try {
            let json = JSON.parse(t.json_buffer.join(''));
            let result = JSONPath({path: query, json: json});

            if (result.length) {
              if (result.length === 1) {
                result = result[0];
              }

              // echo result
              if (typeof result !== 'object') {
                console.log(result);
              } else {
                console.log(JSON.stringify(result, null, '  '));
              }
            }
          }
          catch (er) {}

          // reset
          t.open_type = t.close_type = null;
          t.obj_count = 0;
          t.json_buffer = [];
        }
      }
    });
    t.on('error', create_tokenizer);
  })();

  (function readLine() {
    let line;
    if ((line = rl.read()) !== null) {
      t.write(line + '\n', readLine);
    }
  })();
});