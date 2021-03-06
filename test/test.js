const babel = require('babel-core');
const assert = require('chai').assert;
const getErrorMessage = require('../lib').getErrorMessage;
const optionLabels = require('../lib').optionLabels;


const INPUT = `import 'test';`;


function babelTransform(options) {
    const babelOptions = { plugins: [ [ './lib' ] ] };
    if (options) babelOptions.plugins[0].push(options);
    return babel.transform(INPUT, babelOptions);
};


describe('Tests for options:', () => {
    it('should throw an error if there is no options parameter', () => {
        assert.throws(() => babelTransform(), getErrorMessage(0));
    });

    it('should throw an error if options parameter type is boolean', () => {
        const options = true;
        assert.throws(() => babelTransform(options), getErrorMessage(0));
    });

    it('should throw an error if options parameter is a regular expression', () => {
        const options = /.*/g;
        assert.throws(() => babelTransform(options), getErrorMessage(0));
    });

    it('should throw an error if options parameter is a number', () => {
        const options = 123;
        assert.throws(() => babelTransform(options), getErrorMessage(0));
    });

    it('should throw an error if options parameter is an empty list', () => {
        options = ''; // empty string is equal to empty list)
        assert.throws(() => babelTransform(options), getErrorMessage(0));
    });

    it('should throw an error if options parameter is an empty object', () => {
        options = {};
        assert.throws(() => babelTransform(options), getErrorMessage(0));
    });

    it('should throw an error if options item type is boolean', () => {
        const options = [ true ];
        assert.throws(() => babelTransform(options), getErrorMessage(4));
    });

    it('should throw an error if options item is a regular expression', () => {
        const options = [ /.*/g ];
        assert.throws(() => babelTransform(options), getErrorMessage(4));
    });

    it('should throw an error if options item is a string', () => {
        const options = [ 'test' ];
        assert.throws(() => babelTransform(options), getErrorMessage(4));
    });

    it('should throw an error if options item is a number', () => {
        const options = [ 123 ];
        assert.throws(() => babelTransform(options), getErrorMessage(4));
    });

    it('should throw an error if options item is a list', () => {
        const options = [ [] ];
        assert.throws(() => babelTransform(options), getErrorMessage(4));
    });

    it('should throw an error if «test» option is missing', () => {
        const options = [ {} ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.test));
    });

    it('should throw an error if «test» option is an empty list', () => {
        const options = [ { test: [] } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.test));
    });

    it('should throw an error if «test» option is an empty object', () => {
        const options = [ { test: {} } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.test));
    });

    it('should throw an error if «test» option type is boolean', () => {
        const options = [ { test: true } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.test));
    });

    it('should throw an error if «test» option is a number', () => {
        const options = [ { test: 123 } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.test));
    });

    it('should throw an error if «test» option is a string', () => {
        const options = [ { test: 'test'} ];
        assert.throws(() => babelTransform(options), getErrorMessage(2, optionLabels.test));
    });

    it('should throw an error if «test» option is an object', () => {
        const options = [ { test: { one: 1 } } ];
        assert.throws(() => babelTransform(options), getErrorMessage(2, optionLabels.test));
    });

    it('should throw an error if «replacer» option is missing', () => {
        const options = [ { test: /.*/g } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.replacer));
    });

    it('should throw an error if «replacer» option is an empty list', () => {
        const options = [ { test: /.*/g, replacer: [] } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.replacer));
    });

    it('should throw an error if «replacer» option is an empty object', () => {
        const options = [ { test: /.*/g, replacer: {} } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.replacer));
    });

    it('should throw an error if «replacer» option is a regular expression', () => {
        const options = [ { test: /.*/g, replacer: /.*/g } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.replacer));
    });

    it('should throw an error if «replacer» option is an object', () => {
        const options = [ { test: /.*/g, replacer: { one: 1 } } ];
        assert.throws(() => babelTransform(options), getErrorMessage(3, optionLabels.replacer));
    });

    it('should throw an error if «replacer» option type is boolean', () => {
        const options = [ { test: /.*/g, replacer: true } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.replacer));
    });

    it('should throw an error if «replacer» option is a number', () => {
        const options = [ { test: /.*/g, replacer: 123 } ];
        assert.throws(() => babelTransform(options), getErrorMessage(1, optionLabels.replacer));
    });

    it('should pass if «replacer» option is a function', () => {
        const options = [ { test: /.+/g, replacer: match => { return match } } ];
        assert.equal(babelTransform(options).code, INPUT);
    });
});


function getBabelTransformCode(input, options) {
    const babelOptions = { plugins: [ [ './lib' ] ] };
    babelOptions.plugins[0].push(options);
    return babel.transform(input, babelOptions).code;
};


describe('Functionality tests:', () => {
    it('only one replacement rule should be processed', () => {
        const input = `import styl from '../stylus/common.styl';`;
        const expected = `import styl from '../sass/common.styl';`;
        const options = [
            { test: /\/stylus\//, replacer: '/sass/' },
            { test: /\.styl/i, replacer: '$&?theme-red' }
        ];
        const output = getBabelTransformCode(input, options);
        assert.equal(output, expected);
    });
});
