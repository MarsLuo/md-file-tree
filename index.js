#!/usr/bin/env node
'use strict';

const tree = require('./walker');

const emoji = process.argv.includes('--emoji') || process.argv.includes('-e');

const ignoreTypes = () => {
    let index = process.argv.indexOf('--ignore');
    if(index != -1) {
        let ignoreTypeStr = process.argv[index+1];
        let ignoreTypeList = ignoreTypeStr.split(',').map(s => s.trim());
        return ignoreTypeList
    }
    return []
}
let ignoreTypeList = ignoreTypes()

const cleanMarkdown = name => name.replace(/([\\\/_*|-])/g, '\\$1');
const directoryName = name => {
    return '- ' + (emoji ? '📂 ' : '') + '__' + cleanMarkdown(name) + '__\n';
};

const filename = (name, path) => {
    const newpath = path.replace(/^\/?(.+?)\/?$/, '$1')
    const link = encodeURIComponent(newpath) + '/' + encodeURIComponent(name);
    return '- ' + (emoji ? '📄 ' : '') + '[' + cleanMarkdown(name) + '](' + link.replace(/^\/?(.+?)$/, '$1') + ')\n';
};

const checkTypeCanBeInore = (ignoreType, fileType) => {
    return ignoreType.includes(fileType)
}

const fileType = (fileName) => {
    return fileName.split('.').pop();
};

const addIndentation = i => {
    return ' '.repeat(i * 2 + 1);
};

const main = () => {
    const dirPath = process.cwd();
    const dir = dirPath.split('/').pop();

    let indentation = 0;
    let output = directoryName(dir);

    const parseResult = result => {
        indentation++;
        Object.keys(result).sort().forEach(key => {
            const data = result[key];
            if (typeof data === 'string' && key[0] !== '.' ) {

                if (checkTypeCanBeInore(ignoreTypeList, fileType(key))) {
                    return
                }

                const path = data.split('/');
                output += addIndentation(indentation) + filename(path.pop(), path.join('/'));
            } else if (typeof data === 'object') {
                if (checkTypeCanBeInore(ignoreTypeList, fileType(key))) {
                    return
                }
                
                output += addIndentation(indentation) + directoryName(key);
                parseResult(data);
                indentation--;
            }
        });
    };

    tree(dirPath, (err, result) => {
        parseResult(result);
        console.log(output);
    });

};

main();
