import { User } from 'src/users/user.entity';

interface UserWithoutSensitive extends User {
  password: undefined;
}

export interface AuthenticatedRequest extends Request {
  user: UserWithoutSensitive;
}
