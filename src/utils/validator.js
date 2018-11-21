import RegExp from './regexp';

class Validator {
  static isMobile(str = '') {
    return RegExp.REG_MOBILE.test(str);
  }

  static isEmail(str = '') {
    return RegExp.REG_EMAIL.test(str);
  }
}

export default RegExp;
