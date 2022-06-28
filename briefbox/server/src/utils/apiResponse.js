const ok = (res, data, message, status = 200) =>
  res.status(status).json({ success: true, data, message });

const fail = (res, message, status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { ok, fail };
