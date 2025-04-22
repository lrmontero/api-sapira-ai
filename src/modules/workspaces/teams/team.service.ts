import { Inject, Injectable } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';

import { Team } from './schemas/team.schema';

@Injectable()
export class TeamService {
	constructor(@Inject('TeamModelToken') private readonly teamModel: Model<Team>) {}

	async getTeamsByUser(params?): Promise<any> {
		const filters: FilterQuery<Team> = {};

		filters.isActive = true;
		const { limit = 10, offset = 0 } = params;
		const { userId, ownerStatus } = params;

		if (userId) {
			filters.user = userId;
		}

		if (ownerStatus) {
			filters.ownerStatus = ownerStatus;
		}

		const result = await this.teamModel
			.find(filters)
			.skip(offset)
			.limit(limit)
			.populate('user')
			.populate({
				path: 'role',
				populate: {
					path: 'permissions',
				},
			})
			.exec();

		return result;
	}
}
