import { ErrorCode } from "@/common/enums/error-code.enum";
import { LoginDto, RegisterDto } from "@/common/interface/auth.interface";
import { BadRequestException } from "@/common/utils/catch-errors";
import { refreshTokenSignOptions, signJwtToken } from "@/common/utils/jwt";
import Session from "@/database/models/session.model";
import UserModel from "@/database/models/user.model";

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
}
