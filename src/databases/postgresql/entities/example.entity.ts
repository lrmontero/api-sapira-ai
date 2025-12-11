import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('example')
export class ExampleEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'company_id', nullable: true })
	company_id: string;

	@Column({ name: 'client_id', nullable: true })
	client_id: string;
}
