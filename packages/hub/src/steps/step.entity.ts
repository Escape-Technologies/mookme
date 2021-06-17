import { IsNotEmpty, IsString } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from 'typeorm';

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

  protected content: StepContent;

  @AfterLoad()
  getParsedContent() {
    this.content = JSON.parse(this.rawContent) as StepContent;
  }
}
