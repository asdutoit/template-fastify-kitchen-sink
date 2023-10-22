import S from "fluent-json-schema";

const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const bodyJsonSchema = S.object()
  .prop("email", S.string().format(S.FORMATS.EMAIL).required())
  .prop("password", S.string().minLength(8).required());

export const SharedUserSchema = {
  body: bodyJsonSchema,
};
