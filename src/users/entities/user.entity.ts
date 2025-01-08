// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  auth0UserId: string;

  @Column({ unique: true })
  username: string;

  @Column()
  displayName: string;

  @Column({ default: false })
  profileCompleted: boolean;

  @Column({ nullable: true })
  imageId: string;
}
