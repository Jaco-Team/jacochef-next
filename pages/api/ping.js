export default (req, res) =>
  res.status(200).json({
    ok: true,
    revision: process.env.APP_BUILD_SHA || "development",
  });
