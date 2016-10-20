import { transformFileSync } from 'babel-core';
import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import gulpUtil from 'gulp-util';
import gulpBabel from 'gulp-babel';

describe('transforms assets', () => {
  const transform = (filename, config = {}) =>
    transformFileSync(path.resolve(__dirname, filename), {
      babelrc: false,
      presets: ['es2015'],
      plugins: [
        ['../../src/index.js', config],
      ],
    });

  it('replaces require statements with filename', () => {
    expect(transform('fixtures/require-txt.js', {
      extensions: ['txt'],
    }).code).to.be.equal(`'use strict';

var file = 'file.txt?9LDjftP';`);
  });

  it('replaces import statements with filename', () => {
    expect(transform('fixtures/import-txt.js', {
      extensions: ['txt'],
    }).code).to.be.equal(`'use strict';

var _file = 'file.txt?9LDjftP';

var _file2 = _interopRequireDefault(_file);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }`);
  });

  it('replaces import statements with filename and then exports', () => {
    expect(transform('fixtures/import-export-txt.js', {
      extensions: ['txt'],
    }).code).to.be.equal(`'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.file = undefined;
var _file = 'file.txt?9LDjftP';

var _file2 = _interopRequireDefault(_file);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.file = _file2.default;`);
  });


  it('replaces import statement with filename via gulp', (cb) => {
    const stream = gulpBabel({
      babelrc: false,
      presets: ['es2015'],
      plugins: [
        ['../../src/index.js', { extensions: ['txt'] }],
      ],
    });

    stream.on('data', (file) => {
      expect(file.contents.toString()).to.be.equal(`'use strict';

var _file = 'file.txt?9LDjftP';

var _file2 = _interopRequireDefault(_file);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }`);
    });

    stream.on('end', cb);

    stream.write(new gulpUtil.File({
      cwd: __dirname,
      base: path.join(__dirname, 'fixtures'),
      path: path.join(__dirname, 'fixtures/import-txt.js'),
      contents: fs.readFileSync(path.join(__dirname, 'fixtures/import-txt.js')),
    }));

    stream.end();
  });

  it('throws error when import/require statements are empty', () => {
    expect(() => transform('fixtures/empty-require.js', {
      extensions: ['txt'],
    })).to
      .throw(/^.+: Found empty import from .+\.$/);

    expect(() => transform('fixtures/empty-import.js', {
      extensions: ['txt'],
    })).to
      .throw(/^.+: Found empty import from .+\.$/);
  });
});
