export type StudentLoginInput = {
  loginId: string;
  password: string;
  redirectTo?: string;
};

export type StudentLoginResult =
  | {
      success: true;
      member: {
        id: string;
        loginId: string;
        name: string;
      };
    }
  | {
      success: false;
      message: string;
    };
