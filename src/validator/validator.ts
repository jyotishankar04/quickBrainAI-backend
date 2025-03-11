import zod from "zod";

const registerSetp1Validator = zod.object({
  email: zod.string().email(),
});

const registerVerificationValidator = zod.object({
  email: zod.string().email(),
  otp: zod.string(),
});

const registerCompletionValidator = zod
  .object({
    password: zod.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    confirmPassword: zod.string().min(6, {
      message: "Password must be at least 6 characters",
    }),
    name: zod.string().min(3, {
      message: "Name must be at least 3 characters",
    }),
    email: zod.string().email(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

const loginValidator = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export {
  registerSetp1Validator,
  registerVerificationValidator,
  registerCompletionValidator,
  loginValidator,
};
