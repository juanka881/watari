const fs = require('fs');
const shell = require('shelljs');
const path = require('path');

if(!fs.existsSync('dist')) {
    console.log('run `yarn build` first');
    process.exit(0);
}

const { task, sh } = require('./dist/src');

function getOutputDir() {
    const outDir = path.join('dist', 'src');
    return outDir;
}

function clean() {
    shell.rm('-rf', './dist');
}

function fmt() {
    const sources = `"${process.cwd()}/src/**/*.ts"`;
    const tests = `"${process.cwd()}/test/**/*.ts"`;
    sh([
        'npx --no-install',
        'prettier-eslint',
        sources,
        tests,
        '--write',
        '--single-quote true',
        '--semi',
        '--trailing-comma all',
        '--print-width 80',
        '--use-tabs',
        `--ignore "**/index.ts"`
    ]);
}

function lint() {
    fmt();
    sh([
        'npx --no-install eslint',
        '--fix',
        '--ext .ts,.tsx,.js',
        './src',
        './test'
    ]);
}

function build() {
    sh([
        'npx --no-install tsc',
        '--outDir dist',
        '--tsBuildInfoFile dist/.tsbuild'
    ]);
}

function test() {
    sh('npx --no-install jest');
}

function cover() {
    sh([
        'npx --no-install jest',
        '--coverage'
    ]);
}

function coverv() {
    sh('start dist/.coverage/lcov-report/index.html');
}

function pack() {
    clean();
    build();

    const outDir = getOutputDir();
    shell.cp('-u', 'package.json', outDir);

    sh('npm pack', { cwd: outDir });
}

function pub() {
    clean();
    build();

    const outDir = getOutputDir();
    shell.cp('-u', 'package.json', outDir);

    sh('npm publish', { cwd: outDir });
}

task({
    default: build,
    clean,
    fmt,
    lint,
    build,
    test,
    cover,
    coverv,
    pack,
    pub
});