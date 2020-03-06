class UserAlreadyExistsError extends Error {
    constructor() {
        super('USER ALREADY EXISTS');
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidUserError extends Error {
    constructor() {
        super('INVALID USERNAME OR PASSWORD');
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidTokenError extends Error {
    constructor() {
        super('INVALID TOKEN');
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

exports.UserAlreadyExistsError = UserAlreadyExistsError;
exports.InvalidUserError = InvalidUserError;
exports.InvalidTokenError = InvalidTokenError;