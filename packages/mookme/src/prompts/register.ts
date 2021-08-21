export const emailQuestion = {
  type: 'input',
  name: 'email',
  message: 'Please enter your email: ',
};

export const usernameQuestion = {
  type: 'input',
  name: 'username',
  message: 'Please enter your username: ',
};

export const passwordQuestion = {
  type: 'password',
  name: 'password',
  message: 'Your password: ',
  mask: '*',
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const passwordConfirmationQuestion = (password: string) => ({
  type: 'input',
  name: 'passwordConfirmation',
  message: 'Your password (confirmation): ',
  validate(value: string) {
    return value === password ? true : 'Password and confirmation do not match';
  },
  mask: '*',
});
