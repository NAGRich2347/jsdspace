const dspaceService = require('../services/dspaceService');

exports.uploadFile = async (req, res, next) => {
  try {
    const result = await dspaceService.uploadFile(req.body);
    res.status(200).json({ id: result.id });
  } catch (err) { next(err); }
};

exports.submitMetadata = async (req, res, next) => {
  try {
    await dspaceService.addMetadata(req.body.id, req.body.metadata);
    res.status(204).end();
  } catch (err) { next(err); }
};

exports.reviewSubmission = async (req, res, next) => {
  try {
    const data = await dspaceService.getSubmission(req.params.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
};

exports.publishSubmission = async (req, res, next) => {
  try {
    await dspaceService.publish(req.params.id);
    res.status(200).json({ published: true });
  } catch (err) { next(err); }
};