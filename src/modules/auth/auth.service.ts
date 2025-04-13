import { ErrorCode } from "@/common/enums/error-code.enum";
import { RegisterDto } from "@/common/interface/auth.interface";
import { BadRequestException } from "@/common/utils/catch-errors";
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
}
