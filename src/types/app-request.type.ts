import { Request as ExpressRequest } from 'express';

import { UserDTO } from '@/modules/profiles/dtos/user.dto';

export type AppRequest = ExpressRequest & { user?: UserDTO };
