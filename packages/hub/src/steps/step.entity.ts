import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/users/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterLoad,
  ManyToOne,
} from 'typeorm';

export class StepContent {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  command: string;

  @IsString()
  onlyOn?: string;
}

@Entity()
export class Step {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rawContent: string;

  @ManyToOne(() => User, (user) => user.steps)
  owner: User;

  protected content: StepContent;

  @AfterLoad()
  getParsedContent() {
    this.content = JSON.parse(this.rawContent) as StepContent;
  }
}
