class regExp {
  static REG_QQ = /^\d{5,12}$/;
  static REG_MOBILE = /^1\d{10}$/;
  static REG_DECIMAL = /^\d{1,10}(\.\d*$|$)/;
  static REG_EMAIL = /^[\w.-]+@([\w-]+.)+[a-zA-Z]+$/;  
}

export default regExp;
