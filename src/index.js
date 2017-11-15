const { isFunction, isObject, isArray, isRegExp, isEmpty, isString } = require('lodash');


const pluginName = 'babel-plugin-replace-imports';
const optionLabels = {
    test: 'test',
    replacer: 'replacer',
};
const errorMessages = {
    0: 'options are required.',
    1: 'option is required.',
    2: 'option must be a RegExp.',
    3: 'option must be a String or a Function',
    4: 'options item must be an Object.',
}


function init({ types }) {
    function throwError(code, text) {
        const msg = `${text ? `«${text}»` : ''} ${errorMessages[code]}`.trim();
        throw new Error(`\n${pluginName}: ${msg}`);
    };

    function getOption(option) {
        if (!isObject(option)) throwError(code=4);
        return option;
    };

    function getTestOption(option) {
        if (!isRegExp(option) && isEmpty(option)) throwError(code=1, optionLabels.test);
        if (!isRegExp(option)) throwError(code=2, optionLabels.test);
        return option;
    };

    function getReplacerListOption(option) {
        if (isEmpty(option)) throwError(code=1, optionLabels.replacer);
        return isArray(option) ? option : [option];
    };

    function getReplacerOption(option) {
        if (!(isString(option) || isFunction(option))) throwError(code=3, optionLabels.replacer);
        return option;
    };

    return {
        visitor: {
            ImportDeclaration: function (path, { opts }) {
                if (isEmpty(opts)) throwError(code=0);

                const source = path.node.source.value;
                const transforms = [];
                let options = opts;

                if (!isArray(options)) options = [opts];

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

module.exports = init;
