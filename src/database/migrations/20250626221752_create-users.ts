import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table
      .uuid('id')
      .primary()
      .defaultTo(
        knex.raw(
          `(
            lower(
              hex(randomblob(4)) || '-' ||
              hex(randomblob(2)) || '-4' ||
              substr(hex(randomblob(2)), 2) || '-a' ||
              substr(hex(randomblob(2)), 2) || '-' ||
              hex(randomblob(6))
            )
          )`,
        ),
      );
    table.text('name').notNullable();
    table.text('email').notNullable();
    table.text('password').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
