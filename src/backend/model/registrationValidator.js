"use strict";
const Joi = require("joi");
exports.registration = (body) => {
     const schema = Joi.object({
          username: Joi.string().required(),
          password: Joi.string().required(),
          email: Joi.string().required(),
          role:Joi.number().required()
     });
     const options = {
          abortEarly: false, // include all errors
          allowUnknown: true, // ignore unknown props
          stripUnknown: true // remove unknown props
     }
     const { error, value } = schema.validate(body, options);
     if (error) throw error;
     return value;
}