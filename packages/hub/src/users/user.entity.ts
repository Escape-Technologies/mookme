import { Exclude } from 'class-transformer';
import { Step } from 'src/steps/step.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column()
  key: string;

  @OneToMany(() => Step, (step) => step.owner)
  steps: Step[];
}
