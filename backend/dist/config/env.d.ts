declare const env: {
    NODE_ENV: "development" | "test" | "production";
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_ACCESS_TOKEN_TTL: string;
    JWT_REFRESH_TOKEN_TTL: string;
    PORT: number;
};
export type Env = typeof env;
export default env;
//# sourceMappingURL=env.d.ts.map