import { ErrorCode } from "@/common/enums/error-code.enum";
import { VerificationEnum } from "@/common/enums/verification-code.enum";
import { LoginDto, RegisterDto } from "@/common/interface/auth.interface";
import { BadRequestException } from "@/common/utils/catch-errors";
import { fortyFiveMinutesFromNow } from "@/common/utils/date-time";
import { refreshTokenSignOptions, signJwtToken } from "@/common/utils/jwt";
import { config } from "@/config/app.config";
import Session from "@/database/models/session.model";
import UserModel from "@/database/models/user.model";
import Verification from "@/database/models/verification.model";
import { sendEmail } from "@/mailers/mailer";
import { verifyEmailTemplate } from "@/mailers/templates/templates";

export class AuthService {
  public async register(registerData: RegisterDto) {
    const { name, email, password } = registerData;
    const user = await UserModel.exists({ email });
    if (user) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }
    const newUser = await UserModel.create({
      name,
      email,
      password,
    });
    const userId = newUser._id;

    //send verification code
    const verificationCode = await Verification.create({
      userId,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });
    // send email to user with verification code
    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verificationCode.code}`;

    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    return {
      user: newUser,
    };
  }

  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    const loginUser = await UserModel.findOne({ email });
    if (!loginUser) {
      throw new BadRequestException(
        "Invalid email or password",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }
    const isPasswordMatch = await loginUser.comparePassword(password);

    if (!isPasswordMatch) {
      throw new BadRequestException(
        "Invalid email or password",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    if (loginUser.userPreferences.enable2FA) {
      return {
        loginUser: null,
        accessToken: "",
        refreshToken: "",
        mfaRequired: true,
      };
    }
    const session = await Session.create({
      userId: loginUser._id,
      userAgent,
    });
    const accessToken = signJwtToken({
      userId: loginUser._id,
      sessionId: session._id,
    });
    const refreshToken = signJwtToken(
      { sessionId: session._id },
      refreshTokenSignOptions
    );
    return {
      loginUser,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async verifyEmail(code: string) {
    const validCode = await Verification.findOne({
      code: code,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: { $gt: new Date() },
    });

    if (!validCode) {
      throw new BadRequestException(
        "Invalid or expired verification code"
        // ErrorCode.AUTH_INVALID_VERIFICATION_CODE
      );
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      validCode.userId,
      {
        isEmailVerified: true,
      },
      { new: true }
    );
    if (!updatedUser) {
      throw new BadRequestException(
        "User not found",
        ErrorCode.VERIFICATION_ERROR
      );
    }
    // Delete the verification code after successful verification
    await Verification.deleteOne({ _id: validCode._id });

    // send success response
    return {
      user: updatedUser,
    };
  }
}
