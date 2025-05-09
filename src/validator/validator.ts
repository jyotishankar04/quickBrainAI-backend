import zod from "zod";

const getErrorMessage = (error: zod.ZodError) => {
  const message = error.errors[0].message;
  return message;
};

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

// Notes Validator
const createNotesValidator = zod.object({
  noteTitle: zod.string().min(3, {
    message: "Title must be at least 3 characters",
  }),
  noteDescription: zod.string().min(3, {
    message: "Description must be at least 3 characters",
  }),
  noteCategory: zod
    .string()
    .min(3, {
      message: "Category must be at least 3 characters",
    })
    .optional(),
  isPrivate: zod.boolean().optional().default(false),
});
const updateNotesValidator = zod.object({
  noteTitle: zod
    .string()
    .min(3, {
      message: "Title must be at least 3 characters",
    })
    .optional(),
  noteDescription: zod
    .string()
    .min(3, {
      message: "Description must be at least 3 characters",
    })
    .optional(),
  noteCategory: zod.string().optional(),

  isPrivate: zod.boolean().optional().default(false),
});

const updateUserValidator = zod.object({
  name: zod
    .string()
    .min(3, {
      message: "Name must be at least 3 characters",
    })
    .optional(),
  username: zod
    .string()
    .min(3, {
      message: "Username must be at least 3 characters",
    })
    .optional(),
  bio: zod.string().optional(),
  location: zod.string().optional(),
  customUrl: zod.string().optional(),
  instagramUrl: zod.string().optional(),
  twitterUrl: zod.string().optional(),
  githubUrl: zod.string().optional(),
  linkedinUrl: zod.string().optional(),

  dob: zod.date().optional(),
  gender: zod.string().optional(),
});

export {
  getErrorMessage,
  registerSetp1Validator,
  registerVerificationValidator,
  registerCompletionValidator,
  loginValidator,
  createNotesValidator,
  updateNotesValidator,
  updateUserValidator,
};
