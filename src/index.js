import isEmpty from 'lodash.isempty';
import isString from 'lodash.isstring';
import isRegExp from 'lodash.isregexp';
import isObject from 'lodash.isobject';
import isFunction from 'lodash.isfunction';


const PLUGIN = 'babel-plugin-replace-imports';
const ERRORS = {
    0: 'options are required.',
    1: 'option is required.',
    2: 'option must be a RegExp.',
    3: 'option must be a String or a Function',
    4: 'options item must be an Object.',
};


export const optionLabels = {
    test: 'test',
    replacer: 'replacer',
};


export function getErrorMessage(code, text) {
    const msg = `${text ? `«${text}»` : ''} ${ERRORS[code]}`.trim();
    return `\n${PLUGIN}: ${msg}`;
};


function init({ types }) {
    function throwError(code, text) {
        const msg = getErrorMessage(code, text);
        throw new Error(msg);
    };

    function getOption(option) {
        if (!isObject(option) || isRegExp(option) || Array.isArray(option)) throwError(4);
        return option;
    };

    function getTestOption(option) {
        if (!isRegExp(option) && isEmpty(option)) throwError(1, optionLabels.test);
        if (!isRegExp(option)) throwError(2, optionLabels.test);
        return option;
    };

    function getReplacerListOption(option) {
        if (isFunction(option)) return [ option ];
        if (isEmpty(option)) throwError(1, optionLabels.replacer);
        return Array.isArray(option) ? option : [ option ];
    };

    function getReplacerOption(option) {
        if (!(isString(option) || isFunction(option))) throwError(3, optionLabels.replacer);
        return option;
    };

    return {
        visitor: {
            ImportDeclaration: (path, { opts }) => {
                const show = path.node.source.value.includes('test_123');
                if (show) {
                    console.log('-----------------------------------------');
                    console.log(path.node.source.value);
                    console.log(path.node.__processed);
                }

                if (path.node.__processed) return;
                if (isEmpty(opts)) throwError(0);

                const source = path.node.source.value;
                const transforms = [];
                let options = opts;

                if (!Array.isArray(options)) options = [ opts ];

                for (let i = 0; i < options.length; i++) {
                    const opt = getOption(options[i]);
                    const regex = getTestOption(opt[optionLabels.test]);

                    if (regex.test(source)) {
                        const replacerList = getReplacerListOption(opt[optionLabels.replacer]);

                        replacerList.forEach((replacer) => {
                            if (show) {
                                console.log('+++++++++++');
                            }
                            const repl = getReplacerOption(replacer);
                            const importDeclaration = types.importDeclaration(
                                path.node.specifiers,
                                types.stringLiteral(source.replace(regex, repl))
                            );
                            importDeclaration.__processed = true;
                            transforms.push(importDeclaration);
                        });

                        break;
                    }
                }

                if (transforms.length > 0) path.replaceWithMultiple(transforms);
            }
        }
    };
}


export default init;
