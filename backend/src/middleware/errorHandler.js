export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  console.error(err.stack);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large.' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size exceeds limit.' });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation.' });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({ error: message });
}
