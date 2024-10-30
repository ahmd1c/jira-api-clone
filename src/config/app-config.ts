export const corsConfig = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || origin === process.env.FRONTEND_URL)
      return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
};

export const validatorConfig = {
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};
