const request = require("supertest");
const { app } = require("../src/app");

describe("Auth API Tests", () => {
  const baseUrl = "/api/tenant/auth"; 
  
  it("should return 200 for valid login with password", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login/password`)
      .send({
        email: process.env.USER_EMAIL_TEST,
        password: process.env.USER_EMAIL_PASSWORD_TEST,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tokens");
  });

  it("should return 500 or 401 for invalid login credentials", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login/password`)
      .send({
        email: "invaliduser@example.com",
        password: "WrongPassword",
      });

    expect([401, 500]).toContain(response.status);
  });

  it("should return 401 for invalid login with OTP", async () => {
    const response = await request(app)
      .post(`${baseUrl}/login/otp`)
      .send({
        email: "otpuser@example.com",
        otp: "123456",
      });

    expect(response.status).toBe(401);
  });

  it("should send OTP for login", async () => {
    const response = await request(app)
      .post(`${baseUrl}/send-otp`)
      .send({
        email: process.env.USER_EMAIL_TEST,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("OTP sent successfully via email");
  });

  it("should send a password reset link", async () => {
    const response = await request(app)
      .post(`${baseUrl}/forgot-password`)
      .send({
        email: process.env.USER_EMAIL_TEST,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Please check your inbox and follow the instructions to reset your password. If you don't see the email within a few minutes, please check your spam or junk folder"
    );
  });
});
