const logger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.body}`);
    console.log('Headers:', req.headers);

    next();
};

module.exports = logger;