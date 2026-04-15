module.exports = {
  success(data, message = 'OK') {
    return { success: true, message, data };
  },
  error(message = 'Error', code = 400) {
    return { success: false, message, code };
  }
};
