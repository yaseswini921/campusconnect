export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ message: error.message || 'The request could not be processed.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that information already exists.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'The requested identifier is invalid.' });
  }
  return res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error.message
  });
}
