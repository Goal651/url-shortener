const Joi = require('joi');

const validator = (schema) => (payload) =>
    schema.validate(payload, { abortEarly: false })

const userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    retypePassword: Joi.ref('password'),
});

const validateSignup = validator(userSchema)


module.exports = { validateSignup };