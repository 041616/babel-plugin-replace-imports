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
                if (isEmpty(opts)) throwError(0);

                const source = path.node.source.value;
                const transforms = [];
                let options = opts;

                if (!Array.isArray(options)) options = [ opts ];

                options.forEach((option) => {
                    const opt = getOption(option);
                    const regex = getTestOption(opt[optionLabels.test]);

                    if (regex.test(source)) {
                        const replacerList = getReplacerListOption(opt[optionLabels.replacer]);

                        replacerList.forEach((replacer) => {
                            const repl = getReplacerOption(replacer);

                            transforms.push(types.importDeclaration(
                                path.node.specifiers,
                                types.stringLiteral(source.replace(regex, repl))
                            ));
                        });
                    }
                });

                if (transforms.length > 0) path.replaceWithMultiple(transforms);
            }
        }
    };
}


export default init;
