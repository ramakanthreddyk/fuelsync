const jwt = require('jsonwebtoken');

// General Authentication Middleware (verify token)
exports.authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    console.log('[AUTH] Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[AUTH] No token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user info (role, email, etc.)
        console.log('[AUTH] Token decoded:', decoded);
        next();
    } catch (err) {
        console.log('[AUTH] Invalid token:', err.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Role Check: Superadmin Only
exports.superadminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'superadmin') {
        console.log('[AUTH] Forbidden: Not superadmin');
        return res.status(403).json({ message: 'Forbidden: Superadmin only' });
    }
    next();
};

// Role Check: Owner Only (Optional)
exports.ownerOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'owner') {
        console.log('[AUTH] Forbidden: Not owner');
        return res.status(403).json({ message: 'Forbidden: Owner only' });
    }
    next();
};

// Role Check: Employee Only (Optional)
exports.employeeOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'employee') {
        console.log('[AUTH] Forbidden: Not employee');
        return res.status(403).json({ message: 'Forbidden: Employee only' });
    }
    next();
};