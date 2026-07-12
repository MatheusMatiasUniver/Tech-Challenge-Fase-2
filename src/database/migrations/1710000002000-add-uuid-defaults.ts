import { type MigrationInterface, QueryRunner } from 'typeorm'

export class AddUuidDefaults1710000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    await queryRunner.query(
      'ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()',
    )
    await queryRunner.query(
      'ALTER TABLE "posts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()',
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "posts" ALTER COLUMN "id" DROP DEFAULT',
    )
    await queryRunner.query(
      'ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT',
    )
  }
}
