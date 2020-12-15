import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const gqlContext = GqlExecutionContext.create(ctx).getContext();
  return gqlContext['user'];
});
