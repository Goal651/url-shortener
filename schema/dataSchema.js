const Joi = require('joi');

const validator = (schema) => (payload) =>
    schema.validate(payload, { abortEarly: false })

const userSchema = Joi.object({
    email: Joi.string().email()
});

const validateSignup = validator(userSchema)


module.exports = { validateSignup };