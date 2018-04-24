
exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists('uploads', (t) => {
            t.increments().primary()
            t.json('all_labels')
            t.string('url')
            t.timestamps()
        })
    ])
}

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('uploads')
    ])
}
